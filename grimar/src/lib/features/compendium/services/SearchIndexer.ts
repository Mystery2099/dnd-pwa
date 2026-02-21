import Fuse, { type IFuseOptions } from 'fuse.js';
import type { CompendiumItem } from '$lib/core/types/compendium';

// Debug logging helper for client-side
function debugLog(...args: unknown[]) {
	if (typeof console !== 'undefined' && console.debug) {
		console.debug('[SearchIndexer]', ...args);
	}
}

/**
 * SearchIndexer service for full-text search across compendium items.
 * Uses Fuse.js for fuzzy matching and relevance scoring.
 */
export class SearchIndexer<T extends CompendiumItem> {
	private fuse: Fuse<T> | null = null;
	private items: T[] = [];
	private indexedCount = 0;

	/**
	 * Configuration for Fuse.js search
	 */
	private readonly fuseOptions: IFuseOptions<T> = {
		// Keys to search across
		keys: [
			{ name: 'name', weight: 2 }, // Name is most important
			{ name: 'description', weight: 1.5 }, // Description is second
			{ name: 'data', weight: 1 } // Data is least important
		],
		// Fuzzy matching threshold (0.0 = exact match, 1.0 = match anything)
		threshold: 0.4,
		// Distance between characters for fuzzy matching
		distance: 100,
		// Minimum character length before fuzzy matching kicks in
		minMatchCharLength: 2,
		// Include score in results for debugging
		includeScore: true,
		// Include matched indices for highlighting (future feature)
		includeMatches: false,
		// Use extended search for advanced queries
		useExtendedSearch: false,
		// Ignore location of match in string
		ignoreLocation: true
	};

	/**
	 * Build the search index from an array of items
	 */
	buildIndex(items: T[]): void {
		this.items = items;
		this.fuse = new Fuse(items, this.fuseOptions);
		this.indexedCount = items.length;
		debugLog('Index built with', items.length, 'items');
	}

	/**
	 * Search the index with a query string
	 * Returns items sorted by relevance
	 */
	search(query: string): T[] {
		if (!this.fuse || !query.trim()) {
			debugLog('Search - no index or empty query, returning all items:', this.items.length);
			return this.items;
		}

		const startTime = performance.now();
		const results = this.fuse.search(query);
		const duration = performance.now() - startTime;
		debugLog(
			'Search query:',
			query,
			'- found',
			results.length,
			'results in',
			duration.toFixed(2),
			'ms'
		);
		return results.map((result) => result.item);
	}

	/**
	 * Get all items (no search applied)
	 */
	getAll(): T[] {
		return this.items;
	}

	/**
	 * Check if index is built
	 */
	isIndexed(): boolean {
		const ready = this.fuse !== null;
		debugLog('Index status:', ready, '- items:', this.indexedCount);
		return ready;
	}

	/**
	 * Clear the index
	 */
	clear(): void {
		debugLog('Clearing index - was holding', this.indexedCount, 'items');
		this.fuse = null;
		this.items = [];
		this.indexedCount = 0;
	}
}
