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
import { SECTIONS_CONFIG } from './sections';

// Map database type names to their configuration objects
const CONFIG_MAP: Record<CompendiumTypeName, CompendiumTypeConfig> = {
	spell: SPELLS_CONFIG,
	monster: MONSTERS_CONFIG,
	feat: FEATS_CONFIG,
	background: BACKGROUNDS_CONFIG,
	race: RACES_CONFIG,
	class: CLASSES_CONFIG,
	item: ITEMS_CONFIG,
	weapon: WEAPONS_CONFIG,
	armor: ARMOR_CONFIG,
	condition: CONDITIONS_CONFIG,
	plane: PLANES_CONFIG,
	section: SECTIONS_CONFIG
};

// Map URL path segments to database types
// Note: 'characters' is not included here - characters are stored in a separate table, not compendium_items
const PATH_TO_TYPE: Record<string, CompendiumTypeName> = {
	spells: 'spell',
	monsters: 'monster',
	feats: 'feat',
	backgrounds: 'background',
	races: 'race',
	classes: 'class',
	magicitems: 'item',
	weapons: 'weapon',
	armor: 'armor',
	conditions: 'condition',
	planes: 'plane',
	sections: 'section'
};

/**
 * Get the configuration for a specific compendium type
 */
export function getCompendiumConfig(type: CompendiumTypeName | string): CompendiumTypeConfig {
	// Try direct lookup
	if (type in CONFIG_MAP) {
		return CONFIG_MAP[type as CompendiumTypeName];
	}
	// Try path lookup
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

/**
 * Get all available compendium configurations
 */

/**
 * Check if a compendium type or path is supported
 */

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
export { SECTIONS_CONFIG } from './sections';
