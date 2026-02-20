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
import { eq, like, and, desc, asc, sql, inArray, or } from 'drizzle-orm';
import { searchFtsRanked } from '$lib/server/db/db-fts';
import {
	DB_TYPES,
	JSON_PATHS,
	jsonExtract,
	jsonExtractLower,
	buildJsonFilter,
	buildJsonExactFilter,
	normalizeDbType,
	type DbType
} from '$lib/server/db/compendium-filters';
import type {
	UnifiedSpell,
	UnifiedCreature,
	UnifiedFeat,
	UnifiedBackground,
	UnifiedRace,
	UnifiedClass,
	UnifiedItem,
	UnifiedCompendiumItem,
	SpellFilters,
	CreatureFilters,
	NavigationResult
} from '$lib/core/types/compendium/unified';
import {
	transformToUnifiedSpell,
	transformToUnifiedCreature,
	transformToUnifiedFeat,
	transformToUnifiedBackground,
	transformToUnifiedRace,
	transformToUnifiedClass,
	transformToUnifiedItem,
	transformToUnified
} from './transformers';
import { buildExternalId } from '$lib/core/utils/slug';

// ============================================================================
// Utility Types
// ============================================================================

// Extended type that includes all compendium types - now using DB_TYPES
export type AnyCompendiumType = DbType | string;

type CompendiumType =
	| typeof DB_TYPES.SPELLS
	| typeof DB_TYPES.CREATURES
	| typeof DB_TYPES.MAGIC_ITEMS
	| typeof DB_TYPES.FEATS
	| typeof DB_TYPES.BACKGROUNDS
	| typeof DB_TYPES.SPECIES
	| typeof DB_TYPES.CLASSES;

// ============================================================================
// Search Helper
// ============================================================================

/**
 * Apply FTS5 search with LIKE fallback to conditions array.
 * FTS5 is tried first for full-text search; if no results, falls back to LIKE.
 */
