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
import { SUBCLASSES_CONFIG } from './subclasses';
import { SUBRACES_CONFIG } from './subraces';
import { TRAITS_CONFIG } from './traits';
import {
	SKILLS_CONFIG,
	LANGUAGES_CONFIG,
	ALIGNMENTS_CONFIG,
	DAMAGE_TYPES_CONFIG,
	MAGIC_SCHOOLS_CONFIG,
	EQUIPMENT_CONFIG,
	VEHICLES_CONFIG,
	MONSTER_TYPES_CONFIG,
	RULE_SECTIONS_CONFIG,
	FEATURES_CONFIG,
	PROFICIENCIES_CONFIG,
	ABILITY_SCORES_CONFIG,
	WEAPON_PROPERTIES_CONFIG,
	EQUIPMENT_CATEGORIES_CONFIG,
	RULES_CONFIG
} from './reference';

// Map database type names to their configuration objects
const CONFIG_MAP: Record<CompendiumTypeName, CompendiumTypeConfig> = {
	spell: SPELLS_CONFIG,
	monster: MONSTERS_CONFIG,
	feat: FEATS_CONFIG,
	background: BACKGROUNDS_CONFIG,
	race: RACES_CONFIG,
	class: CLASSES_CONFIG,
	item: ITEMS_CONFIG,
	subclass: SUBCLASSES_CONFIG,
	subrace: SUBRACES_CONFIG,
	trait: TRAITS_CONFIG,
	feature: FEATURES_CONFIG,
	skill: SKILLS_CONFIG,
	language: LANGUAGES_CONFIG,
	alignment: ALIGNMENTS_CONFIG,
	damageType: DAMAGE_TYPES_CONFIG,
	magicSchool: MAGIC_SCHOOLS_CONFIG,
	equipment: EQUIPMENT_CONFIG,
	vehicle: VEHICLES_CONFIG,
	monsterType: MONSTER_TYPES_CONFIG,
	ruleSection: RULE_SECTIONS_CONFIG,
	weapon: WEAPONS_CONFIG,
	armor: ARMOR_CONFIG,
	condition: CONDITIONS_CONFIG,
	plane: PLANES_CONFIG,
	section: SECTIONS_CONFIG,
	proficiency: PROFICIENCIES_CONFIG,
	abilityScore: ABILITY_SCORES_CONFIG,
	weaponProperty: WEAPON_PROPERTIES_CONFIG,
	equipmentCategory: EQUIPMENT_CATEGORIES_CONFIG,
	rule: RULES_CONFIG
};

// Map URL path segments to database types
const PATH_TO_TYPE: Record<string, CompendiumTypeName> = {
	spells: 'spell',
	monsters: 'monster',
	feats: 'feat',
	backgrounds: 'background',
	races: 'race',
	classes: 'class',
	magicitems: 'item',
	subclasses: 'subclass',
	subraces: 'subrace',
	traits: 'trait',
	features: 'feature',
	skills: 'skill',
	languages: 'language',
	alignments: 'alignment',
	'damage-types': 'damageType',
	'magic-schools': 'magicSchool',
	equipment: 'equipment',
	vehicles: 'vehicle',
	'monster-types': 'monsterType',
	'rule-sections': 'ruleSection',
	weapons: 'weapon',
	armor: 'armor',
	conditions: 'condition',
	planes: 'plane',
	sections: 'section',
	proficiencies: 'proficiency',
	'ability-scores': 'abilityScore',
	'weapon-properties': 'weaponProperty',
	'equipment-categories': 'equipmentCategory',
	rules: 'rule'
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
export { SECTIONS_CONFIG } from './sections';
export { SUBCLASSES_CONFIG } from './subclasses';
export { SUBRACES_CONFIG } from './subraces';
export { TRAITS_CONFIG } from './traits';
export {
	SKILLS_CONFIG,
	LANGUAGES_CONFIG,
	ALIGNMENTS_CONFIG,
	DAMAGE_TYPES_CONFIG,
	MAGIC_SCHOOLS_CONFIG,
	EQUIPMENT_CONFIG,
	VEHICLES_CONFIG,
	MONSTER_TYPES_CONFIG,
	RULE_SECTIONS_CONFIG,
	FEATURES_CONFIG,
	PROFICIENCIES_CONFIG,
	ABILITY_SCORES_CONFIG,
	WEAPON_PROPERTIES_CONFIG,
	EQUIPMENT_CATEGORIES_CONFIG,
	RULES_CONFIG
} from './reference';
