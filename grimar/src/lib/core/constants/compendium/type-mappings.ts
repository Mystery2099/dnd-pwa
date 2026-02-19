/**
 * Compendium Type Mappings
 *
 * Re-exports from registry for backwards compatibility.
 * JSON_PATHS and FILTER_PARAMS remain here as they're filter-specific.
 */

export {
	DB_TYPES,
	PATH_TO_DB_TYPE,
	DB_TYPE_TO_PATH,
	normalizeDbType,
	getUrlPath,
	type DbType,
	type DashboardCard,
	type CategoryId,
	type TypeRegistryEntry,
	getRegistryEntry,
	getRegistryEntryByPath,
	COMPENDIUM_TYPE_REGISTRY
} from './registry';

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