async function applySearchFilter(
	searchQuery: string,
	conditions: unknown[]
): Promise<void> {
	const ftsResults = await searchFtsRanked(searchQuery, 50);
	if (ftsResults.length > 0) {
		const rowids = ftsResults.map((r) => r.rowid);
		conditions.push(inArray(compendiumItems.id, rowids));
	} else {
		// Fallback to LIKE on name only (simpler fallback)
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

	// Creatures
	getCreatures(filters?: CreatureFilters): Promise<UnifiedCreature[]>;
	getCreatureById(id: number): Promise<UnifiedCreature | null>;

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
		id: number | string,
		sourceBook?: string
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
		const conditions = [eq(compendiumItems.type, DB_TYPES.SPELLS)];

		if (filters.level !== undefined) {
			conditions.push(eq(jsonExtract(JSON_PATHS.SPELL_LEVEL), filters.level));
		}
		if (filters.school) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.SPELL_SCHOOL), filters.school.toLowerCase()));
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
			where: and(eq(compendiumItems.type, DB_TYPES.SPELLS), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedSpell(item) : null;
	},

	// ========================================================================
	// Creatures
	// ========================================================================

	async getCreatures(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, DB_TYPES.CREATURES)];

		if (filters.size) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.CREATURE_SIZE), filters.size.toLowerCase()));
		}
		if (filters.type) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.CREATURE_TYPE), filters.type.toLowerCase()));
		}
		if (filters.cr) {
			conditions.push(eq(jsonExtract(JSON_PATHS.CREATURE_CR), filters.cr));
		}
		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}

		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(asc(compendiumItems.name));

		return items.map(transformToUnifiedCreature);
	},

	async getCreatureById(id) {
		const db = await getDb();
		const item = await db.query.compendiumItems.findFirst({
			where: and(eq(compendiumItems.type, DB_TYPES.CREATURES), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedCreature(item) : null;
	},

	// ========================================================================
	// Feats
	// ========================================================================

	async getFeats(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, DB_TYPES.FEATS)];

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
			where: and(eq(compendiumItems.type, DB_TYPES.FEATS), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedFeat(item) : null;
	},

	// ========================================================================
	// Backgrounds
	// ========================================================================

	async getBackgrounds(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, DB_TYPES.BACKGROUNDS)];

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
			where: and(eq(compendiumItems.type, DB_TYPES.BACKGROUNDS), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedBackground(item) : null;
	},

	// ========================================================================
	// Races (DB type: 'species')
	// ========================================================================

	async getRaces(filters = {}) {
		const db = await getDb();
		// IMPORTANT: DB stores these as 'species', not 'races'
		const conditions = [eq(compendiumItems.type, DB_TYPES.SPECIES)];

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
			where: and(eq(compendiumItems.type, DB_TYPES.SPECIES), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedRace(item) : null;
	},

	// ========================================================================
	// Classes
	// ========================================================================

	async getClasses(filters = {}) {
		const db = await getDb();
		const conditions = [eq(compendiumItems.type, DB_TYPES.CLASSES)];

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
			where: and(eq(compendiumItems.type, DB_TYPES.CLASSES), sql`${compendiumItems.id} = ${id}`)
		});
		return item ? transformToUnifiedClass(item) : null;
	},

	// ========================================================================
	// Items (includes magicitems)
	// ========================================================================

	async getItems(filters = {}) {
		const db = await getDb();
		// Query both 'items' and 'magicitems' types
		const conditions = [or(
			eq(compendiumItems.type, DB_TYPES.ITEMS),
			eq(compendiumItems.type, DB_TYPES.MAGIC_ITEMS)
		)];

		if (filters.search) {
			await applySearchFilter(filters.search, conditions);
		}
		if (filters.rarity) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.ITEM_RARITY), filters.rarity.toLowerCase()));
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
			where: and(
				or(
					eq(compendiumItems.type, DB_TYPES.ITEMS),
					eq(compendiumItems.type, DB_TYPES.MAGIC_ITEMS)
				),
				sql`${compendiumItems.id} = ${id}`
			)
		});
		return item ? transformToUnifiedItem(item) : null;
	},

	// ========================================================================
	// Generic Type Query
	// ========================================================================

	async getByType(type, filters = {}) {
		const db = await getDb();
		// Normalize the type to handle aliases
		const normalizedType = normalizeDbType(type);
		const conditions = [eq(compendiumItems.type, normalizedType)];

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
		// Normalize type
		const normalizedType = normalizeDbType(type);

		// Handle both numeric ID and slug (externalId)
		const numericId = typeof id === 'number' ? id : parseInt(id);
		const isNumeric = !Number.isNaN(numericId);

		let item;
		if (isNumeric) {
			item = await db.query.compendiumItems.findFirst({
				where: and(eq(compendiumItems.id, numericId), eq(compendiumItems.type, normalizedType))
			});
		} else {
			item = await db.query.compendiumItems.findFirst({
				where: and(eq(compendiumItems.externalId, id as string), eq(compendiumItems.type, normalizedType))
			});
		}

		return item ? transformToUnified(item) : null;
	},

	async getBySourceAndId(
		source: string,
		type: AnyCompendiumType,
		id: number | string,
		sourceBook?: string
	) {
		const db = await getDb();
		const log = createModuleLogger('CompendiumService');

		// Normalize type
		const normalizedType = normalizeDbType(type);

		// Handle both numeric ID and slug (externalId)
		const numericId = typeof id === 'number' ? id : parseInt(id);
		const isNumeric = !Number.isNaN(numericId);

		// If non-numeric ID and sourceBook provided, reconstruct full externalId
		const externalId = !isNumeric && sourceBook ? buildExternalId(id as string, sourceBook) : id;

		log.debug({ source, type, normalizedType, id, isNumeric, sourceBook, externalId }, 'Looking up item by source and ID');

		let item;
		if (isNumeric) {
			item = await db.query.compendiumItems.findFirst({
				where: and(
					eq(compendiumItems.id, numericId),
					eq(compendiumItems.type, normalizedType),
					eq(compendiumItems.source, source)
				)
			});
		} else {
			item = await db.query.compendiumItems.findFirst({
				where: and(
					eq(compendiumItems.externalId, externalId as string),
					eq(compendiumItems.type, normalizedType),
					eq(compendiumItems.source, source)
				)
			});
		}

		if (!item) {
			log.debug({ source, type, id, sourceBook }, 'Item not found');
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
