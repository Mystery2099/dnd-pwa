/**
 * Shared Compendium Type Mappings
 *
 * Client-safe constants for type normalization.
 * Server-only SQL helpers remain in $lib/server/db/compendium-filters.ts
 */

// ============================================================================
// JSON Extraction Paths (for reference, used server-side)
// ============================================================================

export const JSON_PATHS = {
	SPELL_LEVEL: '$.level',
	SPELL_SCHOOL: '$.school',
	SPELL_CASTING_TIME: '$.casting_time',
	SPELL_RANGE: '$.range',
	SPELL_DURATION: '$.duration',
	SPELL_CONCENTRATION: '$.concentration',
	SPELL_RITUAL: '$.ritual',

	CREATURE_SIZE: '$.size',
	CREATURE_TYPE: '$.type',
	CREATURE_CR: '$.challenge_rating',
	CREATURE_ALIGNMENT: '$.alignment',
	CREATURE_HP: '$.hit_points',
	CREATURE_AC: '$.armor_class',

	ITEM_RARITY: '$.rarity',
	ITEM_TYPE: '$.type',
	ITEM_ATTUNEMENT: '$.requires_attunement',

	RACE_SPEED: '$.speed',
	RACE_SIZE: '$.size'
} as const;

// ============================================================================
// Standardized Filter Parameter Names
// ============================================================================

export const FILTER_PARAMS = {
	SEARCH: 'search',
	SORT_BY: 'sortBy',
	SORT_ORDER: 'sortOrder',
	PAGE: 'page',
	LIMIT: 'limit',

	SPELL_LEVEL: 'spellLevel',
	SPELL_SCHOOL: 'spellSchool',

	CREATURE_SIZE: 'creatureSize',
	CREATURE_TYPE: 'creatureType',
	CHALLENGE_RATING: 'challengeRating',

	ITEM_RARITY: 'itemRarity'
} as const;

// ============================================================================
// Type Normalization
// ============================================================================

export const DB_TYPES = {
	SPELLS: 'spells',
	CREATURES: 'creatures',
	ITEMS: 'items',
	MAGIC_ITEMS: 'magicitems',
	FEATS: 'feats',
	BACKGROUNDS: 'backgrounds',
	SPECIES: 'species',
	CLASSES: 'classes',
	WEAPONS: 'weapons',
	ARMOR: 'armor',
	CONDITIONS: 'conditions',
	LANGUAGES: 'languages',
	ALIGNMENTS: 'alignments',
	SKILLS: 'skills',
	PLANES: 'planes',
	SPELL_SCHOOLS: 'spellschools',
	DAMAGE_TYPES: 'damagetypes',
	CREATURE_TYPES: 'creaturetypes',
	SIZES: 'sizes',
	ABILITIES: 'abilities',
	RULES: 'rules',
	RULE_SECTIONS: 'rulesections'
} as const;

export type DbType = typeof DB_TYPES[keyof typeof DB_TYPES];

export const PATH_TO_DB_TYPE: Record<string, DbType> = {
	spells: DB_TYPES.SPELLS,
	creatures: DB_TYPES.CREATURES,
	monsters: DB_TYPES.CREATURES,
	feats: DB_TYPES.FEATS,
	backgrounds: DB_TYPES.BACKGROUNDS,
	races: DB_TYPES.SPECIES,
	species: DB_TYPES.SPECIES,
	classes: DB_TYPES.CLASSES,
	items: DB_TYPES.ITEMS,
	magicitems: DB_TYPES.MAGIC_ITEMS,
	weapons: DB_TYPES.WEAPONS,
	armor: DB_TYPES.ARMOR,
	conditions: DB_TYPES.CONDITIONS,
	languages: DB_TYPES.LANGUAGES,
	alignments: DB_TYPES.ALIGNMENTS,
	skills: DB_TYPES.SKILLS,
	planes: DB_TYPES.PLANES,
	spellschools: DB_TYPES.SPELL_SCHOOLS,
	damagetypes: DB_TYPES.DAMAGE_TYPES,
	creaturetypes: DB_TYPES.CREATURE_TYPES,
	sizes: DB_TYPES.SIZES,
	abilities: DB_TYPES.ABILITIES,
	rules: DB_TYPES.RULES,
	rulesections: DB_TYPES.RULE_SECTIONS
};

export const DB_TYPE_TO_PATH: Record<string, string> = Object.fromEntries(
	Object.entries(PATH_TO_DB_TYPE).map(([path, dbType]) => [dbType, path])
) as Record<string, string>;

DB_TYPE_TO_PATH[DB_TYPES.SPECIES] = 'races';
DB_TYPE_TO_PATH[DB_TYPES.MAGIC_ITEMS] = 'items';

export const SECTION_TO_SINGULAR: Record<string, string> = {
	spells: 'spell',
	creatures: 'creature',
	feats: 'feat',
	backgrounds: 'background',
	races: 'species',
	species: 'species',
	classes: 'class',
	items: 'item',
	magicitems: 'magicitem',
	weapons: 'weapon',
	armor: 'armor',
	conditions: 'condition',
	planes: 'plane'
};

export const SECTION_TO_TYPE_FILTER: Record<string, string> = {
	spells: 'spells',
	creatures: 'creatures',
	feats: 'feats',
	backgrounds: 'backgrounds',
	races: 'species',
	species: 'species',
	classes: 'classes',
	items: 'items',
	magicitems: 'magicitems',
	weapons: 'weapons',
	armor: 'armor',
	conditions: 'conditions',
	planes: 'planes',
	sections: 'sections'
};

export function normalizeDbType(type: string): DbType {
	if (Object.values(DB_TYPES).includes(type as DbType)) {
		return type as DbType;
	}

	if (type in PATH_TO_DB_TYPE) {
		return PATH_TO_DB_TYPE[type];
	}

	if (type === 'race') return DB_TYPES.SPECIES;
	if (type === 'creature' || type === 'monster') return DB_TYPES.CREATURES;
	if (type === 'item') return DB_TYPES.ITEMS;

	return type as DbType;
}

export function getUrlPath(dbType: string): string {
	return DB_TYPE_TO_PATH[dbType] || dbType;
}
