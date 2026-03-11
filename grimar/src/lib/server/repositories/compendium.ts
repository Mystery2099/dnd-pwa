import { eq, and, sql, like, or, desc, inArray, type SQL } from 'drizzle-orm';
import { getDb } from '../db/index';
import { searchFtsRanked } from '../db/db-fts';
import { compendium, type CompendiumItem, type CompendiumType } from '../db/schema';
import { MemoryCache, getCacheTTL } from '$lib/server/utils/cache';

export type { CompendiumType } from '../db/schema';

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasMore: boolean;
}

export interface FilterOptions {
	search?: string;
	gamesystem?: string;
	document?: string;
	source?: string;
	includeSubclasses?: boolean;
	onlySubclasses?: boolean;
	sortBy?: 'name' | 'created_at' | 'updated_at';
	sortOrder?: 'asc' | 'desc';
	/** Creature type filter (applied via json_extract on data column) */
	creatureType?: string;
	/** Spell level filter (applied via json_extract on data column) */
	spellLevel?: number;
	/** Spell school filter (applied via json_extract on data column) */
	spellSchool?: string;
	/** Challenge rating filter (applied via json_extract on data column) */
	challengeRating?: number;
}

const FTS_SEARCH_LIMIT = 5000;
const COMPENDIUM_COUNTS_CACHE_KEY = 'compendium:counts:all';
const cache = MemoryCache.getInstance();

function buildListCacheKey(
	type: CompendiumType,
	page: number,
	pageSize: number,
	filters: FilterOptions
): string {
	const normalizedFilters = Object.entries(filters)
		.filter(([, value]) => value !== undefined && value !== null && value !== '')
		.sort(([a], [b]) => a.localeCompare(b));
	return `compendium:list:${type}:${page}:${pageSize}:${JSON.stringify(normalizedFilters)}`;
}

function buildItemCacheKey(type: CompendiumType, key: string): string {
	return `compendium:item:${type}:${key}`;
}

function invalidateCompendiumCaches(type?: CompendiumType): void {
	if (type) {
		cache.invalidatePattern(`compendium:*:${type}:*`);
		cache.invalidatePattern(`compendium:distinct:*:${type}`);
		cache.invalidatePattern(COMPENDIUM_COUNTS_CACHE_KEY);
		return;
	}

	cache.invalidatePattern('compendium:*');
	cache.invalidatePattern(COMPENDIUM_COUNTS_CACHE_KEY);
}

