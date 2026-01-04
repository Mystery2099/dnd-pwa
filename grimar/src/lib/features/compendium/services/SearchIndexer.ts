import Fuse, { type IFuseOptions } from 'fuse.js';
import type { CompendiumItem } from '$lib/core/types/compendium';

/**
 * SearchIndexer service for full-text search across compendium items.
 * Uses Fuse.js for fuzzy matching and relevance scoring.
 */
export class SearchIndexer<T extends CompendiumItem> {
	private fuse: Fuse<T> | null = null;
	private items: T[] = [];

	/**
	 * Configuration for Fuse.js search
	 */
	private readonly fuseOptions: IFuseOptions<T> = {
		// Keys to search across
		keys: [
			{ name: 'name', weight: 2 }, // Name is most important
			{ name: 'summary', weight: 1.5 }, // Summary is second
			{ name: 'details', weight: 1 } // Details are least important
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
	}

	/**
	 * Search the index with a query string
	 * Returns items sorted by relevance
	 */
	search(query: string): T[] {
		if (!this.fuse || !query.trim()) {
			return this.items;
		}

		const results = this.fuse.search(query);
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
		return this.fuse !== null;
	}

	/**
	 * Clear the index
	 */
	clear(): void {
		this.fuse = null;
		this.items = [];
	}
}

