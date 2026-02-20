/**
 * Compendium Configuration Registry
 *
 * Auto-generates CONFIG_MAP from COMPENDIUM_TYPE_REGISTRY.
 * Custom configs are linked via configSource in registry entries.
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
	RULES_CONFIG,
	createGenericConfig
} from './reference';
import {
	COMPENDIUM_TYPE_REGISTRY,
	DB_TYPES,
	PATH_TO_DB_TYPE,
	DB_TYPE_TO_PATH,
	type DbType
} from './registry';

const CUSTOM_CONFIGS: Record<string, CompendiumTypeConfig> = {
	spells: SPELLS_CONFIG,
	creatures: CREATURES_CONFIG,
	magicitems: ITEMS_CONFIG,
	weapons: WEAPONS_CONFIG,
	armor: ARMOR_CONFIG,
	backgrounds: BACKGROUNDS_CONFIG,
	feats: FEATS_CONFIG,
	species: RACES_CONFIG,
	classes: CLASSES_CONFIG,
	conditions: CONDITIONS_CONFIG,
	environments: PLANES_CONFIG,
	damagetypes: DAMAGE_TYPES_CONFIG,
	languages: LANGUAGES_CONFIG,
	alignments: ALIGNMENTS_CONFIG,
	spellschools: MAGIC_SCHOOLS_CONFIG,
	creaturetypes: MONSTER_TYPES_CONFIG,
	abilities: ABILITY_SCORES_CONFIG,
	skills: SKILLS_CONFIG,
	rules: RULES_CONFIG,
	rulesections: RULE_SECTIONS_CONFIG,
	weaponproperties: WEAPON_PROPERTIES_CONFIG,
	itemcategories: EQUIPMENT_CATEGORIES_CONFIG
};

function buildConfigMap(): Record<CompendiumTypeName, CompendiumTypeConfig> {
	const configMap: Record<string, CompendiumTypeConfig> = {};

	for (const [registryKey, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
		if (entry.configSource && CUSTOM_CONFIGS[entry.configSource]) {
			configMap[registryKey] = CUSTOM_CONFIGS[entry.configSource];
		} else if (CUSTOM_CONFIGS[registryKey]) {
			configMap[registryKey] = CUSTOM_CONFIGS[registryKey];
		} else {
			configMap[registryKey] = createGenericConfig(
				entry.dbType,
				entry.displayName,
				entry.color
			);
		}
	}

	return configMap as Record<CompendiumTypeName, CompendiumTypeConfig>;
}

const CONFIG_MAP = buildConfigMap();

export { PATH_TO_DB_TYPE, DB_TYPE_TO_PATH };

const PATH_TO_TYPE: Record<string, CompendiumTypeName> = {} as Record<
	string,
	CompendiumTypeName
>;

for (const [registryKey, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
	const urlPath = entry.urlPath || registryKey;
	PATH_TO_TYPE[urlPath] = registryKey as CompendiumTypeName;
	PATH_TO_TYPE[registryKey] = registryKey as CompendiumTypeName;
	PATH_TO_TYPE[entry.dbType] = registryKey as CompendiumTypeName;
	if (entry.aliases) {
		for (const alias of entry.aliases) {
			PATH_TO_TYPE[alias] = registryKey as CompendiumTypeName;
		}
	}
}

export function getCompendiumConfig(type: CompendiumTypeName | string): CompendiumTypeConfig {
	const normalizedType = normalizeTypeName(type);

	if (normalizedType in CONFIG_MAP) {
		return CONFIG_MAP[normalizedType as CompendiumTypeName];
	}
	if (type in PATH_TO_TYPE) {
		return CONFIG_MAP[PATH_TO_TYPE[type]];
	}
	throw new Error(`No compendium configuration found for type: ${type}`);
}

function normalizeTypeName(type: string): string {
	switch (type) {
		case 'creature':
		case 'monster':
		case 'monsters':
			return DB_TYPES.CREATURES;
		case 'race':
		case 'races':
			return DB_TYPES.SPECIES;
		case 'item':
		case 'items':
			return DB_TYPES.MAGIC_ITEMS;
		default:
			return type;
	}
}

export function getTypeFromPath(path: string): CompendiumType {
	const dbType = PATH_TO_TYPE[path];
	if (!dbType) {
		throw new Error(`Unknown compendium path: ${path}`);
	}
	return dbType as CompendiumType;
}

export function getDbTypeFromPath(path: string): DbType {
	const dbType = PATH_TO_DB_TYPE[path];
	if (!dbType) {
		throw new Error(`Unknown compendium path: ${path}`);
	}
	return dbType;
}

export function getUrlPathFromDbType(dbType: string): string {
	return DB_TYPE_TO_PATH[dbType] || dbType;
}

export const HOMEBREW_TYPE_TO_DB_TYPE: Record<string, string> = {
	spells: 'spell',
	creatures: 'creature',
	magicitems: 'item',
	feats: 'feat',
	backgrounds: 'background',
	species: 'species',
	races: 'species',
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

export { DB_TYPES } from './registry';
export { getDashboardCards, getSidebarItems } from './registry';
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
