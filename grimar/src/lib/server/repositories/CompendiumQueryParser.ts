export type { URL } from 'url';

import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumQueryParser');

/**
 * Query filter options for compendium items
 */
export interface QueryFilters {
	spellLevel?: number[];
	spellSchool?: string[];
	source?: string[];
	type?: string[];
	monsterSize?: string[];
}

/**
 * Query options for compendium items
 */
export interface QueryOptions {
	limit?: number;
	offset?: number;
	search?: string;
	sortBy?:
		| 'name'
		| 'source'
		| 'created_at'
		| 'spellLevel'
		| 'spellSchool'
		| 'challengeRating'
		| 'monsterSize'
		| 'monsterType';
	sortOrder?: 'asc' | 'desc';
	filterLogic?: 'and' | 'or';
	filters?: QueryFilters;
}

/**
 * Compendium Query Parser
 *
 * Handles parsing of URL parameters into structured query options.
 * Separated from the repository to maintain single responsibility.
 */
export class CompendiumQueryParser {
	/**
	 * Parse URL parameters into query options
	 * @param url The URL to parse
	 * @param defaultOptions Default options to merge with
	 * @returns Parsed query options
	 */
	static parseQuery(url: URL, defaultOptions: Partial<QueryOptions> = {}): QueryOptions {
		log.debug(
			{ originalParams: url.searchParams.toString(), defaultOptions },
			'Parsing query options'
		);

		const params = url.searchParams;

		// Parse pagination options
		const limitRaw = params.get('limit') || defaultOptions.limit?.toString() || '50';
		const limit = Math.min(parseInt(limitRaw), 100); // Max 100 per page
		if (parseInt(limitRaw) > 100) {
			log.warn({ rawLimit: limitRaw, clampedTo: limit }, 'Limit exceeded maximum, clamping to 100');
		}

		const offset = parseInt(params.get('offset') || defaultOptions.offset?.toString() || '0');

		// Parse search term
		const search = params.get('search') || defaultOptions.search || undefined;

		// Parse sort options
		const sortBy = (params.get('sortBy') ||
			defaultOptions.sortBy ||
			'name') as QueryOptions['sortBy'];

		const sortOrder = (params.get('sortOrder') || defaultOptions.sortOrder || 'asc') as
			| 'asc'
			| 'desc';

		// Parse filter logic
		const filterLogic = (params.get('logic') || defaultOptions.filterLogic || 'and') as
			| 'and'
			| 'or';

		// Parse filters
		const filters: QueryFilters = {
			...defaultOptions.filters,
			spellLevel: this.parseSpellLevels(params.get('levels') || undefined),
			spellSchool: this.parseCSV(params.get('schools') || undefined),
			source: this.parseCSV(params.get('sources') || undefined),
			type: this.parseCSV(params.get('types') || undefined),
			monsterSize: this.parseCSV(params.get('sizes') || undefined)
		};

		const result = {
			limit,
			offset,
			search,
			sortBy,
			sortOrder,
			filterLogic,
			filters
		};

		log.debug({ parsed: result }, 'Query options parsed successfully');
		return result;
	}

	/**
	 * Parse spell levels from a parameter string
	 * @param levelsParam The levels parameter (e.g., "1,2,Cantrip")
	 * @returns Array of numeric spell levels
	 */
	private static parseSpellLevels(levelsParam: string | undefined): number[] | undefined {
		if (!levelsParam) return undefined;

		return levelsParam
			.split(',')
			.map((level) => {
				// Handle special case for Cantrip (level 0)
				if (level === 'Cantrip' || level === 'cantrip') return 0;

				// Handle ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
				if (/^\d+(st|nd|rd|th)$/.test(level)) {
					return parseInt(level.replace(/\D/g, ''));
				}

				// Handle plain numbers
				const num = parseInt(level);
				return isNaN(num) ? undefined : num;
			})
			.filter((level): level is number => level !== undefined && !isNaN(level));
	}

	/**
	 * Parse a comma-separated value parameter
	 * @param csvParam The CSV parameter
	 * @returns Array of strings or undefined if empty
	 */
	private static parseCSV(csvParam: string | undefined): string[] | undefined {
		if (!csvParam) return undefined;

		return csvParam
			.split(',')
			.map((value) => value.trim())
			.filter((value) => value.length > 0);
	}

	/**
	 * Convert query options back to URL parameters
	 * @param options Query options to convert
	 * @returns URLSearchParams object
	 */
	static toSearchParams(options: QueryOptions): URLSearchParams {
		const params = new URLSearchParams();

		log.debug({ options }, 'Converting query options to URL params');

		// Add pagination params
		if (options.limit && options.limit !== 50) {
			params.set('limit', options.limit.toString());
		}

		if (options.offset && options.offset !== 0) {
			params.set('offset', options.offset.toString());
		}

		// Add search param
		if (options.search) {
			params.set('search', options.search);
		}

		// Add sort params
		if (options.sortBy && options.sortBy !== 'name') {
			params.set('sortBy', options.sortBy);
		}

		if (options.sortOrder && options.sortOrder !== 'asc') {
			params.set('sortOrder', options.sortOrder);
		}

		// Add filter logic
		if (options.filterLogic && options.filterLogic !== 'and') {
			params.set('logic', options.filterLogic);
		}

		// Add filters
		if (options.filters?.spellLevel && options.filters.spellLevel.length > 0) {
			const levels = options.filters.spellLevel.map((level) =>
				level === 0 ? 'Cantrip' : level.toString()
			);
			params.set('levels', levels.join(','));
		}

		if (options.filters?.spellSchool && options.filters.spellSchool.length > 0) {
			params.set('schools', options.filters.spellSchool.join(','));
		}

		if (options.filters?.source && options.filters.source.length > 0) {
			params.set('sources', options.filters.source.join(','));
		}

		if (options.filters?.type && options.filters.type.length > 0) {
			params.set('types', options.filters.type.join(','));
		}

		if (options.filters?.monsterSize && options.filters.monsterSize.length > 0) {
			params.set('sizes', options.filters.monsterSize.join(','));
		}

		log.debug({ params: params.toString() }, 'URL params generated');
		return params;
	}

	/**
	 * Create a URL with query parameters from options
	 * @param baseUrl Base URL
	 * @param options Query options
	 * @returns Full URL with query parameters
	 */
	static createUrl(baseUrl: string, options: QueryOptions): string {
		const url = new URL(baseUrl);
		const params = this.toSearchParams(options);

		// Add all parameters to the URL
		for (const [key, value] of params.entries()) {
			url.searchParams.set(key, value);
		}

		return url.toString();
	}

	/**
	 * Compare two query options to see if they're equivalent
	 * @param a First query options
	 * @param b Second query options
	 * @returns True if they're equivalent
	 */
	static areEqual(a: QueryOptions, b: QueryOptions): boolean {
		return JSON.stringify(a) === JSON.stringify(b);
	}

	/**
	 * Create a copy of query options with modifications
	 * @param original Original query options
	 * @param changes Changes to apply
	 * @returns New query options
	 */
	static modify(original: QueryOptions, changes: Partial<QueryOptions>): QueryOptions {
		return {
			...original,
			filters: {
				...original.filters,
				...changes.filters
			},
			...changes
		};
	}
}
