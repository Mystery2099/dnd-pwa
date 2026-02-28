import { eq, and, sql, like, or, desc, inArray, type SQL } from 'drizzle-orm';
import { getDb } from '../db/index';
import { compendium, type CompendiumItem, type CompendiumType } from '../db/schema';

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

export async function getPaginatedItems(
	type: CompendiumType,
	options: {
		page?: number;
		pageSize?: number;
		filters?: FilterOptions;
	}
): Promise<PaginatedResult<CompendiumItem>> {
	const db = await getDb();
	const page = options.page ?? 1;
	const pageSize = Math.min(options.pageSize ?? 50, 100);
	const offset = (page - 1) * pageSize;
	const filters = options.filters ?? {};

	let whereClause: SQL<unknown> = eq(compendium.type, type);

	if (filters.search) {
		const searchTerm = `%${filters.search}%`;
		whereClause = and(
			whereClause,
			or(like(compendium.name, searchTerm), like(compendium.description, searchTerm))
		)!;
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

	const sortBy = filters.sortBy ?? 'name';
	const sortOrder = filters.sortOrder ?? 'asc';
	const sortColumn =
		sortBy === 'created_at'
			? compendium.createdAt
			: sortBy === 'updated_at'
				? compendium.updatedAt
				: compendium.name;
	const orderBy = sortOrder === 'desc' ? desc(sortColumn) : sortColumn;

	const [items, countResult] = await Promise.all([
		db.select().from(compendium).where(whereClause).orderBy(orderBy).limit(pageSize).offset(offset),
		db
			.select({ count: sql<number>`count(*)` })
			.from(compendium)
			.where(whereClause)
	]);

	const total = Number(countResult[0]?.count ?? 0);
	const totalPages = Math.ceil(total / pageSize);

	return {
		items,
		total,
		page,
		pageSize,
		totalPages,
		hasMore: page < totalPages
	};
}

export async function getItem(type: CompendiumType, key: string): Promise<CompendiumItem | null> {
	const db = await getDb();
	const results = await db
		.select()
		.from(compendium)
		.where(and(eq(compendium.type, type), eq(compendium.key, key)))
		.limit(1);

	return results[0] ?? null;
}

export async function getItemByKey(key: string): Promise<CompendiumItem | null> {
	const db = await getDb();
	const results = await db.select().from(compendium).where(eq(compendium.key, key)).limit(1);
	return results[0] ?? null;
}

export async function searchItems(
	type: CompendiumType,
	query: string,
	options?: { limit?: number }
): Promise<CompendiumItem[]> {
	const db = await getDb();
	const limit = options?.limit ?? 50;
	const searchTerm = `%${query}%`;

	const results = await db
		.select()
		.from(compendium)
		.where(
			and(
				eq(compendium.type, type),
				or(like(compendium.name, searchTerm), like(compendium.description, searchTerm))
			)
		)
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

	return item;
}

export async function updateItem(
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
		.where(eq(compendium.key, key))
		.returning();

	return item ?? null;
}

export async function deleteItem(key: string): Promise<boolean> {
	const db = await getDb();
	const result = await db.delete(compendium).where(eq(compendium.key, key)).returning();
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
	const results = await db
		.select({
			type: compendium.type,
			count: sql<number>`count(*)`
		})
		.from(compendium)
		.groupBy(compendium.type);

	return Object.fromEntries(results.map((r: { type: string; count: number }) => [r.type, Number(r.count)]));
}

export async function getDistinctValues(
	field: 'gamesystemKey' | 'documentKey' | 'publisherKey' | 'source',
	type?: CompendiumType
): Promise<string[]> {
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
	return results.map((r: { value: string | null }) => r.value).filter((v): v is string => v !== null);
}

export async function clearType(type: CompendiumType): Promise<number> {
	const db = await getDb();
	const result = await db.delete(compendium).where(eq(compendium.type, type)).returning();
	return result.length;
}

export async function clearSource(source: string): Promise<number> {
	const db = await getDb();
	const result = await db.delete(compendium).where(eq(compendium.source, source)).returning();
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
			target: compendium.key,
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
				target: compendium.key,
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

	return updateItem(key, data);
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

	return deleteItem(key);
}
