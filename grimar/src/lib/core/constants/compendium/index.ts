/**
 * Compendium Configuration Registry
 *
 * Centralizes all compendium type-specific configurations.
 */

import type { CompendiumTypeConfig, CompendiumTypeName, CompendiumType } from '$lib/core/types/compendium';
import { SPELLS_CONFIG } from './spells';
import { CREATURES_CONFIG } from './creatures';
import { FEATS_CONFIG } from './feats';
import { BACKGROUNDS_CONFIG } from './backgrounds';
import { RACES_CONFIG } from './races';
import { CLASSES_CONFIG } from './classes';
import { ITEMS_CONFIG } from './items';
import { WEAPONS_CONFIG } from './weapons';
import { ARMOR_CONFIG } from './armor';
import { CONDITIONS_CONFIG } from './conditions';
import { PLANES_CONFIG } from './planes';
import {
	SKILLS_CONFIG,
	LANGUAGES_CONFIG,
	ALIGNMENTS_CONFIG,
	DAMAGE_TYPES_CONFIG,
	MAGIC_SCHOOLS_CONFIG,
	MONSTER_TYPES_CONFIG,
	RULE_SECTIONS_CONFIG,
	ABILITY_SCORES_CONFIG,
	WEAPON_PROPERTIES_CONFIG,
	EQUIPMENT_CATEGORIES_CONFIG,
	RULES_CONFIG
} from './reference';

import { BookOpen } from 'lucide-svelte';

// Helper to create generic configs for new types
function createGenericConfig(
	type: string,
	displayName: string,
	color: string
): CompendiumTypeConfig {
	return {
		routes: {
			basePath: `/compendium/${type}`,
			dbType: type as CompendiumTypeName,
			storageKeyFilters: `${type}-filters`,
			storageKeyListUrl: `${type}-list-url`
		},
		filters: [],
		sorting: {
			default: {
				label: 'Name (A-Z)',
				value: 'name-asc',
				column: 'name',
				direction: 'asc'
			},
			options: [
				{ label: 'Name (A-Z)', value: 'name-asc', column: 'name', direction: 'asc' },
				{ label: 'Name (Z-A)', value: 'name-desc', column: 'name', direction: 'desc' }
			]
		},
		ui: {
			displayName,
			displayNamePlural: displayName + 's',
			icon: BookOpen,
			categoryGradient: `from-${color}-500/20 to-${color}-600/20`,
			categoryAccent: `text-${color}-400`,
			emptyState: {
				title: `No ${displayName.toLowerCase()}s found`,
				description: 'Try adjusting your filters to find what you are looking for.'
			},
			databaseEmptyState: {
				title: `No ${displayName}s in Compendium`,
				description: `The ${displayName.toLowerCase()} database appears to be empty.`,
				ctaText: `Sync ${displayName}s`,
				ctaLink: '/compendium/sync'
			}
		},
		display: {
			subtitle: () => displayName,
			tags: () => [],
			listItemAccent: () => `text-${color}-400`,
			detailAccent: () => `text-${color}-400`,
			metaDescription: () => ''
		}
	};
}

// Map database type names to their configuration objects
const CONFIG_MAP: Record<CompendiumTypeName, CompendiumTypeConfig> = {
	spells: SPELLS_CONFIG,
	creatures: CREATURES_CONFIG,
	magicitems: ITEMS_CONFIG,
	itemsets: createGenericConfig('itemsets', 'Item Set', 'amber'),
	itemcategories: EQUIPMENT_CATEGORIES_CONFIG,
	documents: createGenericConfig('documents', 'Document', 'gray'),
	licenses: createGenericConfig('licenses', 'License', 'blue'),
	publishers: createGenericConfig('publishers', 'Publisher', 'indigo'),
	weapons: WEAPONS_CONFIG,
	armor: ARMOR_CONFIG,
	gamesystems: createGenericConfig('gamesystems', 'Game System', 'purple'),
	backgrounds: BACKGROUNDS_CONFIG,
	feats: FEATS_CONFIG,
	species: RACES_CONFIG,
	creaturetypes: MONSTER_TYPES_CONFIG,
	creaturesets: createGenericConfig('creaturesets', 'Creature Set', 'green'),
	damagetypes: DAMAGE_TYPES_CONFIG,
	languages: LANGUAGES_CONFIG,
	alignments: ALIGNMENTS_CONFIG,
	conditions: CONDITIONS_CONFIG,
	spellschools: MAGIC_SCHOOLS_CONFIG,
	classes: CLASSES_CONFIG,
	sizes: createGenericConfig('sizes', 'Size', 'cyan'),
	itemrarities: createGenericConfig('itemrarities', 'Item Rarity', 'yellow'),
	environments: PLANES_CONFIG,
	abilities: ABILITY_SCORES_CONFIG,
	skills: SKILLS_CONFIG,
	rules: RULES_CONFIG,
	rulesections: RULE_SECTIONS_CONFIG,
	rulesets: createGenericConfig('rulesets', 'Rule Set', 'rose'),
	images: createGenericConfig('images', 'Image', 'pink'),
	weaponproperties: WEAPON_PROPERTIES_CONFIG,
	services: createGenericConfig('services', 'Service', 'orange')
};

