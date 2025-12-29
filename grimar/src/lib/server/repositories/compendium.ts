import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq, sql, desc, like, or, and, inArray } from 'drizzle-orm';
import { MemoryCache, CacheKeys, getCacheTTL } from '$lib/server/cache';
import { measureDb } from '$lib/server/monitoring';
import { CompendiumQueryParser, type QueryOptions } from './CompendiumQueryParser';

export interface PaginationOptions {
	limit?: number;
	offset?: number;
	search?: string;
	sortBy?: 'name' | 'source' | 'created_at' | 'spellLevel' | 'spellSchool';
	sortOrder?: 'asc' | 'desc';
	filterLogic?: 'and' | 'or';
	filters?: {
		spellLevel?: number[];
		spellSchool?: string[];
	};
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
	hasMore: boolean;
	hasPrevious: boolean;
	totalPages: number;
	currentPage: number;
}

/**
 * Compendium Repository
 *
 * Handles database operations for compendium items.
 * Now uses modular components for query parsing and data transformation.
 */
export class CompendiumRepository {
	private cache = MemoryCache.getInstance();

	/**
	 * Get paginated compendium items
	 * @param type The type of compendium items
	 * @param options Query options
	 * @returns Paginated result of items
	 */
	async getPaginatedItems(
		type: string,
		options: QueryOptions = {}
	): Promise<PaginatedResult<typeof compendiumItems.$inferSelect>> {
		// Check cache first
		const cacheKey = CacheKeys.compendiumList(type, options);
		const cached = this.cache.get<PaginatedResult<typeof compendiumItems.$inferSelect>>(cacheKey);
		if (cached) {
			console.info('[compendium-repo] Cache hit for', type);
			return cached;
		}
		console.info('[compendium-repo] Cache miss for', type, '- fetching from DB');

		const db = await measureDb('compendium_db_connection', () => getDb());

		// Apply filters and sorting
		const whereClause = this.buildWhereClause(type, options);
		const orderClause = this.buildOrderClause(options);

		console.info('[compendium-repo] Querying with type:', type);

		// Get total count efficiently using $count() instead of loading all rows
		const total = await db.$count(compendiumItems, whereClause);
		console.info('[compendium-repo] Total items matching type:', total);

		// Get paginated items
		const items = await db
			.select()
			.from(compendiumItems)
			.where(whereClause)
			.orderBy(orderClause)
			.limit(options.limit || 50)
			.offset(options.offset || 0);

		const totalPages = Math.ceil(total / (options.limit || 50));
		const currentPage = Math.floor((options.offset || 0) / (options.limit || 50)) + 1;
		const hasMore = currentPage < totalPages;

		const result = {
			items,
			total,
			limit: options.limit || 50,
			offset: options.offset || 0,
			hasMore,
			hasPrevious: (options.offset || 0) > 0,
			totalPages,
			currentPage
		};

		// Cache result
		this.cache.set(cacheKey, result, getCacheTTL('compendium'));

		return result;
	}

	/**
	 * Get a single compendium item
	 * @param type The type of item
	 * @param id The ID of item
	 * @returns The item or null if not found
	 */
	async getItem(
		type: string,
		id: string | number
	): Promise<typeof compendiumItems.$inferSelect | null> {
		const cacheKey = CacheKeys.compendiumItem(type, String(id));

		// Check cache first
		const cached = this.cache.get<typeof compendiumItems.$inferSelect>(cacheKey);
		if (cached) {
			return cached;
		}

		const db = await getDb();

		let item;
		if (typeof id === 'string') {
			// Search by external ID
			item = await db
				.select()
				.from(compendiumItems)
				.where(and(eq(compendiumItems.type, type), eq(compendiumItems.externalId, id)))
				.limit(1);
		} else {
			// Search by internal ID
			item = await db
				.select()
				.from(compendiumItems)
				.where(and(eq(compendiumItems.type, type), eq(compendiumItems.id, id)))
				.limit(1);
		}

		const result = item.length > 0 ? item[0] : null;

		// Cache result
		if (result) {
			this.cache.set(cacheKey, result, getCacheTTL('compendium'));
		}

		return result;
	}

