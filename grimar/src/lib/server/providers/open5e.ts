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
import { logRawSample, logSpellFields } from '$lib/server/services/sync/debug-sync';
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
	readonly supportedTypes = [
		'spell',
		'monster',
		'item',
		'feat',
		'background',
		'race',
		'class'
	] as const;

	constructor(baseUrl: string = 'https://api.open5e.com') {
		super();
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

		if (allItems.length > 0 && type === 'spell') {
			logRawSample(type, JSON.stringify(allItems[0], null, 2).slice(0, 3000), allItems.length);
		}

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
		switch (type) {
			case 'spell':
				return this.transformSpell(rawItem);
			case 'monster':
				return this.transformMonster(rawItem);
			case 'item':
				return this.transformItemGeneric(rawItem);
			case 'feat':
				return this.transformFeat(rawItem);
			case 'background':
				return this.transformBackground(rawItem);
			case 'race':
				return this.transformRace(rawItem);
			case 'class':
				return this.transformClass(rawItem);
			default:
				throw new Error(`Open5e does not support type: ${type}`);
		}
	}

	private transformSpell(raw: unknown): TransformResult {
		const spellObj = raw as Record<string, unknown>;

		logSpellFields({
			slug: spellObj.slug,
			name: spellObj.name,
			level: spellObj.level,
			level_int: spellObj.level_int,
			school: spellObj.school,
			components: spellObj.components,
			desc: Array.isArray(spellObj.desc) ? `${spellObj.desc.length} paragraphs` : spellObj.desc,
			hasAllRequired: !!(spellObj.slug && spellObj.name)
		});

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
			spellSchool: schoolName
		};
	}

	private transformMonster(raw: unknown): TransformResult {
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
			monsterType: typeName
		};
	}

	private transformItemGeneric(raw: unknown): TransformResult {
		const item = raw as Record<string, unknown>;
		return {
			externalId: String(item.slug || item.index || ''),
			name: String(item.name || 'Unknown'),
			summary: String(item.name || 'Unknown item'),
			details: item
		};
	}

	private transformFeat(raw: unknown): TransformResult {
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
			featBenefits: (feat.description as string[]) || []
		};
	}

	private transformBackground(raw: unknown): TransformResult {
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
			backgroundSkillProficiencies: (bg.skill_proficiencies as string[])?.join(', ') || ''
		};
	}

	private transformRace(raw: unknown): TransformResult {
		const race = raw as Record<string, unknown>;
		const size = this.toTitleCase(String(race.size || 'Medium'));

		const summary = `${size} | Speed ${race.speed}`;

		return {
			externalId: String(race.slug || race.index || ''),
			name: String(race.name || 'Unknown'),
			summary,
			details: race,
			raceSize: size,
			raceSpeed: Number(race.speed) || 0
		};
	}

	private transformClass(raw: unknown): TransformResult {
		const cls = raw as Record<string, unknown>;

		const summary = `Hit Die: d${cls.hit_die}`;

		return {
			externalId: String(cls.slug || cls.index || ''),
			name: String(cls.name || 'Unknown'),
			summary,
			details: cls,
			classHitDie: Number(cls.hit_die) || 0
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
