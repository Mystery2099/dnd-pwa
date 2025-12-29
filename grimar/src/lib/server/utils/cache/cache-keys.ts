/**
 * Cache Keys
 *
 * Utilities for generating consistent cache keys.
 */

import type { CacheOptions } from './cache-types';

// Default values to normalize before key generation
const DEFAULTS: Required<CacheOptions> = {
	sortBy: 'name',
	sortOrder: 'asc',
	filterLogic: 'or',
	offset: 0,
	limit: 50,
	search: '',
	levels: '',
	schools: ''
};

/**
 * Normalize options by removing defaults to reduce cache misses
 */
function normalizeOptions(options: CacheOptions): string {
	const normalized: Record<string, unknown> = {};

	// Only include non-default values
	for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
		const value = (options as Record<string, unknown>)[key];
		if (value !== undefined && value !== defaultValue) {
			normalized[key] = value;
		}
	}

	// If no meaningful differences, return empty object marker
	return Object.keys(normalized).length > 0 ? JSON.stringify(normalized) : '{}';
}

export const CacheKeys = {
	compendiumList: (type: string, options: CacheOptions) =>
		`compendium:list:${type}:${normalizeOptions(options)}`,
	compendiumItem: (type: string, id: string) => `compendium:item:${type}:${id}`,
	compendiumSearch: (type: string, query: string) => `compendium:search:${type}:${query}`,
	compendiumCount: (type: string) => `compendium:count:${type}`
};