export async function getPaginatedItems(
	type: CompendiumType,
	options: {
		page?: number;
		pageSize?: number;
		maxPageSize?: number;
		skipTotalCount?: boolean;
		filters?: FilterOptions;
	}
): Promise<PaginatedResult<CompendiumItem>> {
	const db = await getDb();
	const page = options.page ?? 1;
	const requestedPageSize = options.pageSize ?? 50;
	const pageSize =
		options.maxPageSize === undefined
			? requestedPageSize
			: Math.min(requestedPageSize, options.maxPageSize);
	const offset = (page - 1) * pageSize;
	const filters = options.filters ?? {};
	const listCacheKey = buildListCacheKey(type, page, pageSize, filters);

	const cachedResult = cache.get<PaginatedResult<CompendiumItem>>(listCacheKey);
	if (cachedResult) {
		return cachedResult;
	}

	let whereClause: SQL<unknown> = eq(compendium.type, type);
	let useLikeSearchFallback = false;
	let rankedMatches: Array<{ key: string; rank: number }> | null = null;
	let ftsMatchedKeys: string[] | null = null;

	if (filters.search) {
		try {
			rankedMatches = await searchFtsRanked(filters.search, FTS_SEARCH_LIMIT, db);
			ftsMatchedKeys = rankedMatches.map((match) => match.key);
		} catch (e) {
			console.error('searchFtsRanked failed for filters.search', { search: filters.search, error: e });
			useLikeSearchFallback = true;
		}
	}

	if (filters.gamesystem) {
		whereClause = and(whereClause, eq(compendium.gamesystemKey, filters.gamesystem))!;
	}

	if (filters.document) {
		whereClause = and(whereClause, eq(compendium.documentKey, filters.document))!;
	}

	if (filters.source) {
		whereClause = and(whereClause, eq(compendium.source, filters.source))!;
	}

	if (type === 'classes') {
		if (filters.onlySubclasses === true) {
			whereClause = and(whereClause, sql`json_extract(${compendium.data}, '$.subclass_of') IS NOT NULL`)!;
		} else if (filters.includeSubclasses === false) {
			whereClause = and(whereClause, sql`json_extract(${compendium.data}, '$.subclass_of') IS NULL`)!;
		}
	}

	if (filters.creatureType) {
		whereClause = and(
			whereClause,
			sql`LOWER(json_extract(${compendium.data}, '$.type')) = LOWER(${filters.creatureType})`
		)!;
	}

	if (filters.spellLevel !== undefined) {
		whereClause = and(
			whereClause,
			sql`json_extract(${compendium.data}, '$.level') = ${filters.spellLevel}`
		)!;
	}

	if (filters.spellSchool) {
		whereClause = and(
			whereClause,
			sql`LOWER(json_extract(${compendium.data}, '$.school')) = LOWER(${filters.spellSchool})`
		)!;
	}

	if (filters.challengeRating !== undefined) {
		whereClause = and(
			whereClause,
			sql`json_extract(${compendium.data}, '$.challenge_rating_decimal') = ${filters.challengeRating}`
		)!;
	}

	if (filters.search) {
		if (useLikeSearchFallback) {
			const searchTerm = `%${filters.search}%`;
			whereClause = and(
				whereClause,
				or(like(compendium.name, searchTerm), like(compendium.description, searchTerm))
			)!;
		} else if (ftsMatchedKeys && ftsMatchedKeys.length > 0) {
			whereClause = and(whereClause, inArray(compendium.key, ftsMatchedKeys))!;
		} else {
			return {
				items: [],
				total: 0,
				page,
				pageSize,
				totalPages: 0,
				hasMore: false
			};
		}
	}

	const sortBy = filters.sortBy ?? 'name';
	const sortOrder = filters.sortOrder ?? 'asc';
	const sortColumn =
		sortBy === 'created_at'
			? compendium.createdAt
			: sortBy === 'updated_at'
					? compendium.updatedAt
					: compendium.name;
	const orderBy = sortOrder === 'desc' ? desc(sortColumn) : sortColumn;

	if (filters.search && !useLikeSearchFallback && rankedMatches && rankedMatches.length > 0) {
		const rankCases = rankedMatches.map((match, index) =>
			sql`WHEN ${compendium.key} = ${match.key} THEN ${index}`
		);
		const rankOrder = sql<number>`CASE ${sql.join(rankCases, sql.raw(' '))} ELSE ${rankedMatches.length} END`;
		const items = await db
			.select()
			.from(compendium)
			.where(whereClause)
			.orderBy(rankOrder, orderBy)
			.limit(pageSize)
			.offset(offset);
		const total = Number(
			(
				await db
					.select({ count: sql<number>`count(*)` })
					.from(compendium)
					.where(whereClause)
			)[0]?.count ?? 0
		);
		const totalPages = Math.ceil(total / pageSize);
		const result = {
			items,
			total,
			page,
			pageSize,
			totalPages,
			hasMore: page < totalPages
		};

		cache.set(listCacheKey, result, getCacheTTL('search'));
		return result;
	}

	const items = await db
		.select()
		.from(compendium)
		.where(whereClause)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset(offset);

	const canInferTotalFromItems = options.skipTotalCount && page === 1 && items.length < pageSize;
	const total = canInferTotalFromItems
		? items.length
		: Number(
				(
					await db
						.select({ count: sql<number>`count(*)` })
						.from(compendium)
						.where(whereClause)
				)[0]?.count ?? 0
			);
	const totalPages = Math.ceil(total / pageSize);

	const result = {
		items,
		total,
		page,
		pageSize,
		totalPages,
		hasMore: page < totalPages
	};
	cache.set(listCacheKey, result, getCacheTTL(filters.search ? 'search' : 'compendium'));
	return result;
}

export async function getItem(type: CompendiumType, key: string): Promise<CompendiumItem | null> {
	const db = await getDb();
	const itemCacheKey = buildItemCacheKey(type, key);
	const cachedItem = cache.get<CompendiumItem>(itemCacheKey);
	if (cachedItem) {
		return cachedItem;
	}

	const results = await db
		.select()
		.from(compendium)
		.where(and(eq(compendium.type, type), eq(compendium.key, key)))
		.limit(1);

	const item = results[0] ?? null;
	if (item) {
		cache.set(itemCacheKey, item, getCacheTTL('compendium'));
	}
	return item;
}

export async function searchItems(
	type: CompendiumType,
	query: string,
	options?: { limit?: number; includeSubclasses?: boolean; onlySubclasses?: boolean }
): Promise<CompendiumItem[]> {
	const db = await getDb();
	const limit = options?.limit ?? 50;
	const searchTerm = `%${query}%`;
	let whereClause: SQL<unknown> = and(
		eq(compendium.type, type),
		or(like(compendium.name, searchTerm), like(compendium.description, searchTerm))
	)!;

	if (type === 'classes') {
		if (options?.onlySubclasses === true) {
			whereClause = and(whereClause, sql`json_extract(${compendium.data}, '$.subclass_of') IS NOT NULL`)!;
		} else if (options?.includeSubclasses === false) {
			whereClause = and(whereClause, sql`json_extract(${compendium.data}, '$.subclass_of') IS NULL`)!;
		}
	}

	const results = await db
		.select()
		.from(compendium)
		.where(whereClause)
		.orderBy(compendium.name)
		.limit(limit);

	return results;
}