	/**
	 * Get normalized compendium items with transformation applied
	 * @param type The type of items
	 * @param options Query options
	 * @returns Paginated result of normalized items
	 */
	async getNormalizedItems<T = typeof compendiumItems.$inferSelect>(
		type: string,
		options: QueryOptions = {}
	): Promise<PaginatedResult<T>> {
		const result = await this.getPaginatedItems(type, options);

		// Transform each item - for now just return the raw items
		const transformedItems = result.items.map((item) => item as T);

		return {
			...result,
			items: transformedItems
		};
	}

	/**
	 * Get a normalized compendium item with transformation applied
	 * @param type The type of item
	 * @param id The ID of item
	 * @returns The normalized item or null if not found
	 */
	async getNormalizedItem<T = typeof compendiumItems.$inferSelect>(
		type: string,
		id: string | number
	): Promise<T | null> {
		const item = await this.getItem(type, id);
		if (!item) {
			return null;
		}

		return item as T;
	}

	/**
	 * Search compendium items using FTS for fast search
	 * Falls back to LIKE if FTS returns no results
	 * @param type The type of items
	 * @param query Search query
	 * @returns Array of matching items
	 */
	async searchItems(type: string, query: string): Promise<(typeof compendiumItems.$inferSelect)[]> {
		const cacheKey = CacheKeys.compendiumSearch(type, query);

		// Check cache first
		const cached = this.cache.get<(typeof compendiumItems.$inferSelect)[]>(cacheKey);
		if (cached) {
			return cached;
		}

		const db = await getDb();

		let items: (typeof compendiumItems.$inferSelect)[];

		try {
			// Try FTS search first (much faster than LIKE)
			const { searchFts } = await import('$lib/server/db/fts');
			const ftsIds = await searchFts(query, 50);

			if (ftsIds.length > 0) {
				// Fetch items by FTS rowids, filtered by type
				items = await db
					.select()
					.from(compendiumItems)
					.where(
						and(eq(compendiumItems.type, type), sql`${compendiumItems.id} IN (${ftsIds.join(',')})`)
					);
			} else {
				// Fallback to LIKE if FTS finds nothing
				items = await db
					.select()
					.from(compendiumItems)
					.where(
						and(
							eq(compendiumItems.type, type),
							or(
								like(compendiumItems.name, `%${query}%`),
								like(compendiumItems.summary || '', `%${query}%`)
							)
						)
					)
					.limit(20);
			}
		} catch {
			// If FTS fails (not initialized), fall back to LIKE
			items = await db
				.select()
				.from(compendiumItems)
				.where(
					and(
						eq(compendiumItems.type, type),
						or(
							like(compendiumItems.name, `%${query}%`),
							like(compendiumItems.summary || '', `%${query}%`)
						)
					)
				)
				.limit(20);
		}

		// Cache result
		this.cache.set(cacheKey, items, getCacheTTL('search'));

		return items;
	}

	/**
	 * Build WHERE clause from query options
	 * @param type The type of items
	 * @param options Query options
	 * @returns WHERE clause
	 */
	private buildWhereClause(type: string, options: QueryOptions) {
		// Base condition: always filter by type
		const baseCondition = eq(compendiumItems.type, type);

		// Collect filter conditions
		const filterConditions = [];

		// Spell level filter
		if (options.filters?.spellLevel && options.filters.spellLevel.length > 0) {
			filterConditions.push(inArray(compendiumItems.spellLevel, options.filters.spellLevel));
		}

		// Spell school filter
		if (options.filters?.spellSchool && options.filters.spellSchool.length > 0) {
			filterConditions.push(inArray(compendiumItems.spellSchool, options.filters.spellSchool));
		}

		// Monster type filter
		if (options.filters?.type && options.filters.type.length > 0) {
			filterConditions.push(inArray(compendiumItems.monsterType, options.filters.type));
		}

		// Monster size filter
		if (options.filters?.monsterSize && options.filters.monsterSize.length > 0) {
			filterConditions.push(inArray(compendiumItems.monsterSize, options.filters.monsterSize));
		}

		// Apply filter logic (AND/OR) between categories
		let filterClause = undefined;
		if (filterConditions.length > 0) {
			filterClause =
				options.filterLogic === 'or' ? or(...filterConditions) : and(...filterConditions);
		}

		// Apply Search (always AND)
		let searchClause = undefined;
		if (options.search) {
			const searchTerm = `%${options.search}%`;
			searchClause = or(
				like(compendiumItems.name, searchTerm),
				like(compendiumItems.summary || '', searchTerm)
			);
		}

		// Combine all parts: Type AND (Filters) AND (Search)
		const whereParts = [baseCondition];
		if (filterClause) whereParts.push(filterClause);
		if (searchClause) whereParts.push(searchClause);

		return and(...whereParts) as any;
	}