// Derive URL path mapping from config keys
// Maps URL path segment → DB type (override where path differs from DB type name)
const PATH_TO_DB_TYPE: Record<string, string> = {
	// Main compendium types - URL path → DB type (matches actual DB values)
	spells: 'spells',
	creatures: 'creatures',
	feats: 'feats',
	backgrounds: 'backgrounds',
	races: 'races',
	classes: 'classes',
	items: 'items',
	weapons: 'weapons',
	conditions: 'conditions',
	languages: 'languages',
	alignments: 'alignments',
	skills: 'skills',
	planes: 'planes',
	species: 'species',
	magicitems: 'magicitems',
	spellschools: 'spellschools',
	damagetypes: 'damagetypes',
	weaponproperties: 'weaponproperties',
	creaturetypes: 'creaturetypes',
	rulesections: 'rulesections',
	itemcategories: 'itemcategories',
	equipmentcategories: 'equipmentcategories',
	itemrarities: 'itemrarities',
	environments: 'environments',
	abilities: 'abilities',
	armor: 'armor',
	sections: 'sections',
	// Backward compatibility: old 'monsters' URL path maps to new 'creature' DB type
	monsters: 'creature'
};

// Build PATH_TO_TYPE: maps URL path → DB type
// Start with explicit path mappings from PATH_TO_DB_TYPE
const PATH_TO_TYPE: Record<string, CompendiumTypeName> = { ...PATH_TO_DB_TYPE } as Record<
	string,
	CompendiumTypeName
>;

// Add entries for CONFIG_MAP keys that don't have explicit mappings
// This handles cases where path === DB type (no override needed)
for (const dbType of Object.keys(CONFIG_MAP)) {
	if (!(dbType in PATH_TO_TYPE)) {
		PATH_TO_TYPE[dbType] = dbType as CompendiumTypeName;
	}
}

/**
 * Get the configuration for a specific compendium type
 */
export function getCompendiumConfig(type: CompendiumTypeName | string): CompendiumTypeConfig {
	// Handle backward compatibility: 'creature' or 'monsters' -> 'creatures'
	const normalizedType =
		type === 'creature' || type === 'monsters' ? 'creatures' : type;
	if (normalizedType in CONFIG_MAP) {
		return CONFIG_MAP[normalizedType as CompendiumTypeName];
	}
	if (type in PATH_TO_TYPE) {
		return CONFIG_MAP[PATH_TO_TYPE[type]];
	}
	throw new Error(`No compendium configuration found for type: ${type}`);
}

/**
 * Get the unified type from a URL path segment (singular form)
 */
export function getTypeFromPath(path: string): CompendiumType {
	const dbType = PATH_TO_TYPE[path];
	if (!dbType) {
		throw new Error(`Unknown compendium path: ${path}`);
	}
	const singularType = HOMEBREW_TYPE_TO_DB_TYPE[dbType] || dbType.slice(0, -1);
	return singularType as CompendiumType;
}

/**
 * Get the DB type from a URL path segment (plural form)
 */
export function getDbTypeFromPath(path: string): CompendiumTypeName {
	const dbType = PATH_TO_TYPE[path];
	if (!dbType) {
		throw new Error(`Unknown compendium path: ${path}`);
	}
	return dbType;
}

/**
 * Mapping from plural form (used in forms/API) to singular DB type
 * Used by homebrew to convert user-facing types to DB types
 */
export const HOMEBREW_TYPE_TO_DB_TYPE: Record<string, string> = {
	spells: 'spell',
	creatures: 'creature',
	magicitems: 'item',
	feats: 'feat',
	backgrounds: 'background',
	species: 'races',
	classes: 'class',
	subclasses: 'subclass',
	subraces: 'subrace',
	weapons: 'weapon',
	armor: 'armor',
	sections: 'section',
	planes: 'plane',
	conditions: 'condition',
	skills: 'skill',
	languages: 'language',
	alignments: 'alignment'
};

export { SPELLS_CONFIG } from './spells';
export { CREATURES_CONFIG } from './creatures';
export { FEATS_CONFIG } from './feats';
export { BACKGROUNDS_CONFIG } from './backgrounds';
export { RACES_CONFIG } from './races';
export { CLASSES_CONFIG } from './classes';
export { ITEMS_CONFIG } from './items';
export { WEAPONS_CONFIG } from './weapons';
export { ARMOR_CONFIG } from './armor';
export { CONDITIONS_CONFIG } from './conditions';
export { PLANES_CONFIG } from './planes';
export {
	SKILLS_CONFIG,
	LANGUAGES_CONFIG,
	ALIGNMENTS_CONFIG,
	DAMAGE_TYPES_CONFIG,
	MAGIC_SCHOOLS_CONFIG,
	MONSTER_TYPES_CONFIG,
	RULE_SECTIONS_CONFIG,
	ABILITY_SCORES_CONFIG,
	WEAPON_PROPERTIES_CONFIG,
	EQUIPMENT_CATEGORIES_CONFIG,
	RULES_CONFIG
} from './reference';