export async function searchAll(
	query: string,
	options?: { limit?: number; types?: CompendiumType[] }
): Promise<CompendiumItem[]> {
	const db = await getDb();
	const limit = options?.limit ?? 50;
	const searchTerm = `%${query}%`;

	let whereClause: SQL<unknown> = or(
		like(compendium.name, searchTerm),
		like(compendium.description, searchTerm)
	)!;

	if (options?.types?.length) {
		whereClause = and(whereClause, inArray(compendium.type, options.types))!;
	}

	const results = await db
		.select()
		.from(compendium)
		.where(whereClause)
		.orderBy(compendium.name)
		.limit(limit);

	return results;
}

export async function createItem(
	data: Omit<CompendiumItem, 'createdAt' | 'updatedAt'>
): Promise<CompendiumItem> {
	const db = await getDb();
	const now = new Date();

	const [item] = await db
		.insert(compendium)
		.values({
			...data,
			createdAt: now,
			updatedAt: now
			})
			.returning();

	invalidateCompendiumCaches(data.type as CompendiumType);
	return item;
}

export async function updateItem(
	type: CompendiumType,
	key: string,
	data: Partial<Omit<CompendiumItem, 'key' | 'createdAt'>>
): Promise<CompendiumItem | null> {
	const db = await getDb();
	const now = new Date();

	const [item] = await db
		.update(compendium)
		.set({
			...data,
			updatedAt: now
		})
			.where(and(eq(compendium.type, type), eq(compendium.key, key)))
			.returning();

	invalidateCompendiumCaches(type);
	return item ?? null;
}


export async function deleteItem(type: CompendiumType, key: string): Promise<boolean> {
	const db = await getDb();
	const result = await db
		.delete(compendium)
		.where(and(eq(compendium.type, type), eq(compendium.key, key)))
		.returning();
	invalidateCompendiumCaches(type);
	return result.length > 0;
}

export async function getItemsBySource(source: string): Promise<CompendiumItem[]> {
	const db = await getDb();
	return db.select().from(compendium).where(eq(compendium.source, source));
}

export async function getItemsByType(type: CompendiumType): Promise<CompendiumItem[]> {
	const db = await getDb();
	return db.select().from(compendium).where(eq(compendium.type, type));
}

export async function getTypeCounts(): Promise<Record<string, number>> {
	const db = await getDb();
	const cachedCounts = cache.get<Record<string, number>>(COMPENDIUM_COUNTS_CACHE_KEY);
	if (cachedCounts) {
		return cachedCounts;
	}

	const results = await db
		.select({
			type: compendium.type,
			count: sql<number>`count(*)`
		})
		.from(compendium)
		.groupBy(compendium.type);

	const counts = Object.fromEntries(
		results.map((r: { type: string; count: number }) => [r.type, Number(r.count)])
	) as Record<string, number>;

	const [baseClasses, subclasses] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(compendium)
			.where(
				and(
					eq(compendium.type, 'classes'),
					sql`json_extract(${compendium.data}, '$.subclass_of') IS NULL`
				)
			),
		db
			.select({ count: sql<number>`count(*)` })
			.from(compendium)
			.where(
				and(
					eq(compendium.type, 'classes'),
					sql`json_extract(${compendium.data}, '$.subclass_of') IS NOT NULL`
				)
			)
	]);

	counts.classes = Number(baseClasses[0]?.count ?? 0);
	counts.subclasses = Number(subclasses[0]?.count ?? 0);

	cache.set(COMPENDIUM_COUNTS_CACHE_KEY, counts, getCacheTTL('compendium'));
	return counts;
}

export async function getDistinctValues(
	field: 'gamesystemKey' | 'documentKey' | 'publisherKey' | 'source',
	type?: CompendiumType
): Promise<string[]> {
	const distinctCacheKey = `compendium:distinct:${field}:${type ?? 'all'}`;
	const cachedValues = cache.get<string[]>(distinctCacheKey);
	if (cachedValues) {
		return cachedValues;
	}

	const db = await getDb();
	const column = compendium[field];

	let query = db
		.selectDistinct({ value: column })
		.from(compendium)
		.where(sql`${column} IS NOT NULL`);

	if (type) {
		query = db
			.selectDistinct({ value: column })
			.from(compendium)
			.where(and(eq(compendium.type, type), sql`${column} IS NOT NULL`));
	}

	const results = await query.orderBy(column);
	const values = results
		.map((r: { value: string | null }) => r.value)
		.filter((v): v is string => v !== null);
	cache.set(distinctCacheKey, values, getCacheTTL('compendium'));
	return values;
}