	/**
	 * Build ORDER BY clause from query options
	 * @param options Query options
	 * @returns ORDER BY clause
	 */
	private buildOrderClause(options: QueryOptions) {
		const sortBy = options.sortBy || 'name';
		const sortOrder = options.sortOrder || 'asc';

		// Handle challenge rating special sorting (fractional values like "1/2", "1/4")
		if (sortBy === 'challengeRating') {
			// Use a custom sort order that properly handles CR fractions
			return sql`
				CASE
					WHEN ${compendiumItems.challengeRating} = '0' THEN 0
					WHEN ${compendiumItems.challengeRating} = '1/8' THEN 1
					WHEN ${compendiumItems.challengeRating} = '1/4' THEN 2
					WHEN ${compendiumItems.challengeRating} = '1/2' THEN 3
					ELSE CAST(${compendiumItems.challengeRating} AS REAL)
				END ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}
			`;
		}

		// Map sortBy to column references
		// Use proper Drizzle column references for type safety
		switch (sortBy) {
			case 'spellLevel':
				return sortOrder === 'desc' ? desc(compendiumItems.spellLevel) : compendiumItems.spellLevel;
			case 'spellSchool':
				return sortOrder === 'desc'
					? desc(compendiumItems.spellSchool)
					: sql`${compendiumItems.spellSchool} COLLATE NOCASE`;
			case 'monsterSize':
				return sortOrder === 'desc'
					? desc(compendiumItems.monsterSize)
					: sql`${compendiumItems.monsterSize} COLLATE NOCASE`;
			case 'monsterType':
				return sortOrder === 'desc'
					? desc(compendiumItems.monsterType)
					: sql`${compendiumItems.monsterType} COLLATE NOCASE`;
			case 'name':
			default:
				return sortOrder === 'desc'
					? desc(compendiumItems.name)
					: sql`${compendiumItems.name} COLLATE NOCASE`;
		}
	}

	/**
	 * Invalidate cache for a specific type
	 * @param type The type of items to invalidate
	 */
	invalidateCache(type: string): void {
		// Invalidate all cache entries for this type
		this.cache.invalidatePattern(`compendium:list:${type}:.*`);
		this.cache.invalidatePattern(`compendium:search:${type}:.*`);
		this.cache.delete(CacheKeys.compendiumCount(type));
	}

	/**
	 * Invalidate all compendium cache
	 */
	invalidateAllCache(): void {
		// Invalidate all cache entries
		this.cache.invalidatePattern('compendium:list:.*');
		this.cache.invalidatePattern('compendium:search:.*');
		this.cache.invalidatePattern('compendium:count:.*');
	}
}

// Export a singleton instance
export const compendiumRepository = new CompendiumRepository();

// Legacy functions for backward compatibility
export const getPaginatedCompendiumItems = (type: string, options: QueryOptions = {}) =>
	compendiumRepository.getPaginatedItems(type, options);

export const parsePaginationQuery = (url: URL) => CompendiumQueryParser.parseQuery(url);

export const invalidateCompendiumCache = (type: string) =>
	compendiumRepository.invalidateCache(type);

export const invalidateAllCompendiumCache = () => compendiumRepository.invalidateAllCache();
