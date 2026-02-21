/**
 * Compendium Configuration Registry
 * 
 * Simplified for new API-based schema.
 * All data comes from the API, not static configs.
 */

import type { CompendiumType } from '$lib/core/types/compendium';
import {
	COMPENDIUM_TYPE_REGISTRY,
	DB_TYPES,
	PATH_TO_DB_TYPE,
	DB_TYPE_TO_PATH,
	type DbType
} from './registry';

export { PATH_TO_DB_TYPE, DB_TYPE_TO_PATH, DB_TYPES };
export { COMPENDIUM_TYPE_REGISTRY };
export { getDashboardCards, getSidebarItems } from './registry';

const PATH_TO_TYPE: Record<string, CompendiumType> = {} as Record<string, CompendiumType>;

for (const [registryKey, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
	const urlPath = entry.urlPath || registryKey;
	PATH_TO_TYPE[urlPath] = registryKey as CompendiumType;
	PATH_TO_TYPE[registryKey] = registryKey as CompendiumType;
	PATH_TO_TYPE[entry.dbType] = registryKey as CompendiumType;
	if (entry.aliases) {
		for (const alias of entry.aliases) {
			PATH_TO_TYPE[alias] = registryKey as CompendiumType;
		}
	}
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
	return dbType;
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

export function getCompendiumTypeConfig(type: string) {
	const normalizedType = normalizeTypeName(type);
	const entry = COMPENDIUM_TYPE_REGISTRY[normalizedType];
	if (!entry) {
		throw new Error(`No compendium configuration found for type: ${type}`);
	}
	return entry;
}
