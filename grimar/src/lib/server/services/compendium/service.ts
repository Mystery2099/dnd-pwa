/**
 * Compendium Service Layer
 *
 * Provides a unified API for fetching and searching compendium data.
 * All methods return unified types with consistent field naming.
 *
 * This service abstracts database queries and data transformation,
 * making it easier to maintain and extend compendium functionality.
 *
 * Search uses FTS5 for full-text search across names, summaries,
 * and detailed content (descriptions, abilities, etc.)
 */

import { getDb } from '$lib/server/db';
import { createModuleLogger } from '$lib/server/logger';
import { compendiumItems } from '$lib/server/db/schema';
import { eq, like, and, desc, asc, sql, inArray } from 'drizzle-orm';
import { searchFtsRanked } from '$lib/server/db/db-fts';
import type {
	UnifiedSpell,
	UnifiedMonster,
	UnifiedFeat,
	UnifiedBackground,
	UnifiedRace,
	UnifiedClass,
	UnifiedItem,
	UnifiedCompendiumItem,
	SpellFilters,
	MonsterFilters,
	NavigationResult
} from '$lib/core/types/compendium/unified';
import {
	transformToUnifiedSpell,
	transformToUnifiedMonster,
	transformToUnifiedFeat,
	transformToUnifiedBackground,
	transformToUnifiedRace,
	transformToUnifiedClass,
	transformToUnifiedItem,
	transformToUnified
} from './transformers';

// ============================================================================
// Utility Types
// ============================================================================

// Extended type that includes all compendium types
export type AnyCompendiumType =
	| 'spells'
	| 'creatures'
	| 'magicitems'
	| 'itemsets'
	| 'itemcategories'
	| 'documents'
	| 'licenses'
	| 'publishers'
	| 'weapons'
	| 'armor'
	| 'gamesystems'
	| 'backgrounds'
	| 'feats'
	| 'species'
	| 'creaturetypes'
	| 'creaturesets'
	| 'damagetypes'
	| 'languages'
	| 'alignments'
	| 'conditions'
	| 'spellschools'
	| 'classes'
	| 'sizes'
	| 'itemrarities'
	| 'environments'
	| 'abilities'
	| 'skills'
	| 'rules'
	| 'rulesections'
	| 'rulesets'
	| 'images'
	| 'weaponproperties'
	| 'services';

type CompendiumType =
	| 'spells'
	| 'creatures'
	| 'magicitems'
	| 'feats'
	| 'backgrounds'
	| 'species'
	| 'classes';

// ============================================================================
// Search Helper
// ============================================================================

/**
 * Apply FTS5 search with LIKE fallback to conditions array.
 * FTS5 is tried first for full-text search; if no results, falls back to LIKE.
 */
async function applySearchFilter(
	searchQuery: string,
	conditions: Array<ReturnType<typeof eq> | ReturnType<typeof like> | ReturnType<typeof sql>>
): Promise<void> {
	const ftsResults = await searchFtsRanked(searchQuery, 50);
	if (ftsResults.length > 0) {
		const rowids = ftsResults.map((r) => r.rowid);
		conditions.push(inArray(compendiumItems.id, rowids));
	} else {
		conditions.push(like(compendiumItems.name, `%${searchQuery}%`));
	}
}

// ============================================================================
// Service Interface
// ============================================================================

export interface CompendiumServiceInterface {
	// Spells
	getSpells(filters?: SpellFilters): Promise<UnifiedSpell[]>;
	getSpellById(id: number): Promise<UnifiedSpell | null>;

	// Monsters
	getMonsters(filters?: MonsterFilters): Promise<UnifiedMonster[]>;
	getMonsterById(id: number): Promise<UnifiedMonster | null>;

	// Feats
	getFeats(filters?: { search?: string }): Promise<UnifiedFeat[]>;
	getFeatById(id: number): Promise<UnifiedFeat | null>;

	// Backgrounds
	getBackgrounds(filters?: { search?: string }): Promise<UnifiedBackground[]>;
	getBackgroundById(id: number): Promise<UnifiedBackground | null>;

