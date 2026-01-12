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
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('HomebrewProvider');

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

	private static readonly DEFAULT_TYPES = [
		'spells',
		'creatures',
		'magicitems',
		'feats',
		'backgrounds',
		'species',
		'classes'
	] as const satisfies readonly CompendiumTypeName[];

	private dataPath: string;
	private loadedData: Map<string, unknown[]> = new Map();

	constructor(dataPath: string = 'data/homebrew', supportedTypes?: readonly CompendiumTypeName[]) {
		super(supportedTypes ?? HomebrewProvider.DEFAULT_TYPES);
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
		const jsonData = JSON.stringify(item);

		switch (type) {
			case 'spells':
				return this.transformSpell(item, externalId, jsonData);
			case 'creatures':
				return this.transformMonster(item, externalId, jsonData);
			case 'feats':
				return this.transformFeat(item, externalId, jsonData);
			case 'backgrounds':
				return this.transformBackground(item, externalId, jsonData);
			case 'species':
				return this.transformRace(item, externalId, jsonData);
			case 'classes':
				return this.transformClass(item, externalId, jsonData);
			default:
				return this.transformGeneric(item, externalId, jsonData);
		}
	}

	private transformSpell(
		item: HomebrewItem,
		externalId: string,
		jsonData: string
	): TransformResult {
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
			jsonData,
			spellLevel: level,
			spellSchool: schoolName,
			sourcePublisher: 'homebrew'
		};
	}

	private transformMonster(
		item: HomebrewItem,
		externalId: string,
		jsonData: string
	): TransformResult {
		const size = this.toTitleCase(item.size || 'Medium');
		const typeName = this.toTitleCase(item.type || 'Humanoid');
		const cr = String(item.challenge_rating || '0');

		const summary = `${size} ${typeName}, CR ${cr}`;

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			jsonData,
			challengeRating: cr,
			monsterSize: size,
			monsterType: typeName,
			sourcePublisher: 'homebrew'
		};
	}

	private transformFeat(item: HomebrewItem, externalId: string, jsonData: string): TransformResult {
		const summary = item.feat?.prerequisites?.length
			? `Prerequisite: ${item.feat.prerequisites.join(', ')}`
			: 'Feat';

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			jsonData,
			featPrerequisites: item.feat?.prerequisites?.join(', ') || '',
			featBenefits: item.feat?.description || [],
			sourcePublisher: 'homebrew'
		};
	}

	private transformBackground(
		item: HomebrewItem,
		externalId: string,
		jsonData: string
	): TransformResult {
		const summary = item.background?.feature
			? `Feature: ${item.background.feature.name}`
			: 'Background';

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			jsonData,
			backgroundFeature: item.background?.feature?.name || '',
			backgroundSkillProficiencies: item.background?.skill_proficiencies?.join(', ') || '',
			sourcePublisher: 'homebrew'
		};
	}

	private transformRace(item: HomebrewItem, externalId: string, jsonData: string): TransformResult {
		const size = this.toTitleCase(item.race?.size || 'Medium');

		const summary = `${size} | Speed ${item.race?.speed || 30}`;

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			jsonData,
			raceSize: size,
			raceSpeed: item.race?.speed || 30,
			raceAbilityScores: item.race?.ability_bonuses || {},
			sourcePublisher: 'homebrew'
		};
	}

	private transformClass(
		item: HomebrewItem,
		externalId: string,
		jsonData: string
	): TransformResult {
		const summary = `Hit Die: d${item.class?.hit_die || 8}`;

		return {
			externalId,
			name: item.name,
			summary,
			details: item,
			jsonData,
			classHitDie: item.class?.hit_die || 8,
			sourcePublisher: 'homebrew'
		};
	}

	private transformGeneric(
		item: HomebrewItem,
		externalId: string,
		jsonData: string
	): TransformResult {
		return {
			externalId,
			name: item.name,
			summary: `${item.name} (Homebrew)`,
			details: item,
			jsonData,
			sourcePublisher: 'homebrew'
		};
	}

	private loadFromFile(type: CompendiumTypeName): unknown[] {
		// Map compendium type to filename (Open5e v2 format)
		const fileMap: Record<string, string> = {
			spells: 'spells.json',
			creatures: 'creatures.json',
			magicitems: 'magicitems.json',
			feats: 'feats.json',
			backgrounds: 'backgrounds.json',
			species: 'species.json',
			classes: 'classes.json',
			subclasses: 'subclasses.json',
			subraces: 'subraces.json',
			traits: 'traits.json',
			features: 'features.json',
			skills: 'skills.json',
			languages: 'languages.json',
			alignments: 'alignments.json',
			damagetypes: 'damagetypes.json',
			spellschools: 'spellschools.json',
			equipment: 'equipment.json',
			weaponproperties: 'weaponproperties.json',
			itemcategories: 'itemcategories.json',
			vehicles: 'vehicles.json',
			creaturetypes: 'creaturetypes.json',
			rules: 'rules.json',
			rulesections: 'rulesections.json',
			weapons: 'weapons.json',
			armor: 'armor.json',
			conditions: 'conditions.json',
			environments: 'environments.json',
			sections: 'sections.json',
			proficiencies: 'proficiencies.json',
			abilities: 'abilities.json'
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

	private generateId(): string {
		return nanoid(10);
	}

	protected getEndpoint(_type: CompendiumTypeName): string {
		throw new Error('Homebrew provider does not use API endpoints');
	}
}
