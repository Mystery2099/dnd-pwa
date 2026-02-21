/**
 * Homebrew Provider
 *
 * File-based provider for custom homebrew content.
 * Aligned with Open5e API v2 schema for consistency.
 * Reads data from JSON files in the data/homebrew directory.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { BaseProvider } from './base-provider';
import type { ProviderListResponse, TransformResult } from './types';
import { COMPENDIUM_TYPES, type CompendiumType } from '$lib/server/db/schema';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('HomebrewProvider');

interface HomebrewItem {
	key?: string;
	name: string;
	desc?: string;
	document?: {
		key?: string;
		name?: string;
		publisher?: { key?: string; name?: string };
		gamesystem?: { key?: string; name?: string };
	};
	[key: string]: unknown;
}

const SUPPORTED_TYPES = COMPENDIUM_TYPES.filter((t) =>
	['spells', 'creatures', 'magicitems', 'feats', 'backgrounds', 'species', 'classes'].includes(t)
);

export class HomebrewProvider extends BaseProvider {
	readonly id = 'homebrew';
	readonly name = 'Homebrew';
	readonly baseUrl = '';

	private dataPath: string;
	private loadedData: Map<string, unknown[]> = new Map();

	constructor(dataPath: string = 'data/homebrew') {
		super(SUPPORTED_TYPES);
		this.dataPath = dataPath;
	}

	async fetchList(type: CompendiumType): Promise<ProviderListResponse> {
		const items = this.loadFromFile(type);
		this.loadedData.set(type, items);
		return {
			items,
			hasMore: false
		};
	}

	async fetchAllPages(type: CompendiumType): Promise<unknown[]> {
		return this.loadFromFile(type);
	}

	async fetchDetail(type: CompendiumType, key: string): Promise<Record<string, unknown>> {
		const items = this.loadedData.get(type) || [];
		const item = items.find((i) => this.getItemKey(i as HomebrewItem) === key);
		if (!item) {
			throw new Error(`Homebrew item not found: ${type}/${key}`);
		}
		return item as Record<string, unknown>;
	}

	transformItem(rawItem: unknown, type: CompendiumType): TransformResult {
		const item = rawItem as HomebrewItem;
		const key = this.getItemKey(item);
		const document = item.document;
		const publisher = document?.publisher;
		const gamesystem = document?.gamesystem;

		return {
			key,
			type,
			name: item.name || 'Unknown',
			source: 'homebrew',
			documentKey: document?.key ?? 'homebrew',
			documentName: document?.name ?? 'Homebrew',
			gamesystemKey: gamesystem?.key ?? '5e-2014',
			gamesystemName: gamesystem?.name ?? 'D&D 5e (2014)',
			publisherKey: publisher?.key ?? 'homebrew',
			publisherName: publisher?.name ?? 'Homebrew',
			description: this.extractDescription(item.desc),
			data: { ...item, key }
		};
	}

	private getItemKey(item: HomebrewItem): string {
		if (item.key) return item.key;
		const slug = item.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_|_$/g, '');
		return `homebrew_${slug}_${nanoid(6)}`;
	}

	private extractDescription(desc?: string): string | null {
		if (!desc) return null;
		const cleaned = desc
			.replace(/<[^>]*>/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		return cleaned || null;
	}

	private loadFromFile(type: CompendiumType): unknown[] {
		const fileMap: Record<string, string> = {
			spells: 'spells.json',
			creatures: 'creatures.json',
			magicitems: 'magicitems.json',
			feats: 'feats.json',
			backgrounds: 'backgrounds.json',
			species: 'species.json',
			classes: 'classes.json'
		};

		const fileName = fileMap[type] || `${type}.json`;
		const filePath = join(process.cwd(), this.dataPath, fileName);

		if (!existsSync(filePath)) {
			log.warn({ filePath }, 'File not found');
			return [];
		}

		try {
			const content = readFileSync(filePath, 'utf-8');
			const data = JSON.parse(content) as unknown[];

			if (!Array.isArray(data)) {
				log.error({ fileName }, 'Invalid data - expected array');
				return [];
			}

			log.info({ fileName, itemCount: data.length }, 'Loaded items from file');
			return data;
		} catch (error) {
			log.error({ fileName, error }, 'Failed to load file');
			return [];
		}
	}

	protected getEndpoint(_type: CompendiumType): string {
		throw new Error('Homebrew provider does not use API endpoints');
	}
}

export const homebrewProvider = new HomebrewProvider();
