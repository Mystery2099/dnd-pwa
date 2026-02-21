/**
 * Compendium Service Layer
 *
 * Simplified service for the new schema aligned with Open5e API v2.
 * All data is stored directly from the API - no transformation needed.
 */

import { getDb } from '$lib/server/db';
import { compendium, COMPENDIUM_TYPES } from '$lib/server/db/schema';
import type { CompendiumType, CompendiumItem } from '$lib/core/types/compendium';
import { eq, like, and, desc, asc, sql, or, inArray } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumService');

export type { CompendiumType, CompendiumItem };

export interface ListFilters {
	search?: string;
	source?: string;
	gamesystem?: string;
	document?: string;
	limit?: number;
	offset?: number;
}

export interface NavigationResult {
	prev: CompendiumItem | null;
	next: CompendiumItem | null;
	currentIndex: number;
	total: number;
}

function toItem(row: typeof compendium.$inferSelect): CompendiumItem {
	return {
		key: row.key,
		type: row.type as CompendiumType,
		name: row.name,
		source: row.source,
		documentKey: row.documentKey,
		documentName: row.documentName,
		gamesystemKey: row.gamesystemKey,
		gamesystemName: row.gamesystemName,
		publisherKey: row.publisherKey,
		publisherName: row.publisherName,
		description: row.description,
		data: row.data as Record<string, unknown>,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		createdBy: row.createdBy
	};
}

export const compendiumService = {
	async getByType(type: CompendiumType | string, filters: ListFilters = {}) {
		const db = await getDb();
		const conditions = [eq(compendium.type, type)];

		if (filters.search) {
			conditions.push(like(compendium.name, `%${filters.search}%`));
		}
		if (filters.source) {
			conditions.push(eq(compendium.source, filters.source));
		}
		if (filters.gamesystem) {
			conditions.push(eq(compendium.gamesystemKey, filters.gamesystem));
		}
		if (filters.document) {
			conditions.push(eq(compendium.documentKey, filters.document));
		}

		const query = db
			.select()
			.from(compendium)
			.where(and(...conditions))
			.orderBy(asc(compendium.name));

		if (filters.limit) {
			query.limit(filters.limit);
		}
		if (filters.offset) {
			query.offset(filters.offset);
		}

		const items = await query;
		return items.map(toItem);
	},

	async getByKey(key: string): Promise<CompendiumItem | null> {
		const db = await getDb();
		const item = await db.query.compendium.findFirst({
			where: eq(compendium.key, key)
		});
		return item ? toItem(item) : null;
	},

	async getByTypeAndKey(type: CompendiumType | string, key: string): Promise<CompendiumItem | null> {
		const db = await getDb();
		const item = await db.query.compendium.findFirst({
			where: and(eq(compendium.type, type), eq(compendium.key, key))
		});
		return item ? toItem(item) : null;
	},

	async getBySourceAndId(
		source: string,
		type: CompendiumType | string,
		slug: string,
		documentName?: string
	): Promise<CompendiumItem | null> {
		const db = await getDb();
		const conditions = [eq(compendium.source, source), eq(compendium.type, type)];

		if (documentName) {
			conditions.push(
				or(eq(compendium.documentName, documentName), eq(compendium.documentKey, documentName))!
			);
		}

		conditions.push(
			or(eq(compendium.key, slug), like(compendium.key, `%-${slug}`), eq(compendium.name, slug))!
		);

		const item = await db.query.compendium.findFirst({
			where: and(...conditions)
		});
		return item ? toItem(item) : null;
	},

	async search(query: string, type?: CompendiumType | string, limit = 50): Promise<CompendiumItem[]> {
		const db = await getDb();
		const conditions = [like(compendium.name, `%${query}%`)];

		if (type) {
			conditions.push(eq(compendium.type, type));
		}

		const items = await db
			.select()
			.from(compendium)
			.where(and(...conditions))
			.limit(limit)
			.orderBy(asc(compendium.name));

		return items.map(toItem);
	},

	async getNavigation(type: CompendiumType | string, key: string): Promise<NavigationResult> {
		const db = await getDb();

		const currentItem = await db.query.compendium.findFirst({
			where: and(eq(compendium.key, key), eq(compendium.type, type))
		});

		if (!currentItem) {
			return { prev: null, next: null, currentIndex: 0, total: 0 };
		}

		const currentName = currentItem.name;

		const prevItems = await db
			.select()
			.from(compendium)
			.where(and(eq(compendium.type, type), sql`name < ${currentName}`))
			.orderBy(desc(compendium.name))
			.limit(1);

		const prevItem = prevItems[0] ? toItem(prevItems[0]) : null;

		const nextItems = await db
			.select()
			.from(compendium)
			.where(and(eq(compendium.type, type), sql`name > ${currentName}`))
			.orderBy(asc(compendium.name))
			.limit(1);

		const nextItem = nextItems[0] ? toItem(nextItems[0]) : null;

		const totalCount = await db.$count(compendium, eq(compendium.type, type));

		const itemsBefore = await db.$count(
			compendium,
			and(eq(compendium.type, type), sql`name < ${currentName}`)
		);

		return {
			prev: prevItem,
			next: nextItem,
			currentIndex: itemsBefore + 1,
			total: totalCount
		};
	},

	async getCount(type?: CompendiumType | string): Promise<number> {
		const db = await getDb();
		if (type) {
			return db.$count(compendium, eq(compendium.type, type));
		}
		return db.$count(compendium);
	},

	async getTypes(): Promise<{ type: string; count: number }[]> {
		const db = await getDb();
		const result = await db
			.select({
				type: compendium.type,
				count: sql<number>`count(*)`.as('count')
			})
			.from(compendium)
			.groupBy(compendium.type)
			.orderBy(asc(compendium.type));

		return result.map((r) => ({ type: r.type, count: r.count }));
	},

	async getSources(): Promise<{ source: string; count: number }[]> {
		const db = await getDb();
		const result = await db
			.select({
				source: compendium.source,
				count: sql<number>`count(*)`.as('count')
			})
			.from(compendium)
			.groupBy(compendium.source)
			.orderBy(asc(compendium.source));

		return result.map((r) => ({ source: r.source, count: r.count }));
	},

	async getGamesystems(): Promise<{ key: string; name: string; count: number }[]> {
		const db = await getDb();
		const result = await db
			.select({
				key: compendium.gamesystemKey,
				name: compendium.gamesystemName,
				count: sql<number>`count(*)`.as('count')
			})
			.from(compendium)
			.where(sql`gamesystem_key IS NOT NULL`)
			.groupBy(compendium.gamesystemKey, compendium.gamesystemName)
			.orderBy(asc(compendium.gamesystemName));

		return result.map((r) => ({ key: r.key ?? '', name: r.name ?? '', count: Number(r.count) }));
	},

	async clearType(type: CompendiumType | string): Promise<void> {
		const db = await getDb();
		await db.delete(compendium).where(eq(compendium.type, type));
		log.info({ type }, 'Cleared compendium type');
	},

	async clearSource(source: string): Promise<void> {
		const db = await getDb();
		await db.delete(compendium).where(eq(compendium.source, source));
		log.info({ source }, 'Cleared compendium source');
	}
};

export default compendiumService;
