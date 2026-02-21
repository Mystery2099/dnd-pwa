import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { page } from '$app/state';
import { SvelteSet, SvelteURL } from 'svelte/reactivity';

import type { CompendiumFilterConfig } from '$lib/core/types/compendium/filter';
import { SearchIndexer } from '$lib/features/compendium/services/SearchIndexer';
import type { CompendiumItem } from '$lib/core/types/compendium';
import { settingsStore } from '$lib/core/client/settingsStore.svelte';
import { userSettingsStore } from '$lib/core/client/userSettingsStore.svelte';

// Debug logging helper
function debugLog(...args: unknown[]) {
	if (typeof console !== 'undefined' && console.debug) {
		console.debug('[CompendiumFilterStore]', ...args);
	}
}

export class CompendiumFilterStore {
	// State using Svelte 5 runes
	state = $state({
		searchTerm: '',
		sortBy: 'name',
		sortOrder: 'asc' as 'asc' | 'desc',
		// dynamic sets keyed by the internal names defined in config
		sets: {} as Record<string, Set<string>>
	});

	private config: CompendiumFilterConfig;
	private searchIndexer = new SearchIndexer<CompendiumItem>();
	private allItems: CompendiumItem[] = [];

	constructor(config: CompendiumFilterConfig) {
		this.config = config;

		// Initialize empty sets for all configured keys
		Object.values(config.setParams).forEach((key) => {
			this.state.sets[key] = new SvelteSet();
		});

		// Apply defaults if provided
		if (config.defaults?.sortBy) {
			this.state.sortBy = config.defaults.sortBy;
		}
		if (config.defaults?.sortOrder) {
			this.state.sortOrder = config.defaults.sortOrder;
		}

		if (browser) {
			const url = new SvelteURL(window.location.href);
			this.syncWithUrl(url);
		}
	}

	// -- Getters --

	get searchTerm(): string {
		return this.state.searchTerm;
	}

	get sortBy(): string {
		return this.state.sortBy;
	}

	get sortOrder(): 'asc' | 'desc' {
		return this.state.sortOrder;
	}

	get hasActiveFilters(): boolean {
		const hasSets = Object.values(this.state.sets).some((set) => set.size > 0);
		return hasSets || this.state.searchTerm !== '';
	}

	// Get a specific set by its internal key (e.g. 'level')
	getSet(key: string): SvelteSet<string> {
		return new SvelteSet(this.state.sets[key]);
	}

