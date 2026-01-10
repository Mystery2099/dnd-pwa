/**
 * Open5e Provider
 *
 * Adapter for the Open5e API (https://api.open5e.com)
 */

import { BaseProvider } from './base-provider';
import type { FetchOptions, ProviderListResponse, TransformResult } from './types';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import { z } from 'zod';
import {
	Open5eListResponseSchema,
	Open5eSpellSchema,
	Open5eMonsterSchema
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
		baseUrl: string = 'https://api.open5e.com',
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
		// Extract source book from document__title if present
		const raw = rawItem as Record<string, unknown>;
		const sourceBook = this.extractSourceBook(raw);

		switch (type) {
			case 'spell':
				return this.transformSpell(rawItem, sourceBook);
			case 'monster':
				return this.transformMonster(rawItem, sourceBook);
			case 'item':
				return this.transformItemGeneric(rawItem, sourceBook);
			case 'feat':
				return this.transformFeat(rawItem, sourceBook);
			case 'background':
				return this.transformBackground(rawItem, sourceBook);
			case 'race':
				return this.transformRace(rawItem, sourceBook);
			case 'class':
				return this.transformClass(rawItem, sourceBook);
			default:
				throw new Error(`Open5e does not support type: ${type}`);
		}
	}

	/**
	 * Extract source book from Open5e item
	 * Open5e includes document__title which tells us the source
	 */
	private extractSourceBook(raw: Record<string, unknown>): string {
		const documentTitle = raw.document__title as string | undefined;
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
		const spellObj = raw as Record<string, unknown>;
		const spell = validateData(Open5eSpellSchema, raw, 'spell');

		// Normalize level
		let level = spell.level_int;
		if (level === undefined || level === null) {
			if (String(spell.level) === 'Cantrip') {
				level = 0;
			} else {
				level = parseInt(String(spell.level)) || 0;
			}
		}

		// Normalize school
		let schoolName =
			typeof spell.school === 'string' ? spell.school : spell.school?.name || 'Unknown';
		schoolName = this.toTitleCase(schoolName);

		const summary = level === 0 ? `Cantrip ${schoolName}` : `Level ${level} ${schoolName}`;

		return {
			externalId: spell.slug,
			name: spell.name,
			summary,
			details: spell as unknown as Record<string, unknown>,
			spellLevel: level,
			spellSchool: schoolName,
			sourceBook
		};
	}

	private transformMonster(raw: unknown, sourceBook: string): TransformResult {
		const monster = validateData(Open5eMonsterSchema, raw, 'monster');

		const size = this.toTitleCase(monster.size);
		const typeName = this.toTitleCase(monster.type);
		const cr = String(monster.challenge_rating);

		const summary = `${size} ${typeName}, CR ${cr}`;

		return {
			externalId: monster.slug,
			name: monster.name,
			summary,
			details: monster as unknown as Record<string, unknown>,
			challengeRating: cr,
			monsterSize: size,
			monsterType: typeName,
			sourceBook
		};
	}

	private transformItemGeneric(raw: unknown, sourceBook: string): TransformResult {
		const item = raw as Record<string, unknown>;
		return {
			externalId: String(item.slug || item.index || ''),
			name: String(item.name || 'Unknown'),
			summary: String(item.name || 'Unknown item'),
			details: item,
			sourceBook
		};
	}

	private transformFeat(raw: unknown, sourceBook: string): TransformResult {
		const feat = raw as Record<string, unknown>;
		const summary = (feat.prerequisites as string[])?.length
			? `Prerequisite: ${(feat.prerequisites as string[]).join(', ')}`
			: 'Feat';

		return {
			externalId: String(feat.slug || feat.index || ''),
			name: String(feat.name || 'Unknown'),
			summary,
			details: feat,
			featPrerequisites: (feat.prerequisites as string[])?.join(', ') || '',
			featBenefits: (feat.description as string[]) || [],
			sourceBook
		};
	}

	private transformBackground(raw: unknown, sourceBook: string): TransformResult {
		const bg = raw as Record<string, unknown>;
		const summary = (bg.feature as Record<string, string>)?.name
			? `Feature: ${(bg.feature as Record<string, string>).name}`
			: 'Background';

		return {
			externalId: String(bg.slug || bg.index || ''),
			name: String(bg.name || 'Unknown'),
			summary,
			details: bg,
			backgroundFeature: (bg.feature as Record<string, string>)?.name || '',
			backgroundSkillProficiencies: (bg.skill_proficiencies as string[])?.join(', ') || '',
			sourceBook
		};
	}

	private transformRace(raw: unknown, sourceBook: string): TransformResult {
		const race = raw as Record<string, unknown>;
		const size = this.toTitleCase(String(race.size || 'Medium'));

		const summary = `${size} | Speed ${race.speed}`;

		return {
			externalId: String(race.slug || race.index || ''),
			name: String(race.name || 'Unknown'),
			summary,
			details: race,
			raceSize: size,
			raceSpeed: Number(race.speed) || 0,
			sourceBook
		};
	}

	private transformClass(raw: unknown, sourceBook: string): TransformResult {
		const cls = raw as Record<string, unknown>;

		const summary = `Hit Die: d${cls.hit_die}`;

		return {
			externalId: String(cls.slug || cls.index || ''),
			name: String(cls.name || 'Unknown'),
			summary,
			details: cls,
			classHitDie: Number(cls.hit_die) || 0,
			sourceBook
		};
	}

	protected getEndpoint(type: CompendiumTypeName): string {
		switch (type) {
			case 'spell':
				return '/spells/';
			case 'monster':
				return '/monsters/';
			case 'item':
				return '/magicitems/';
			case 'feat':
				return '/feats/';
			case 'background':
				return '/backgrounds/';
			case 'race':
				return '/races/';
			case 'class':
				return '/classes/';
			default:
				throw new Error(`Open5e does not support type: ${type}`);
		}
	}
}
