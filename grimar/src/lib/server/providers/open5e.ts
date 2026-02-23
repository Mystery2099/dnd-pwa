import { COMPENDIUM_TYPES, type CompendiumType } from '$lib/server/db/schema';
import { upsertItems, clearType, getTypeCounts } from '$lib/server/repositories/compendium';
import type { CompendiumProvider, SyncResult, ProviderStats, SyncProgressCallback } from './types';

const API_BASE = 'http://10.147.20.240:8888/v2';
const PAGE_SIZE = 100;

const TYPE_ENDPOINTS: Record<CompendiumType, string> = {
	species: 'species',
	classes: 'classes',
	classfeatures: 'classfeatures',
	backgrounds: 'backgrounds',
	feats: 'feats',
	spells: 'spells',
	spellschools: 'spellschools',
	skills: 'skills',
	languages: 'languages',
	alignments: 'alignments',
	abilities: 'abilities',
	damagetypes: 'damagetypes',
	conditions: 'conditions',
	weaponproperties: 'weaponproperties',
	itemcategories: 'itemcategories',
	itemsets: 'itemsets',
	creatures: 'creatures',
	creaturetypes: 'creaturetypes',
	creaturesets: 'creaturesets',
	rules: 'rules',
	rulesections: 'rulesections',
	weapons: 'weapons',
	armor: 'armor',
	items: 'items',
	magicitems: 'magicitems',
	environments: 'environments',
	sizes: 'sizes',
	itemrarities: 'itemrarities',
	rulesets: 'rulesets',
	documents: 'documents',
	licenses: 'licenses',
	publishers: 'publishers',
	gamesystems: 'gamesystems',
	images: 'images',
	services: 'services',
	classfeatureitems: 'classfeatureitems',
	creatureactions: 'creatureactions',
	creatureactionattacks: 'creatureactionattacks',
	creaturetraits: 'creaturetraits',
	speciestraits: 'speciestraits',
	backgroundbenefits: 'backgroundbenefits',
	featbenefits: 'featbenefits',
	spellcastingoptions: 'spellcastingoptions',
	weaponpropertyassignments: 'weaponpropertyassignments'
};

const SYNCABLE_TYPES: CompendiumType[] = [
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

interface ApiItem {
	key: string;
	name: string;
	document?: {
		key?: string;
		name?: string;
		publisher?: { key?: string; name?: string };
		gamesystem?: { key?: string; name?: string };
	};
	desc?: string;
	description?: string;
	[key: string]: unknown;
}

interface PaginatedResponse {
	results: ApiItem[];
	next: string | null;
}

async function fetchAllPages(endpoint: string): Promise<ApiItem[]> {
	const items: ApiItem[] = [];
	let url: string | null = `${API_BASE}/${endpoint}/?limit=${PAGE_SIZE}`;

	while (url) {
		const response: Response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
		}
		const data: PaginatedResponse = await response.json();
		items.push(...(data.results || []));
		url = data.next;
	}

	return items;
}

function transformToCompendiumItem(item: ApiItem, type: CompendiumType) {
	return {
		key: item.key,
		type,
		name: item.name,
		source: 'open5e',
		documentKey: item.document?.key ?? null,
		documentName: item.document?.name ?? null,
		gamesystemKey: item.document?.gamesystem?.key ?? null,
		gamesystemName: item.document?.gamesystem?.name ?? null,
		publisherKey: item.document?.publisher?.key ?? null,
		publisherName: item.document?.publisher?.name ?? null,
		description: item.desc ?? item.description ?? null,
		data: item,
		createdBy: null
	};
}

async function syncType(
	type: CompendiumType,
	onProgress?: SyncProgressCallback
): Promise<{ count: number; error?: string }> {
	try {
		onProgress?.({
			provider: 'open5e',
			type,
			status: 'fetching',
			itemsProcessed: 0
		});

		const endpoint = TYPE_ENDPOINTS[type];
		if (!endpoint) {
			throw new Error(`Unknown type: ${type}`);
		}

		const items = await fetchAllPages(endpoint);

		onProgress?.({
			provider: 'open5e',
			type,
			status: 'transforming',
			itemsProcessed: 0,
			totalItems: items.length
		});

		const transformed = items.map((item) => transformToCompendiumItem(item, type));

		onProgress?.({
			provider: 'open5e',
			type,
			status: 'saving',
			itemsProcessed: 0,
			totalItems: transformed.length
		});

		await clearType(type);
		await upsertItems(transformed);

		onProgress?.({
			provider: 'open5e',
			type,
			status: 'complete',
			itemsProcessed: transformed.length,
			totalItems: transformed.length
		});

		return { count: transformed.length };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		onProgress?.({
			provider: 'open5e',
			type,
			status: 'error',
			itemsProcessed: 0,
			error: errorMessage
		});
		return { count: 0, error: errorMessage };
	}
}

export const open5eProvider: CompendiumProvider = {
	name: 'open5e',
	displayName: 'Open5e',
	description: 'Open5e API - D&D 5e SRD and compatible content',

	async sync(onProgress?: SyncProgressCallback): Promise<SyncResult> {
		const startTime = Date.now();
		const errors: string[] = [];
		let totalItems = 0;

		for (const type of SYNCABLE_TYPES) {
			const result = await syncType(type, onProgress);
			totalItems += result.count;
			if (result.error) {
				errors.push(`${type}: ${result.error}`);
			}
		}

		return {
			success: errors.length === 0,
			itemsSynced: totalItems,
			errors,
			duration: Date.now() - startTime
		};
	},

	async getStats(): Promise<ProviderStats> {
		const counts = await getTypeCounts();
		return {
			totalItems: Object.values(counts).reduce((sum, count) => sum + count, 0),
			itemsByType: counts,
			lastSync: undefined
		};
	}
};

export { SYNCABLE_TYPES, TYPE_ENDPOINTS };
