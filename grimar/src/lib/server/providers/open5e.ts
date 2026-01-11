/**
 * Open5e Provider
 *
 * Adapter for the Open5e API v2 (https://api.open5e.com/v2)
 */

import { BaseProvider } from './base-provider';
import type { FetchOptions, ProviderListResponse, TransformResult } from './types';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import { z } from 'zod';
import {
	Open5eListResponseSchema,
	Open5eSpellSchema,
	Open5eCreatureSchema,
	Open5eSpeciesSchema
} from '$lib/core/types/compendium/schemas';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('Open5eProvider');

/**
 * Validate data with Zod schema
 */
function validateData<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
	const result = schema.safeParse(data);
	if (!result.success) {
		log.error({ context, issues: result.error.issues }, 'Validation failed');
		throw new Error(`Invalid ${context} data from Open5e API`);
	}
	return result.data;
}

/**
 * Open5e Provider Implementation
 */
export class Open5eProvider extends BaseProvider {
	readonly id = 'open5e';
	readonly name = 'Open5e';
	readonly baseUrl: string;

	private static readonly DEFAULT_TYPES = [
		'spell',
		'monster',
		'item',
		'feat',
		'background',
		'race',
		'class'
	] as const satisfies readonly CompendiumTypeName[];

	constructor(
		baseUrl: string = 'https://api.open5e.com/v2',
		supportedTypes?: readonly CompendiumTypeName[]
	) {
		super(supportedTypes ?? Open5eProvider.DEFAULT_TYPES);
		this.baseUrl = baseUrl;
	}

