import type { CompendiumType } from '$lib/server/db/schema';

const DEFAULT_OPEN5E_API_BASE = 'http://10.147.20.240:8888/v2';

function normalizeBaseUrl(url: string): string {
	return url.trim().replace(/\/+$/, '');
}

function ensureV2Suffix(url: string): string {
	return /\/v2$/i.test(url) ? url : `${url}/v2`;
}

function resolveOpen5eApiBaseUrl(): string {
	const explicitBaseUrl = process.env.OPEN5E_API_BASE_URL?.trim();
	if (explicitBaseUrl) {
		return ensureV2Suffix(normalizeBaseUrl(explicitBaseUrl));
	}

	// Backward compatibility for older local env files on long-lived branches.
	const legacyApiUrl = process.env.OPEN5E_API_URL?.trim();
	if (legacyApiUrl) {
		return ensureV2Suffix(normalizeBaseUrl(legacyApiUrl));
	}

	return DEFAULT_OPEN5E_API_BASE;
}

export const OPEN5E_API_BASE_URL = resolveOpen5eApiBaseUrl();

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
