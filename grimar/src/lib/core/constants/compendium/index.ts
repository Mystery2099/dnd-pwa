/**
 * Compendium Configuration Registry
 *
 * Centralizes all compendium type-specific configurations.
 */

import type { CompendiumTypeConfig, CompendiumTypeName } from '$lib/core/types/compendium';
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
	// Main compendium types - URL path (plural) → DB type (singular)
	spells: 'spell',
	creatures: 'creature',
	feats: 'feat',
	backgrounds: 'background',
	races: 'race',
	classes: 'class',
	items: 'item',
	weapons: 'weapon',
	conditions: 'condition',
	planes: 'plane',
	sections: 'section',
	// Override types where path differs from DB type name
	species: 'races',
	magicitems: 'item',
	spellschools: 'magic-schools',
	damagetypes: 'damage-types',
	weaponproperties: 'weapon-properties',
	creaturetypes: 'creature-types',
	rulesections: 'rule-sections',
	itemcategories: 'item-categories',
	equipmentcategories: 'equipment-categories',
	itemrarities: 'item-rarities',
	environments: 'environments',
	abilities: 'ability-scores',
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
	if (type in CONFIG_MAP) {
		return CONFIG_MAP[type as CompendiumTypeName];
	}
	if (type in PATH_TO_TYPE) {
		return CONFIG_MAP[PATH_TO_TYPE[type]];
	}
	throw new Error(`No compendium configuration found for type: ${type}`);
}

/**
 * Get the database type from a URL path segment
 */
export function getTypeFromPath(path: string): CompendiumTypeName {
	const type = PATH_TO_TYPE[path];
	if (!type) {
		throw new Error(`Unknown compendium path: ${path}`);
	}
	return type;
}

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