	// -- Actions --

	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.updateUrl();
	}

	setSort(sortBy: string, sortOrder: 'asc' | 'desc') {
		// Validate sortBy if validSortBy is configured
		if (this.config.validSortBy && !this.config.validSortBy.includes(sortBy)) {
			console.error(
				'[CompendiumFilterStore] Invalid sortBy:',
				sortBy,
				'Valid options:',
				this.config.validSortBy
			);
			return;
		}

		// Validate sortOrder
		if (!['asc', 'desc'].includes(sortOrder)) {
			console.error('[CompendiumFilterStore] Invalid sortOrder:', sortOrder);
			return;
		}

		debugLog('Setting sort:', sortBy, sortOrder);
		this.state.sortBy = sortBy;
		this.state.sortOrder = sortOrder;
		this.updateUrl();
	}

	toggle(key: string, value: string) {
		if (!this.state.sets[key]) {
			console.warn(
				`[CompendiumFilterStore] Unknown filter key: ${key}. Available: ${Object.keys(this.state.sets)}`
			);
			return;
		}

		const next = new SvelteSet(this.state.sets[key]);
		if (next.has(value)) {
			next.delete(value);
		} else {
			next.add(value);
		}
		this.state.sets[key] = next;
		this.updateUrl();
	}

	clearFilters() {
		this.state.searchTerm = '';
		Object.keys(this.state.sets).forEach((key) => {
			this.state.sets[key] = new SvelteSet();
		});
		this.updateUrl();
	}

	/**
	 * Build search index from items.
	 * Should be called when items are loaded or updated.
	 */
	buildSearchIndex(items: CompendiumItem[]) {
		this.allItems = items;
		this.searchIndexer.buildIndex(items);
	}

	/**
	 * Apply current filters and sorting to a list of items.
	 */
	apply<T extends Record<string, any>>(items: T[]): T[] {
		const startTime = performance.now();

		// Store items for search indexing if they're CompendiumItems
		if (items.length > 0 && 'key' in items[0]) {
			this.buildSearchIndex(items as unknown as CompendiumItem[]);
		}

		let filtered = items;

		// 0. A5e content filter - hide Advanced 5e content by default
		if (!userSettingsStore.data.showA5eContent) {
			filtered = filtered.filter((item) => {
				// Check if this is an A5e item (key ends with -a5e and source is open5e)
				const itemKey = item.key as string;
				const source = item.source as string;
				return !(source === 'open5e' && itemKey.endsWith('-a5e'));
			});
			debugLog('A5e filter applied:', filtered.length, 'items remaining');
		}

		// 1. Search filter with full-text search
		if (this.state.searchTerm && this.searchIndexer.isIndexed()) {
			const searchResults = this.searchIndexer.search(this.state.searchTerm);
			const searchIds = new SvelteSet(searchResults.map((item) => item.key));
			filtered = filtered.filter((item) => searchIds.has(item.key));
			debugLog('Search filter applied:', this.state.searchTerm, '- results:', filtered.length);
		}

		// 2. Faceted filters
		const activeFilterKeys = Object.values(this.config.setParams).filter(
			(key) => this.state.sets[key] && this.state.sets[key].size > 0
		);

		if (activeFilterKeys.length > 0) {
			debugLog('Applying faceted filters:', activeFilterKeys);
			filtered = filtered.filter((item) => {
				const matches = activeFilterKeys.map((key) => {
					const set = this.state.sets[key];
					const val = item[key];
					if (Array.isArray(val)) {
						return val.some((v) => set.has(String(v)));
					}
					return set.has(String(val));
				});

				// Always use AND logic - all filters must match
				return matches.every((m) => m);
			});
			debugLog('After faceted filters:', filtered.length, 'items');
		}

		// 3. Sorting
		const sortBy = this.state.sortBy;
		const sortOrder = this.state.sortOrder;

		filtered = [...filtered].sort((a, b) => {
			const valA = a[sortBy];
			const valB = b[sortBy];

			if (valA == null) return 1;
			if (valB == null) return -1;

			if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		const duration = performance.now() - startTime;
		debugLog(
			'Filter apply completed:',
			items.length,
			'->',
			filtered.length,
			'items in',
			duration.toFixed(2),
			'ms'
		);

		return filtered;
	}

	// -- Sync Logic --

	public syncWithUrl(url: URL | SvelteURL) {
		this.state.searchTerm = url.searchParams.get('search') || '';
		this.state.sortBy = url.searchParams.get('sortBy') || this.config.defaults?.sortBy || 'name';
		this.state.sortOrder = (url.searchParams.get('sortOrder') ||
			this.config.defaults?.sortOrder ||
			'asc') as 'asc' | 'desc';

		for (const [param, key] of Object.entries(this.config.setParams)) {
			const val = url.searchParams.get(param);
			if (val) {
				this.state.sets[key] = new SvelteSet(val.split(',').filter(Boolean));
			} else {
				this.state.sets[key] = new SvelteSet();
			}
		}
	}

	// Serialize current state for sessionStorage
	serialize(): {
		searchTerm: string;
		sortBy: string;
		sortOrder: 'asc' | 'desc';
		sets: Record<string, string[]>;
	} {
		return {
			searchTerm: this.state.searchTerm,
			sortBy: this.state.sortBy,
			sortOrder: this.state.sortOrder,
			sets: Object.fromEntries(Object.entries(this.state.sets).map(([k, v]) => [k, Array.from(v)]))
		};
	}

	// Restore state from serialized object
	deserialize(data: ReturnType<this['serialize']>) {
		this.state.searchTerm = data.searchTerm;
		this.state.sortBy = data.sortBy;
		this.state.sortOrder = data.sortOrder;

		for (const [key, values] of Object.entries(data.sets)) {
			this.state.sets[key] = new SvelteSet(values);
		}
	}

	private updateUrl() {
		if (!browser) return;

		const url = new SvelteURL(page.url);

		// Search
		if (this.state.searchTerm) {
			url.searchParams.set('search', this.state.searchTerm);
		} else {
			url.searchParams.delete('search');
		}

		// Sort (only write if not default)
		const defaultSortBy = this.config.defaults?.sortBy || 'name';
		const defaultSortOrder = this.config.defaults?.sortOrder || 'asc';

		if (this.state.sortBy !== defaultSortBy) {
			url.searchParams.set('sortBy', this.state.sortBy);
		} else {
			url.searchParams.delete('sortBy');
		}

		if (this.state.sortOrder !== defaultSortOrder) {
			url.searchParams.set('sortOrder', this.state.sortOrder);
		} else {
			url.searchParams.delete('sortOrder');
		}

		// Sets
		for (const [param, key] of Object.entries(this.config.setParams)) {
			const set = this.state.sets[key];
			if (set && set.size > 0) {
				url.searchParams.set(param, Array.from(set).join(','));
			} else {
				url.searchParams.delete(param);
			}
		}

		// Reset pagination
		url.searchParams.delete('offset');

		// Navigate
		if (url.pathname + url.search !== page.url.pathname + page.url.search) {
			void goto(url.pathname + url.search, {
				replaceState: true,
				noScroll: true,
				invalidateAll: true
			});
		}
	}
}