	async fetchList(type: CompendiumTypeName, options?: FetchOptions): Promise<ProviderListResponse> {
		const endpoint = this.getEndpoint(type);
		const limit = options?.limit || 200;

		const url = new URL(`${this.baseUrl}${endpoint}`);
		url.searchParams.set('limit', String(limit));
		url.searchParams.set('format', 'json');

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`Open5e API error: ${response.status} ${response.statusText}`);
		}

		const rawData = await response.json();
		const data = validateData(Open5eListResponseSchema, rawData, 'list response');

		return {
			items: data.results,
			hasMore: data.next !== null,
			nextUrl: data.next || undefined
		};
	}

	async fetchAllPages(type: CompendiumTypeName): Promise<unknown[]> {
		const endpoint = this.getEndpoint(type);
		const allItems = await this.fetchAllPagesPaginated(endpoint, 200);
		return allItems;
	}

	async fetchDetail(
		type: CompendiumTypeName,
		externalId: string
	): Promise<Record<string, unknown>> {
		const endpoint = this.getEndpoint(type);
		const url = `${this.baseUrl}${endpoint}${externalId}/`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Open5e API error: ${response.status} ${response.statusText}`);
		}

		return (await response.json()) as Record<string, unknown>;
	}

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult {
		const raw = rawItem as Record<string, unknown>;
		const sourceBook = this.extractSourceBook(raw);

		switch (type) {
			case 'spell':
				return this.transformSpell(rawItem, sourceBook);
			case 'monster':
				return this.transformCreature(rawItem, sourceBook);
			case 'item':
				return this.transformItemGeneric(rawItem, sourceBook);
			case 'feat':
				return this.transformFeat(rawItem, sourceBook);
			case 'background':
				return this.transformBackground(rawItem, sourceBook);
			case 'race':
				return this.transformSpecies(rawItem, sourceBook);
			case 'class':
				return this.transformClass(rawItem, sourceBook);
			default:
				throw new Error(`Open5e does not support type: ${type}`);
		}
	}

	/**
	 * Extract source book from Open5e v2 item
	 * V2 uses nested document object with name property
	 */
	private extractSourceBook(raw: Record<string, unknown>): string {
		const document = raw.document as Record<string, unknown> | undefined;
		const documentTitle = document?.name as string | undefined;

		if (!documentTitle) return 'Unknown';

		// Normalize common source names
		const sources: Record<string, string> = {
			srd: 'SRD',
			"player's handbook": 'PHB',
			'players handbook': 'PHB',
			'dungeon masters guide': 'DMG',
			'dm guide': 'DMG',
			'monster manual': 'MM',
			'xanathars guide to everything': 'XGE',
			xanathar: 'XGE',
			'tashas cauldron of everything': 'TCoE',
			tashas: 'TCoE',
			'volos guide to monsters': 'VGM',
			volo: 'VGM',
			'mordenkainens tome of foes': 'MTF',
			mordenkainen: 'MTF',
			'sage advice compendium': 'SAC',
			'guildmasters guide to ravnica': 'GGR',
			ravnica: 'GGR',
			' acquisitions incorporated': 'AI',
			'eberron: rising from the last war': 'ERLW',
			eberron: 'ERLR',
			witchlight: 'WL',
			'fizbans treasury of dragons': 'FTD',
			'monsters of the multiverse': 'MOTM'
		};

		const normalized = documentTitle.toLowerCase();
		for (const [key, value] of Object.entries(sources)) {
			if (normalized.includes(key)) {
				return value;
			}
		}

		return documentTitle;
	}

	private transformSpell(raw: unknown, sourceBook: string): TransformResult {
		const spell = validateData(Open5eSpellSchema, raw, 'spell');

		// V2 uses boolean flags for components
		const components: string[] = [];
		if (spell.verbal) components.push('V');
		if (spell.somatic) components.push('S');
		if (spell.material) components.push('M');

		// V2 uses level directly as number
		const level = spell.level;
		const schoolName = spell.school?.name || 'Unknown';

		const summary = level === 0 ? `Cantrip ${schoolName}` : `Level ${level} ${schoolName}`;

		return {
			externalId: spell.key,
			name: spell.name,
			summary,
			details: spell as unknown as Record<string, unknown>,
			spellLevel: level,
			spellSchool: schoolName,
			sourceBook
		};
	}

	private transformCreature(raw: unknown, sourceBook: string): TransformResult {
		const creature = validateData(Open5eCreatureSchema, raw, 'creature');

		const sizeName = creature.size?.name || 'Medium';
		const typeName = creature.type?.name || 'Unknown';
		const cr = creature.challenge_rating_text || creature.challenge_rating_decimal || 'Unknown';

		const summary = `${sizeName} ${typeName}, CR ${cr}`;

		return {
			externalId: creature.key,
			name: creature.name,
			summary,
			details: creature as unknown as Record<string, unknown>,
			challengeRating: cr,
			monsterSize: sizeName,
			monsterType: typeName,
			sourceBook
		};
	}

	private transformSpecies(raw: unknown, sourceBook: string): TransformResult {
		const species = validateData(Open5eSpeciesSchema, raw, 'species');

		return {
			externalId: species.key,
			name: species.name,
			summary: species.name,
			details: species as unknown as Record<string, unknown>,
			sourceBook
		};
	}

	private transformItemGeneric(raw: unknown, sourceBook: string): TransformResult {
		const item = raw as Record<string, unknown>;
		return {
			externalId: String(item.key || item.slug || item.index || ''),
			name: String(item.name || 'Unknown'),
			summary: String(item.name || 'Unknown item'),
			details: item,
			sourceBook
		};
	}

	private transformFeat(raw: unknown, sourceBook: string): TransformResult {
		const feat = raw as Record<string, unknown>;
		const prerequisites = feat.prerequisites as string[] | undefined;
		const description = feat.description as string | undefined;

		const summary = prerequisites?.length ? `Prerequisite: ${prerequisites.join(', ')}` : 'Feat';

		return {
			externalId: String(feat.key || feat.slug || feat.index || ''),
			name: String(feat.name || 'Unknown'),
			summary,
			details: feat,
			featPrerequisites: prerequisites?.join(', ') || '',
			featBenefits: description ? [description] : [],
			sourceBook
		};
	}

	private transformBackground(raw: unknown, sourceBook: string): TransformResult {
		const bg = raw as Record<string, unknown>;
		const feature = bg.feature as Record<string, string> | undefined;

		const summary = feature?.name ? `Feature: ${feature.name}` : 'Background';

		return {
			externalId: String(bg.key || bg.slug || bg.index || ''),
			name: String(bg.name || 'Unknown'),
			summary,
			details: bg,
			backgroundFeature: feature?.name || '',
			backgroundSkillProficiencies: '',
			sourceBook
		};
	}

	private transformClass(raw: unknown, sourceBook: string): TransformResult {
		const cls = raw as Record<string, unknown>;

		const summary = `Hit Die: d${cls.hit_die || 8}`;

		return {
			externalId: String(cls.key || cls.slug || cls.index || ''),
			name: String(cls.name || 'Unknown'),
			summary,
			details: cls,
			classHitDie: Number(cls.hit_die) || 8,
			sourceBook
		};
	}

	protected getEndpoint(type: CompendiumTypeName): string {
		switch (type) {
			case 'spell':
				return '/spells/';
			case 'monster':
				return '/creatures/';
			case 'item':
				return '/magicitems/';
			case 'feat':
				return '/feats/';
			case 'background':
				return '/backgrounds/';
			case 'race':
				return '/species/';
			case 'class':
				return '/classes/';
			default:
				throw new Error(`Open5e does not support type: ${type}`);
		}
	}
}
