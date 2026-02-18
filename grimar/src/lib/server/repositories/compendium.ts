import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq, sql, desc, like, or, and, inArray } from 'drizzle-orm';
import { MemoryCache, CacheKeys, getCacheTTL } from '$lib/server/utils/cache';
import { measureDb } from '$lib/server/utils/monitoring';
import { CompendiumQueryParser, type QueryOptions } from './CompendiumQueryParser';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumRepository');

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
			log.debug({ type, cacheKey }, 'Cache hit');
			return cached;
		}
		log.debug({ type, cacheKey }, 'Cache miss - fetching from DB');

		const db = await measureDb('compendium_db_connection', () => getDb());

		// Apply filters and sorting
		const whereClause = this.buildWhereClause(type, options);
		const orderClause = this.buildOrderClause(options);

		log.debug({ type }, 'Querying database');

		// Get total count efficiently using $count() instead of loading all rows
		const total = await db.$count(compendiumItems, whereClause);
		log.debug({ type, total }, 'Total items matching type');

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
			log.debug({ type, id, cacheKey }, 'Cache hit - item found');
			return cached;
		}
		log.debug({ type, id, cacheKey }, 'Cache miss - fetching from DB');

		const db = await getDb();

		let item;
		if (typeof id === 'string') {
			// Search by external ID
			log.debug({ type, externalId: id }, 'Querying by external ID');
			item = await db
				.select()
				.from(compendiumItems)
				.where(and(eq(compendiumItems.type, type), eq(compendiumItems.externalId, id)))
				.limit(1);
		} else {
			// Search by internal ID
			log.debug({ type, internalId: id }, 'Querying by internal ID');
			item = await db
				.select()
				.from(compendiumItems)
				.where(and(eq(compendiumItems.type, type), eq(compendiumItems.id, id)))
				.limit(1);
		}

		const result = item.length > 0 ? item[0] : null;

		if (result) {
			log.debug({ type, id, found: true }, 'Item found in database');
			// Cache result
			this.cache.set(cacheKey, result, getCacheTTL('compendium'));
		} else {
			log.debug({ type, id }, 'Item not found in database');
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
			log.debug({ type, query, cacheKey, resultCount: cached.length }, 'Search cache hit');
			return cached;
		}
		log.debug({ type, query, cacheKey }, 'Search cache miss');

		const db = await getDb();

		let items: (typeof compendiumItems.$inferSelect)[];

		try {
			// Try FTS search first (much faster than LIKE)
			const { searchFts } = await import('$lib/server/db/db-fts');
			const ftsIds = await searchFts(query, 50);

			if (ftsIds.length > 0) {
				log.debug({ query, ftsResultCount: ftsIds.length }, 'FTS search successful');
				// Fetch items by FTS rowids, filtered by type - use inArray for type safety
				items = await db
					.select()
					.from(compendiumItems)
					.where(and(eq(compendiumItems.type, type), inArray(compendiumItems.id, ftsIds)));
			} else {
				// Fallback to LIKE if FTS finds nothing
				log.info({ query }, 'FTS returned no results, falling back to LIKE');
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
		} catch (error) {
			// If FTS fails (not initialized), fall back to LIKE
			log.warn({ query, error }, 'FTS search failed, falling back to LIKE');
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

		log.debug({ query, resultCount: items.length }, 'Search completed');
		// Cache result
		this.cache.set(cacheKey, items, getCacheTTL('search'));

		return items;
	}

	/**
	 * Build WHERE clause from query options
	 * Uses JSON extraction from the details column for type-specific filters
	 * @param type The type of items
	 * @param options Query options
	 * @returns WHERE clause
	 */
	private buildWhereClause(type: string, options: QueryOptions) {
		// Base condition: always filter by type
		const baseCondition = eq(compendiumItems.type, type);

		// Collect filter conditions - properly typed for Drizzle
		const filterConditions: ReturnType<typeof and>[] = [];

		// Spell level filter (from details JSON)
		if (options.filters?.spellLevel && options.filters.spellLevel.length > 0) {
			const levelConditions = options.filters.spellLevel.map((level) =>
				sql`json_extract(${compendiumItems.details}, '$.level') = ${level}`
			);
			filterConditions.push(or(...levelConditions));
		}

		// Spell school filter (from details JSON)
		if (options.filters?.spellSchool && options.filters.spellSchool.length > 0) {
			const schoolConditions = options.filters.spellSchool.map((school) =>
				sql`json_extract(${compendiumItems.details}, '$.school') = ${school}`
			);
			filterConditions.push(or(...schoolConditions));
		}

		// Creature type filter (from details JSON)
		if (options.filters?.type && options.filters.type.length > 0) {
			const typeConditions = options.filters.type.map((t) =>
				sql`json_extract(${compendiumItems.details}, '$.type') = ${t}`
			);
			filterConditions.push(or(...typeConditions));
		}

		// Creature size filter (from details JSON)
		if (options.filters?.creatureSize && options.filters.creatureSize.length > 0) {
			const sizeConditions = options.filters.creatureSize.map((size) =>
				sql`json_extract(${compendiumItems.details}, '$.size') = ${size}`
			);
			filterConditions.push(or(...sizeConditions));
		}

		// Apply filter logic (AND/OR) between categories
		let filterClause: ReturnType<typeof and> | undefined = undefined;
		if (filterConditions.length > 0) {
			filterClause =
				options.filterLogic === 'or' ? or(...filterConditions) : and(...filterConditions);
		}

		// Apply Search (always AND)
		let searchClause: ReturnType<typeof or> | undefined = undefined;
		if (options.search) {
			const searchTerm = `%${options.search}%`;
			searchClause = or(
				like(compendiumItems.name, searchTerm),
				like(compendiumItems.summary || '', searchTerm)
			);
		}

		// Combine all parts: Type AND (Filters) AND (Search)
		const whereParts: ReturnType<typeof and>[] = [baseCondition];
		if (filterClause) whereParts.push(filterClause);
		if (searchClause) whereParts.push(and(baseCondition, searchClause));

		return and(...whereParts);
	}

	/**
	 * Build ORDER BY clause from query options
	 * Uses JSON extraction from the details column for type-specific sorting
	 * @param options Query options
	 * @returns ORDER BY clause
	 */
	private buildOrderClause(options: QueryOptions) {
		const sortBy = options.sortBy || 'name';
		const sortOrder = options.sortOrder || 'asc';

		// Handle challenge rating special sorting (fractional values like "1/2", "1/4")
		if (sortBy === 'challengeRating') {
			// Use a custom sort order that properly handles CR fractions from JSON
			return sql`
				CASE
					WHEN json_extract(${compendiumItems.details}, '$.challenge_rating') = '0' THEN 0
					WHEN json_extract(${compendiumItems.details}, '$.challenge_rating') = '1/8' THEN 1
					WHEN json_extract(${compendiumItems.details}, '$.challenge_rating') = '1/4' THEN 2
					WHEN json_extract(${compendiumItems.details}, '$.challenge_rating') = '1/2' THEN 3
					ELSE CAST(json_extract(${compendiumItems.details}, '$.challenge_rating') AS REAL)
				END ${sortOrder === 'desc' ? sql`DESC` : sql`ASC`}
			`;
		}

		// Map sortBy to column references
		// Use proper Drizzle column references for type safety
		switch (sortBy) {
			case 'spellLevel':
				return sortOrder === 'desc'
					? desc(sql`json_extract(${compendiumItems.details}, '$.level')`)
					: sql`json_extract(${compendiumItems.details}, '$.level')`;
			case 'spellSchool':
				return sortOrder === 'desc'
					? desc(sql`json_extract(${compendiumItems.details}, '$.school')`)
					: sql`json_extract(${compendiumItems.details}, '$.school') COLLATE NOCASE`;
			case 'creatureSize':
				return sortOrder === 'desc'
					? desc(sql`json_extract(${compendiumItems.details}, '$.size')`)
					: sql`json_extract(${compendiumItems.details}, '$.size') COLLATE NOCASE`;
			case 'creatureType':
				return sortOrder === 'desc'
					? desc(sql`json_extract(${compendiumItems.details}, '$.type')`)
					: sql`json_extract(${compendiumItems.details}, '$.type') COLLATE NOCASE`;
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

	/**
	 * Create a new homebrew item
	 * @param data The homebrew item data
	 * @param username The creator's username
	 * @returns The ID of the created item
	 */
	async createHomebrewItem(
		data: {
			type: string;
			name: string;
			summary: string;
			details: Record<string, unknown>;
			jsonData: string;
			externalId?: string;
		},
		username: string
	): Promise<number> {
		const db = await getDb();
		const result = await db.insert(compendiumItems).values({
			source: 'homebrew',
			type: data.type,
			externalId: data.externalId || `homebrew_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
			name: data.name,
			summary: data.summary,
			details: data.details,
			jsonData: data.jsonData,
			sourcePublisher: 'homebrew',
			sourceBook: username,
			createdBy: username
		}).returning({ id: compendiumItems.id });

		this.invalidateCache(data.type);
		log.info({ itemId: result[0].id, username, type: data.type }, 'Created homebrew item');
		return result[0].id;
	}

	/**
	 * Update a homebrew item (ownership or admin check required)
	 * @param id The item ID
	 * @param data The updated data
	 * @param username The user's username
	 * @param role The user's role
	 * @returns True if updated, false if not authorized or not found
	 */
	async updateHomebrewItem(
		id: number,
		data: Partial<{
			name: string;
			summary: string;
			details: Record<string, unknown>;
			jsonData: string;
		}>,
		username: string,
		role: 'user' | 'admin'
	): Promise<boolean> {
		const db = await getDb();

		// Check ownership or admin
		const item = await db
			.select()
			.from(compendiumItems)
			.where(eq(compendiumItems.id, id))
			.limit(1);

		if (item.length === 0) {
			log.warn({ id }, 'Homebrew item not found');
			return false;
		}

		const existingItem = item[0];
		if (existingItem.source !== 'homebrew') {
			log.warn({ id }, 'Item is not a homebrew item');
			return false;
		}

		if (role !== 'admin' && existingItem.createdBy !== username) {
			log.warn({ id, username, role }, 'Not authorized to update this item');
			return false;
		}

		// Build update values
		const updateData: Record<string, unknown> = {};
		if (data.name !== undefined) updateData.name = data.name;
		if (data.summary !== undefined) updateData.summary = data.summary;
		if (data.details !== undefined) updateData.details = data.details;
		if (data.jsonData !== undefined) updateData.jsonData = data.jsonData;

		await db
			.update(compendiumItems)
			.set(updateData)
			.where(eq(compendiumItems.id, id));

		this.invalidateCache(existingItem.type);
		log.info({ itemId: id, username }, 'Updated homebrew item');
		return true;
	}

	/**
	 * Delete a homebrew item (ownership or admin check required)
	 * @param id The item ID
	 * @param username The user's username
	 * @param role The user's role
	 * @returns True if deleted, false if not authorized or not found
	 */
	async deleteHomebrewItem(
		id: number,
		username: string,
		role: 'user' | 'admin'
	): Promise<boolean> {
		const db = await getDb();

		// Check ownership or admin
		const item = await db
			.select()
			.from(compendiumItems)
			.where(eq(compendiumItems.id, id))
			.limit(1);

		if (item.length === 0) {
			log.warn({ id }, 'Homebrew item not found');
			return false;
		}

		const existingItem = item[0];
		if (existingItem.source !== 'homebrew') {
			log.warn({ id }, 'Item is not a homebrew item');
			return false;
		}

		if (role !== 'admin' && existingItem.createdBy !== username) {
			log.warn({ id, username, role }, 'Not authorized to delete this item');
			return false;
		}

		await db.delete(compendiumItems).where(eq(compendiumItems.id, id));

		this.invalidateCache(existingItem.type);
		log.info({ itemId: id, username }, 'Deleted homebrew item');
		return true;
	}

	/**
	 * Get user's homebrew items
	 * @param username The user's username
	 * @returns Array of homebrew items
	 */
	async getUserHomebrewItems(username: string): Promise<typeof compendiumItems.$inferSelect[]> {
		const db = await getDb();
		return db
			.select()
			.from(compendiumItems)
			.where(
				and(
					eq(compendiumItems.source, 'homebrew'),
					eq(compendiumItems.createdBy, username)
				)
			)
			.orderBy(desc(compendiumItems.id));
	}

	/**
	 * Get all homebrew items (visible to all users)
	 * @returns Array of all homebrew items
	 */
	async getAllHomebrewItems(): Promise<typeof compendiumItems.$inferSelect[]> {
		const db = await getDb();
		return db
			.select()
			.from(compendiumItems)
			.where(eq(compendiumItems.source, 'homebrew'))
			.orderBy(desc(compendiumItems.id));
	}

	/**
	 * Get homebrew item by internal ID
	 * @param id The item ID
	 * @returns The item or null if not found
	 */
	async getHomebrewItemById(id: number): Promise<typeof compendiumItems.$inferSelect | null> {
		const db = await getDb();
		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(eq(compendiumItems.id, id), eq(compendiumItems.source, 'homebrew')))
			.limit(1);
		return items.length > 0 ? items[0] : null;
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

export const createHomebrewItem = compendiumRepository.createHomebrewItem.bind(compendiumRepository);
export const updateHomebrewItem = compendiumRepository.updateHomebrewItem.bind(compendiumRepository);
export const deleteHomebrewItem = compendiumRepository.deleteHomebrewItem.bind(compendiumRepository);
export const getUserHomebrewItems = compendiumRepository.getUserHomebrewItems.bind(compendiumRepository);
export const getAllHomebrewItems = compendiumRepository.getAllHomebrewItems.bind(compendiumRepository);
export const getHomebrewItemById = compendiumRepository.getHomebrewItemById.bind(compendiumRepository);