	// Races
	getRaces(filters?: { search?: string }): Promise<UnifiedRace[]>;
	getRaceById(id: number): Promise<UnifiedRace | null>;

	// Classes
	getClasses(filters?: { search?: string }): Promise<UnifiedClass[]>;
	getClassById(id: number): Promise<UnifiedClass | null>;

	// Items
	getItems(filters?: { search?: string; rarity?: string }): Promise<UnifiedItem[]>;
	getItemById(id: number): Promise<UnifiedItem | null>;

	// Generic
	getByType(
		type: AnyCompendiumType,
		filters?: Record<string, unknown>
	): Promise<UnifiedCompendiumItem[]>;
	getById(type: AnyCompendiumType, id: number | string): Promise<UnifiedCompendiumItem | null>;
	getBySourceAndId(
		source: string,
		type: AnyCompendiumType,
		id: number | string
	): Promise<UnifiedCompendiumItem | null>;

	// Search
	search(query: string, type?: CompendiumType, limit?: number): Promise<UnifiedCompendiumItem[]>;

	// Navigation
	getNavigation(type: AnyCompendiumType, id: number): Promise<NavigationResult>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const compendiumService: CompendiumServiceInterface = {
	// ========================================================================
	// Spells
	// ========================================================================

	async getSpells(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, 'spell')];

