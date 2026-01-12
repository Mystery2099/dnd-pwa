/**
 * Compendium Configuration Registry
 *
 * Centralizes all compendium type-specific configurations.
 */

import type { CompendiumTypeConfig, CompendiumTypeName } from '$lib/core/types/compendium';
import { SPELLS_CONFIG } from './spells';
import { MONSTERS_CONFIG } from './monsters';
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
	creatures: MONSTERS_CONFIG,
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

// Map URL path segments to database types (aligned with Open5e API v2)
const PATH_TO_TYPE: Record<string, CompendiumTypeName> = {
	spells: 'spells',
	creatures: 'creatures',
	magicitems: 'magicitems',
	itemsets: 'itemsets',
	itemcategories: 'itemcategories',
	documents: 'documents',
	licenses: 'licenses',
	publishers: 'publishers',
	weapons: 'weapons',
	armor: 'armor',
	gamesystems: 'gamesystems',
	backgrounds: 'backgrounds',
	feats: 'feats',
	species: 'species',
	creaturetypes: 'creaturetypes',
	creaturesets: 'creaturesets',
	damagetypes: 'damagetypes',
	languages: 'languages',
	alignments: 'alignments',
	conditions: 'conditions',
	spellschools: 'spellschools',
	classes: 'classes',
	sizes: 'sizes',
	itemrarities: 'itemrarities',
	environments: 'environments',
	abilities: 'abilities',
	skills: 'skills',
	rules: 'rules',
	rulesections: 'rulesections',
	rulesets: 'rulesets',
	images: 'images',
	weaponproperties: 'weaponproperties',
	services: 'services'
};

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
export { MONSTERS_CONFIG } from './monsters';
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