export async function clearType(type: CompendiumType): Promise<number> {
	const db = await getDb();
	const result = await db.delete(compendium).where(eq(compendium.type, type)).returning();
	invalidateCompendiumCaches(type);
	return result.length;
}

export async function clearSource(source: string): Promise<number> {
	const db = await getDb();
	const result = await db.delete(compendium).where(eq(compendium.source, source)).returning();
	invalidateCompendiumCaches();
	return result.length;
}

export async function bulkInsert(
	items: Omit<CompendiumItem, 'createdAt' | 'updatedAt'>[]
): Promise<number> {
	if (items.length === 0) return 0;

	const db = await getDb();
	const now = new Date();

	const itemsWithTimestamps = items.map((item) => ({
		...item,
		createdAt: now,
		updatedAt: now
	}));

	const result = await db.insert(compendium).values(itemsWithTimestamps).returning();
	const types = new Set(items.map((item) => item.type as CompendiumType));
	if (types.size === 1) {
		invalidateCompendiumCaches(types.values().next().value);
	} else {
		invalidateCompendiumCaches();
	}
	return result.length;
}

export async function upsertItem(
	data: Omit<CompendiumItem, 'createdAt' | 'updatedAt'>
): Promise<CompendiumItem> {
	const db = await getDb();
	const now = new Date();

	const [item] = await db
		.insert(compendium)
		.values({
			...data,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoUpdate({
			target: [compendium.type, compendium.key],
			set: {
				name: data.name,
				description: data.description,
				data: data.data,
				documentKey: data.documentKey,
				documentName: data.documentName,
				gamesystemKey: data.gamesystemKey,
				gamesystemName: data.gamesystemName,
				publisherKey: data.publisherKey,
				publisherName: data.publisherName,
				updatedAt: now
			}
			})
			.returning();

	invalidateCompendiumCaches(data.type as CompendiumType);
	return item;
}

export async function upsertItems(
	items: Omit<CompendiumItem, 'createdAt' | 'updatedAt'>[]
): Promise<number> {
	if (items.length === 0) return 0;

	const db = await getDb();
	const now = new Date();
	const BATCH_SIZE = 100;
	let totalUpserted = 0;

	for (let i = 0; i < items.length; i += BATCH_SIZE) {
		const batch = items.slice(i, i + BATCH_SIZE);

		const itemsWithTimestamps = batch.map((item) => ({
			...item,
			createdAt: now,
			updatedAt: now
		}));

		const result = await db
			.insert(compendium)
			.values(itemsWithTimestamps)
			.onConflictDoUpdate({
					target: [compendium.type, compendium.key],
				set: {
					name: sql`excluded.name`,
					description: sql`excluded.description`,
					data: sql`excluded.data`,
					documentKey: sql`excluded.document_key`,
					documentName: sql`excluded.document_name`,
					gamesystemKey: sql`excluded.gamesystem_key`,
					gamesystemName: sql`excluded.gamesystem_name`,
					publisherKey: sql`excluded.publisher_key`,
					publisherName: sql`excluded.publisher_name`,
					updatedAt: now
				}
			})
			.returning();

		totalUpserted += result.length;
	}

	const types = new Set(items.map((item) => item.type as CompendiumType));
	if (types.size === 1) {
		invalidateCompendiumCaches(types.values().next().value);
	} else {
		invalidateCompendiumCaches();
	}
	return totalUpserted;
}

export async function getUserHomebrewItems(username: string): Promise<CompendiumItem[]> {
	const db = await getDb();
	return db
		.select()
		.from(compendium)
		.where(and(eq(compendium.source, 'homebrew'), eq(compendium.createdBy, username)))
		.orderBy(desc(compendium.updatedAt));
}

export async function getHomebrewItemByKey(key: string): Promise<CompendiumItem | null> {
	const db = await getDb();
	const results = await db
		.select()
		.from(compendium)
		.where(and(eq(compendium.key, key), eq(compendium.source, 'homebrew')))
		.limit(1);
	return results[0] ?? null;
}

export async function updateHomebrewItem(
	key: string,
	data: { name?: string; description?: string; data?: Record<string, unknown> },
	username: string,
	role: string
): Promise<CompendiumItem | null> {
	const item = await getHomebrewItemByKey(key);

	if (!item) {
		return null;
	}

	if (role !== 'admin' && item.createdBy !== username) {
		return null;
	}

	return updateItem(item.type as CompendiumType, key, data);
}

export async function deleteHomebrewItem(
	key: string,
	username: string,
	role: string
): Promise<boolean> {
	const item = await getHomebrewItemByKey(key);

	if (!item) {
		return false;
	}

	if (role !== 'admin' && item.createdBy !== username) {
		return false;
	}

	return deleteItem(item.type as CompendiumType, key);
}
