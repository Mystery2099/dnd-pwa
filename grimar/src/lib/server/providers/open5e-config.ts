import type { CompendiumType } from '$lib/server/db/schema';

const DEFAULT_OPEN5E_API_BASE = 'http://10.147.20.240:8888/v2';

export const OPEN5E_API_BASE_URL =
	process.env.OPEN5E_API_BASE_URL?.trim() || DEFAULT_OPEN5E_API_BASE;

export const OPEN5E_SYNCABLE_TYPES: CompendiumType[] = [
	'species',
	'classes',
	'backgrounds',
	'feats',
	'spells',
	'spellschools',
	'skills',
	'languages',
	'alignments',
	'abilities',
	'damagetypes',
	'conditions',
	'weaponproperties',
	'itemcategories',
	'itemsets',
	'creatures',
	'creaturetypes',
	'creaturesets',
	'weapons',
	'armor',
	'items',
	'magicitems',
	'environments',
	'sizes',
	'itemrarities',
	'documents',
	'licenses',
	'publishers',
	'gamesystems',
	'rules',
	'rulesets',
	'images',
	'services'
];