		if (filters.level !== undefined) {
			conditions.push(eq(compendiumItems.spellLevel, filters.level));
		}
		if (filters.school) {
			conditions.push(eq(compendiumItems.spellSchool, filters.school));
		}
		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedSpell);
	},

	async getSpellById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, 'spell'), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedSpell(item) : null;
	},

	// ========================================================================
	// Monsters
	// ========================================================================

	async getMonsters(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, 'monster')];

		if (filters.size) {
			conditions.push(eq(compendiumItems.monsterSize, filters.size));
		}
		if (filters.type) {
			conditions.push(eq(compendiumItems.monsterType, filters.type));
		}
		if (filters.cr) {
			conditions.push(eq(compendiumItems.challengeRating, filters.cr));
		}
		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedMonster);
	},

	async getMonsterById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, 'monster'), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedMonster(item) : null;
	},

	// ========================================================================
	// Feats
	// ========================================================================

	async getFeats(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, 'feat')];

		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedFeat);
	},

	async getFeatById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, 'feat'), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedFeat(item) : null;
	},

	// ========================================================================
	// Backgrounds
	// ========================================================================

	async getBackgrounds(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, 'background')];

		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedBackground);
	},

	async getBackgroundById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, 'background'), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedBackground(item) : null;
	},

	// ========================================================================
	// Races
	// ========================================================================

	async getRaces(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, 'race')];

		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedRace);
	},

	async getRaceById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, 'race'), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedRace(item) : null;
	},

	// ========================================================================
	// Classes
	// ====================================================================

	async getClasses(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, 'class')];

		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedClass);
	},

	async getClassById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, 'class'), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedClass(item) : null;
	},

	// ========================================================================
	// Items
	// ========================================================================

	async getItems(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, 'item')];

		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}
		if (filters.rarity) {
			// Filter by rarity using JSON extraction
			conditions.push(sql`json_extract(details, '$.rarity') = ${filters.rarity}`);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedItem);
	},

	async getItemById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, 'item'), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedItem(item) : null;
	},

	// ========================================================================
	// Generic Type Query
	// ========================================================================

	async getByType(type, filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, type)];

		const searchQuery = filters.search as string | undefined;
		if (searchQuery) {
			await applySearchFilter(searchQuery, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnified);
	},

	async getById(type: AnyCompendiumType, id: number | string) {
		const db = await getDb();

		// Handle both numeric ID and slug (externalId)
		const numericId = typeof id === 'number' ? id : parseInt(id);
		const isNumeric = !Number.isNaN(numericId);

		let item;
		if (isNumeric) {
			item = await db.query.compendiumItems.findFirst({
				where: and(eq(compendiumItems.id, numericId), eq(compendiumItems.type, type))
			});
		} else {
			// Look up by externalId (slug)
			item = await db.query.compendiumItems.findFirst({
				where: and(eq(compendiumItems.externalId, id as string), eq(compendiumItems.type, type))
			});
		}

		return item ? transformToUnified(item) : null;
	},

	async getBySourceAndId(source: string, type: AnyCompendiumType, id: number | string) {
		const db = await getDb();
		const log = createModuleLogger('CompendiumService');

		// Handle both numeric ID and slug (externalId)
		const numericId = typeof id === 'number' ? id : parseInt(id);
		const isNumeric = !Number.isNaN(numericId);

		log.debug({ source, type, id, isNumeric }, 'Looking up item by source and ID');

		let item;
		if (isNumeric) {
			item = await db.query.compendiumItems.findFirst({
				where: and(
					eq(compendiumItems.id, numericId),
					eq(compendiumItems.type, type),
					eq(compendiumItems.source, source)
				)
			});
		} else {
			// Look up by externalId (slug) and source
			item = await db.query.compendiumItems.findFirst({
				where: and(
					eq(compendiumItems.externalId, id as string),
					eq(compendiumItems.type, type),
					eq(compendiumItems.source, source)
				)
			});
		}

		if (!item) {
			log.debug({ source, type, id }, 'Item not found');
		}

		return item ? transformToUnified(item) : null;
	},

	// ========================================================================
	// Search
	// ========================================================================

	async search(query, type, limit = 50) {
		const db = await getDb();

		// Use FTS5 for full-text search across all indexed content
		const ftsResults = await searchFtsRanked(query, limit * 2); // Get extra to allow for type filtering

		if (ftsResults.length === 0) {
			return [];
		}

		// Get rowids from FTS results
		const rowids = ftsResults.map((r) => r.rowid);

		// Build conditions: FTS rowids + optional type filter
		const conditions = [inArray(compendiumItems.id, rowids)];
		if (type) {
			conditions.push(eq(compendiumItems.type, type));
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.limit(limit);

		// Re-order items by FTS rank (BM25 score)
		const itemMap = new Map(items.map((item) => [item.id, item]));
		const rankedItems = rowids
			.map((id) => itemMap.get(id))
			.filter((item): item is (typeof items)[0] => item !== undefined);

		return rankedItems.map(transformToUnified);
	},

	// ========================================================================
	// Navigation
	// ========================================================================

	async getNavigation(type, id) {
		const db = await getDb();

		// First, get the current item to find its name
		const currentItem = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.id, id), eq(compendiumItems.type, type))
		});

		if (!currentItem) {
			return {
				prev: null,
				next: null,
				currentIndex: 0,
				total: 0
			};
		}

		const currentName = currentItem.name;

		// Get prev item (name < current name)
		const prevItems = await db
			.select()
			.from(compendiumItems)
			.where(and(eq(compendiumItems.type, type), sql`name < ${currentName}`))
			.orderBy(desc(compendiumItems.name))
			.limit(1);

		const prevItem = prevItems[0] ? transformToUnified(prevItems[0]) : null;

		// Get next item (name > current name)
		const nextItems = await db
			.select()
			.from(compendiumItems)
			.where(and(eq(compendiumItems.type, type), sql`name > ${currentName}`))
			.orderBy(asc(compendiumItems.name))
			.limit(1);

		const nextItem = nextItems[0] ? transformToUnified(nextItems[0]) : null;

		// Get total count
		const totalCount = await db.$count(compendiumItems, eq(compendiumItems.type, type));

		// Get current index
		const itemsBefore = await db.$count(
			compendiumItems,
			and(eq(compendiumItems.type, type), sql`name < ${currentName}`)
		);
		const currentIndex = itemsBefore + 1;

		return {
			prev: prevItem,
			next: nextItem,
			currentIndex,
			total: totalCount
		};
	}
};
