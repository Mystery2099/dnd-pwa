/**
 * Open5e API Provider
 * 
 * Fetches compendium data from self-hosted Open5e API server.
 * Directly maps API responses to the simplified compendium schema.
 */

import { BaseProvider } from './base-provider';
import type {
	CompendiumProvider,
	FetchOptions,
	ProviderListResponse,
	TransformResult
} from './types';

import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('Open5eApiProvider');

interface ApiListResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

interface ApiDocument {
	key: string;
	name: string;
	publisher?: {
		key: string;
		name: string;
	};
	gamesystem?: {
		key: string;
		name: string;
	};
}

interface ApiItem {
	key?: string;
	url?: string;
	name: string;
	desc?: string;
	document?: ApiDocument;
	[key: string]: unknown;
}

const OPEN5E_API_URL = process.env.OPEN5E_API_URL || 'http://10.147.20.240:8888';
const OPEN5E_SYNC_BATCH_SIZE = parseInt(process.env.OPEN5E_SYNC_BATCH_SIZE || '100', 10);

import { COMPENDIUM_TYPES, type CompendiumType } from '$lib/server/db/schema';

const TYPE_ENDPOINTS: Record<CompendiumType, string> = {
	spells: 'spells',
	creatures: 'creatures',
	species: 'species',
	magicitems: 'magicitems',
	classes: 'classes',
	weapons: 'weapons',
	armor: 'armor',
	backgrounds: 'backgrounds',
	feats: 'feats',
	rules: 'rules',
	damagetypes: 'damagetypes',
	spellschools: 'spellschools',
	creaturetypes: 'creaturetypes',
	environments: 'environments',
	skills: 'skills',
	languages: 'languages',
	alignments: 'alignments',
	conditions: 'conditions',
	abilities: 'abilities',
	sizes: 'sizes',
	itemcategories: 'itemcategories',
	itemrarities: 'itemrarities',
	documents: 'documents',
	gamesystems: 'gamesystems',
	publishers: 'publishers',
	licenses: 'licenses',
	images: 'images',
	itemsets: 'itemsets',
	rulesections: 'rulesections',
	rulesets: 'rulesets',
	weaponproperties: 'weaponproperties',
	services: 'services',
	classfeatures: 'classfeatures',
	classfeatureitems: 'classfeatureitems',
	creatureactions: 'creatureactions',
	creatureactionattacks: 'creatureactionattacks',
	creaturetraits: 'creaturetraits',
	speciestraits: 'speciestraits',
	backgroundbenefits: 'backgroundbenefits',
	featbenefits: 'featbenefits',
	spellcastingoptions: 'spellcastingoptions',
	weaponpropertyassignments: 'weaponpropertyassignments',
	creaturesets: 'creaturesets'
};

const SUPPORTED_TYPES = [...COMPENDIUM_TYPES] as const;

export class Open5eApiProvider extends BaseProvider implements CompendiumProvider {
	readonly id = 'open5e';
	readonly name = 'Open5e API';
	readonly baseUrl: string;
	private batchSize: number;

	constructor() {
		super(SUPPORTED_TYPES);
		this.baseUrl = OPEN5E_API_URL;
		this.batchSize = OPEN5E_SYNC_BATCH_SIZE;
	}

	protected getEndpoint(type: CompendiumType): string {
		const endpoint = TYPE_ENDPOINTS[type];
		if (!endpoint) {
			throw new Error(`Unknown type: ${type}`);
		}
		return `${this.baseUrl}/v2/${endpoint}/`;
	}

	async fetchList(
		type: CompendiumType,
		options?: FetchOptions
	): Promise<ProviderListResponse<ApiItem>> {
		const endpoint = this.getEndpoint(type);
		const limit = options?.limit ?? this.batchSize;
		const offset = options?.offset ?? 0;

		const url = new URL(endpoint);
		url.searchParams.set('limit', String(limit));
		url.searchParams.set('offset', String(offset));

		log.debug({ type, url: url.toString() }, 'Fetching list');

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		const data: ApiListResponse<ApiItem> = await response.json();

		return {
			items: data.results,
			hasMore: data.next !== null,
			nextUrl: data.next ?? undefined
		};
	}

	async fetchAllPages(type: CompendiumType): Promise<ApiItem[]> {
		const allItems: ApiItem[] = [];
		let nextUrl: string | undefined = this.getEndpoint(type);
		let pageCount = 0;

		log.info({ type }, 'Starting full fetch');

		while (nextUrl) {
			pageCount++;

			const url = new URL(nextUrl);
			url.searchParams.set('limit', String(this.batchSize));

			const response = await fetch(url.toString());
			if (!response.ok) {
				throw new Error(`API error at ${nextUrl}: ${response.status}`);
			}

			const data: ApiListResponse<ApiItem> = await response.json();
			allItems.push(...data.results);

			log.debug(
				{ type, page: pageCount, items: data.results.length, total: allItems.length },
				'Fetched page'
			);

			nextUrl = data.next ?? undefined;

			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		log.info({ type, totalPages: pageCount, totalItems: allItems.length }, 'Full fetch complete');
		return allItems;
	}

	transformItem(rawItem: unknown, type: CompendiumType): TransformResult {
		const item = rawItem as ApiItem;

		const key = item.key ?? this.extractKeyFromUrl(item.url);
		if (!key) {
			throw new Error('Item missing key field');
		}

		const document = item.document;
		const publisher = document?.publisher;
		const gamesystem = document?.gamesystem;

		return {
			key,
			type,
			name: item.name || 'Unknown',
			source: 'open5e',
			documentKey: document?.key ?? null,
			documentName: document?.name ?? null,
			gamesystemKey: gamesystem?.key ?? null,
			gamesystemName: gamesystem?.name ?? null,
			publisherKey: publisher?.key ?? null,
			publisherName: publisher?.name ?? null,
			description: this.extractDescription(item.desc),
			data: { ...item, key }
		};
	}

	private extractKeyFromUrl(url?: string): string | null {
		if (!url) return null;
		const parts = url.replace(/\/$/, '').split('/');
		return parts[parts.length - 1] || null;
	}

	private extractDescription(desc?: string): string | null {
		if (!desc) return null;
		const cleaned = desc
			.replace(/<[^>]*>/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		return cleaned || null;
	}

	async healthCheck(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/v2/`, {
				method: 'GET',
				signal: AbortSignal.timeout(5000)
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}

export const open5eApiProvider = new Open5eApiProvider();
