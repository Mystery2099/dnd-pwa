/**
 * Homebrew Provider
 *
 * File-based provider for custom homebrew content.
 * Reads data from JSON files in the data/homebrew directory.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { BaseProvider } from './base-provider';
import type { ProviderListResponse, TransformResult } from './types';
import type { CompendiumTypeName } from '$lib/types/compendium';

/**
 * Homebrew item structure (follows Open5e format for compatibility)
 */
interface HomebrewItem {
	slug?: string;
	index?: string;
	id?: string;
	name: string;
	level?: number | string;
	school?: string | { name: string };
	size?: string;
	type?: string;
	challenge_rating?: number | string;
	feat?: {
		prerequisites?: string[];
		description?: string[];
	};
	background?: {
		feature?: { name: string };
		skill_proficiencies?: string[];
	};
	race?: {
		size?: string;
		speed?: number;
		ability_bonuses?: Record<string, number>;
	};
	class?: {
		hit_die?: number;
	};
	[key: string]: unknown; // Allow any additional fields
}

/**
 * Homebrew Provider Implementation
 * Loads data from local JSON files
 */
export class HomebrewProvider extends BaseProvider {
	readonly id = 'homebrew';
	readonly name = 'Homebrew';
	readonly baseUrl = '';
	readonly supportedTypes = [
		'spell',
		'monster',
		'item',
		'feat',
		'background',
		'race',
		'class'
	] as const;

	private dataPath: string;
	private loadedData: Map<string, unknown[]> = new Map();

	constructor(dataPath: string = 'data/homebrew') {
		super();
		this.dataPath = dataPath;
	}

	async fetchList(type: CompendiumTypeName): Promise<ProviderListResponse> {
		const items = this.loadFromFile(type);
		this.loadedData.set(type, items);
		return {
			items,
			hasMore: false
		};
	}

	async fetchAllPages(type: CompendiumTypeName): Promise<unknown[]> {
		return this.loadFromFile(type);
	}

	async fetchDetail(
		type: CompendiumTypeName,
		externalId: string
	): Promise<Record<string, unknown>> {
		const items = this.loadedData.get(type) || [];
		const item = items.find((i) => this.getExternalId(i) === externalId);
		if (!item) {
			throw new Error(`Homebrew item not found: ${type}/${externalId}`);
		}
		return item as Record<string, unknown>;
	}

	private getExternalId(item: unknown): string {
		const homebrewItem = item as HomebrewItem;
		return homebrewItem.slug || homebrewItem.index || homebrewItem.id || this.generateId();
	}

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult {
		const item = rawItem as HomebrewItem;
		const externalId = item.slug || item.index || item.id || this.generateId();

		switch (type) {
			case 'spell':
				return this.transformSpell(item, externalId);
			case 'monster':
				return this.transformMonster(item, externalId);
			case 'feat':
				return this.transformFeat(item, externalId);
			case 'background':
				return this.transformBackground(item, externalId);
			case 'race':
				return this.transformRace(item, externalId);
			case 'class':
				return this.transformClass(item, externalId);
			default:
				return this.transformGeneric(item, externalId);
		}
	}

	private transformSpell(item: HomebrewItem, externalId: string): TransformResult {
		let level = 0;
		if (typeof item.level === 'number') {
			level = item.level;
		} else if (typeof item.level === 'string') {
			if (item.level === 'Cantrip') {
				level = 0;
			} else {
				level = parseInt(item.level) || 0;
			}
		}

		let schoolName = 'Unknown';
		if (typeof item.school === 'string') {
			schoolName = item.school;
		} else if (item.school?.name) {
			schoolName = item.school.name;
		}
		schoolName = this.toTitleCase(schoolName);

		const summary = level === 0 ? `Cantrip ${schoolName}` : `Level ${level} ${schoolName}`;

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			spellLevel: level,
			spellSchool: schoolName
		};
	}

	private transformMonster(item: HomebrewItem, externalId: string): TransformResult {
		const size = this.toTitleCase(item.size || 'Medium');
		const typeName = this.toTitleCase(item.type || 'Humanoid');
		const cr = String(item.challenge_rating || '0');

		const summary = `${size} ${typeName}, CR ${cr}`;

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			challengeRating: cr,
			monsterSize: size,
			monsterType: typeName
		};
	}

	private transformFeat(item: HomebrewItem, externalId: string): TransformResult {
		const summary = item.feat?.prerequisites?.length
			? `Prerequisite: ${item.feat.prerequisites.join(', ')}`
			: 'Feat';

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			featPrerequisites: item.feat?.prerequisites?.join(', ') || '',
			featBenefits: item.feat?.description || []
		};
	}

	private transformBackground(item: HomebrewItem, externalId: string): TransformResult {
		const summary = item.background?.feature
			? `Feature: ${item.background.feature.name}`
			: 'Background';

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			backgroundFeature: item.background?.feature?.name || '',
			backgroundSkillProficiencies: item.background?.skill_proficiencies?.join(', ') || ''
		};
	}

	private transformRace(item: HomebrewItem, externalId: string): TransformResult {
		const size = this.toTitleCase(item.race?.size || 'Medium');

		const summary = `${size} | Speed ${item.race?.speed || 30}`;

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			raceSize: size,
			raceSpeed: item.race?.speed || 30,
			raceAbilityScores: item.race?.ability_bonuses || {}
		};
	}

	private transformClass(item: HomebrewItem, externalId: string): TransformResult {
		const summary = `Hit Die: d${item.class?.hit_die || 8}`;

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			classHitDie: item.class?.hit_die || 8
		};
	}

	private transformGeneric(item: HomebrewItem, externalId: string): TransformResult {
		return {
			externalId,
			name: item.name,
			summary: `${item.name} (Homebrew)`,
			details: item
		};
	}

	private loadFromFile(type: CompendiumTypeName): unknown[] {
		const fileName = type === 'spell' ? 'spells.json' : `${type}s.json`;
		const filePath = join(process.cwd(), this.dataPath, fileName);

		if (!existsSync(filePath)) {
			console.warn(`[homebrew] File not found: ${filePath}`);
			return [];
		}

		try {
			const content = readFileSync(filePath, 'utf-8');
			const data = JSON.parse(content) as unknown[];

			if (!Array.isArray(data)) {
				console.error(`[homebrew] Invalid data in ${fileName}: expected array`);
				return [];
			}

			console.info(`[homebrew] Loaded ${data.length} items from ${fileName}`);
			return data;
		} catch (error) {
			console.error(`[homebrew] Failed to load ${fileName}:`, error);
			return [];
		}
	}

	private generateId(): string {
		return nanoid(10);
	}

	protected getEndpoint(type: CompendiumTypeName): string {
		throw new Error('Homebrew provider does not use API endpoints');
	}
}
