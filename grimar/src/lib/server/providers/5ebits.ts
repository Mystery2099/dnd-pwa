/**
 * 5e-bits Provider
 *
 * Adapter for the 5e-bits API (https://api.5e-bits.com)
 * Supports: spells, monsters, feats, backgrounds, races, classes
 */

import { BaseProvider } from './base-provider';
import type { FetchOptions, ProviderListResponse, TransformResult } from './types';
import type { CompendiumTypeName } from '$lib/types/compendium';
import { z } from 'zod';

// 5e-bits API response types
interface FiveEBitsListResponse<T> {
	results: T[];
	count: number;
	next: string | null;
	previous: string | null;
}

// Zod schemas for validation
export const FiveEBitsSpellSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.array(z.string()),
	higher_level: z.string().nullable(),
	range: z.string(),
	components: z.array(z.string()),
	material: z.string().nullable(),
	ritual: z.boolean(),
	duration: z.string(),
	concentration: z.boolean(),
	casting_time: z.string(),
	level: z.number(),
	school: z.object({
		index: z.string(),
		name: z.string()
	}),
	classes: z.array(
		z.object({
			index: z.string(),
			name: z.string()
		})
	),
	subclasses: z
		.array(
			z.object({
				index: z.string(),
				name: z.string()
			})
		)
		.nullable()
});

export const FiveEBitsMonsterSchema = z.object({
	index: z.string(),
	name: z.string(),
	size: z.string(),
	type: z.string(),
	subtype: z.string().nullable(),
	alignment: z.string(),
	armor_class: z.array(z.object({ type: z.string(), value: z.number() })),
	hit_points: z.number(),
	hit_dice: z.string(),
	speed: z.record(z.string(), z.string()),
	strength: z.number(),
	dexterity: z.number(),
	constitution: z.number(),
	intelligence: z.number(),
	wisdom: z.number(),
	charisma: z.number(),
	proficiencies: z.array(
		z.object({
			proficiency: z.object({ index: z.string(), name: z.string() }),
			value: z.number()
		})
	),
	damage_vulnerabilities: z.array(z.string()),
	damage_resistances: z.array(z.string()),
	damage_immunities: z.array(z.string()),
	condition_immunities: z.array(z.string()),
	senses: z.record(z.string(), z.string()),
	languages: z.string(),
	challenge_rating: z.string(),
	xp: z.number(),
	special_abilities: z.array(
		z.object({
			name: z.string(),
			desc: z.string(),
			attack_bonus: z.number().optional(),
			damage: z
				.array(
					z.object({
						damage_type: z.object({ index: z.string(), name: z.string() }),
						damage_dice: z.string()
					})
				)
				.optional()
		})
	),
	actions: z.array(
		z.object({
			name: z.string(),
			desc: z.string(),
			attack_bonus: z.number().optional(),
			damage: z
				.array(
					z.object({
						damage_type: z.object({ index: z.string(), name: z.string() }),
						damage_dice: z.string()
					})
				)
				.optional(),
			multiattack: z.object({ action_name: z.string(), count: z.number() }).optional()
		})
	),
	legendary_actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage: z
					.array(
						z.object({
							damage_type: z.object({ index: z.string(), name: z.string() }),
							damage_dice: z.string()
						})
					)
					.optional()
			})
		)
		.optional(),
	reactions: z.array(z.object({ name: z.string(), desc: z.string() })).optional()
});

export const FiveEBitsFeatSchema = z.object({
	index: z.string(),
	name: z.string(),
	prerequisites: z.array(z.string()).optional(),
	description: z.array(z.string()),
	ability_score_increases: z
		.array(
			z.object({
				ability_score: z.object({ index: z.string(), name: z.string() }),
				increase: z.number()
			})
		)
		.optional()
});

export const FiveEBitsBackgroundSchema = z.object({
	index: z.string(),
	name: z.string(),
	description: z.array(z.string()),
	feature: z
		.object({
			name: z.string(),
			description: z.string()
		})
		.optional(),
	skill_proficiencies: z.array(z.string()).optional(),
	tool_proficiencies: z.array(z.string()).optional()
});

export const FiveEBitsRaceSchema = z.object({
	index: z.string(),
	name: z.string(),
	size: z.string(),
	speed: z.number(),
	ability_bonuses: z
		.array(
			z.object({
				ability_score: z.object({ index: z.string(), name: z.string() }),
				bonus: z.number()
			})
		)
		.optional(),
	traits: z.array(z.string()).optional(),
	languages: z.array(z.string()).optional(),
	subraces: z.array(z.string()).optional()
});

export const FiveEBitsClassSchema = z.object({
	index: z.string(),
	name: z.string(),
	hit_die: z.number(),
	proficiency_choices: z
		.array(
			z.object({
				type: z.string(),
				choose: z.number(),
				from: z.array(z.object({ index: z.string(), name: z.string() }))
			})
		)
		.optional(),
	proficiencies: z.array(z.object({ index: z.string(), name: z.string() })),
	saving_throws: z.array(z.object({ index: z.string(), name: z.string() })),
	spellcasting: z
		.object({
			level: z.number(),
			ability: z.object({ index: z.string(), name: z.string() }),
			dc: z.number(),
			mod: z.number()
		})
		.optional(),
	subclasses: z.array(z.string()).optional()
});

// Type inferences
type FiveEBitsSpell = z.infer<typeof FiveEBitsSpellSchema>;
type FiveEBitsMonster = z.infer<typeof FiveEBitsMonsterSchema>;
type FiveEBitsFeat = z.infer<typeof FiveEBitsFeatSchema>;
type FiveEBitsBackground = z.infer<typeof FiveEBitsBackgroundSchema>;
type FiveEBitsRace = z.infer<typeof FiveEBitsRaceSchema>;
type FiveEBitsClass = z.infer<typeof FiveEBitsClassSchema>;

/**
 * Validate data with Zod schema
 */
function validateData<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
	const result = schema.safeParse(data);
	if (!result.success) {
		console.error(`[5e-bits] Validation failed for ${context}:`, result.error.issues);
		throw new Error(`Invalid ${context} data from 5e-bits API`);
	}
	return result.data;
}

/**
 * 5e-bits Provider Implementation
 */
export class FiveEBitsProvider extends BaseProvider {
	readonly id = '5e-bits';
	readonly name = '5e-bits';
	readonly baseUrl: string;
	readonly supportedTypes = ['spell', 'monster', 'feat', 'background', 'race', 'class'] as const;

	constructor(baseUrl: string = 'https://api.5e-bits.com') {
		super();
		this.baseUrl = baseUrl;
	}

	async fetchList(type: CompendiumTypeName, options?: FetchOptions): Promise<ProviderListResponse> {
		const endpoint = this.getEndpoint(type);
		const limit = options?.limit || 100;
		const offset = options?.offset || 0;

		const url = new URL(`${this.baseUrl}${endpoint}`);
		url.searchParams.set('limit', String(limit));
		url.searchParams.set('skip', String(offset));

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`5e-bits API error: ${response.status} ${response.statusText}`);
		}

		const rawData = await response.json();
		const data = validateData(
			z.object({
				results: z.array(z.unknown()),
				count: z.number(),
				next: z.string().nullable(),
				previous: z.string().nullable()
			}),
			rawData,
			'list response'
		);

		return {
			items: data.results,
			hasMore: data.next !== null,
			nextUrl: data.next || undefined
		};
	}

	async fetchAllPages(type: CompendiumTypeName): Promise<unknown[]> {
		return this.fetchAllPagesPaginated(this.getEndpoint(type), 100);
	}

	async fetchDetail(
		type: CompendiumTypeName,
		externalId: string
	): Promise<Record<string, unknown>> {
		const endpoint = this.getEndpoint(type);
		const url = `${this.baseUrl}${endpoint}${externalId}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`5e-bits API error: ${response.status} ${response.statusText}`);
		}

		return (await response.json()) as Record<string, unknown>;
	}

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult {
		switch (type) {
			case 'spell':
				return this.transformSpell(rawItem);
			case 'monster':
				return this.transformMonster(rawItem);
			case 'feat':
				return this.transformFeat(rawItem);
			case 'background':
				return this.transformBackground(rawItem);
			case 'race':
				return this.transformRace(rawItem);
			case 'class':
				return this.transformClass(rawItem);
			default:
				throw new Error(`5e-bits provider does not support type: ${type}`);
		}
	}

	private transformSpell(raw: unknown): TransformResult {
		const spell = validateData(FiveEBitsSpellSchema, raw, 'spell');

		const level = spell.level;
		const schoolName = spell.school?.name || 'Unknown';
		const summary = level === 0 ? `Cantrip ${schoolName}` : `Level ${level} ${schoolName}`;

		const details = {
			slug: spell.index,
			name: spell.name,
			desc: spell.desc,
			higher_level: spell.higher_level,
			range: spell.range,
			components: spell.components,
			material: spell.material,
			ritual: spell.ritual,
			duration: spell.duration,
			concentration: spell.concentration,
			casting_time: spell.casting_time,
			level: spell.level,
			level_int: spell.level,
			school: schoolName,
			spellLevel: spell.level,
			spellSchool: schoolName,
			dnd_class: spell.classes.map((c) => c.name).join(', '),
			spell_lists: spell.classes.map((c) => c.index),
			archetype: spell.subclasses?.map((s) => s.name).join(', ') || '',
			circles: spell.subclasses?.map((s) => s.name) || [],
			source: '5e-bits',
			document__slug: '5e-bits',
			document__title: '5e-bits Database',
			document__license_url: 'https://github.com/5e-bits',
			document__url: 'https://api.5e-bits.com'
		};

		return {
			externalId: spell.index,
			name: spell.name,
			summary,
			details,
			spellLevel: spell.level,
			spellSchool: schoolName
		};
	}

	private transformMonster(raw: unknown): TransformResult {
		const monster = validateData(FiveEBitsMonsterSchema, raw, 'monster');

		const size = this.toTitleCase(monster.size);
		const typeName = this.toTitleCase(monster.type);
		const subtype = monster.subtype ? ` (${monster.subtype})` : '';
		const cr = monster.challenge_rating;

		const summary = `${size} ${typeName}${subtype}, CR ${cr}`;

		const details = {
			slug: monster.index,
			name: monster.name,
			size: monster.size,
			type: monster.type,
			subtype: monster.subtype,
			alignment: monster.alignment,
			armor_class: monster.armor_class,
			hit_points: monster.hit_points,
			hit_dice: monster.hit_dice,
			speed: monster.speed,
			strength: monster.strength,
			dexterity: monster.dexterity,
			constitution: monster.constitution,
			intelligence: monster.intelligence,
			wisdom: monster.wisdom,
			charisma: monster.charisma,
			proficiencies: monster.proficiencies,
			damage_vulnerabilities: monster.damage_vulnerabilities,
			damage_resistances: monster.damage_resistances,
			damage_immunities: monster.damage_immunities,
			condition_immunities: monster.condition_immunities,
			senses: monster.senses,
			languages: monster.languages,
			challenge_rating: cr,
			challengeRating: cr,
			xp: monster.xp,
			special_abilities: monster.special_abilities,
			actions: monster.actions,
			legendary_actions: monster.legendary_actions,
			reactions: monster.reactions,
			monsterSize: size,
			monsterType: typeName,
			source: '5e-bits',
			document__slug: '5e-bits',
			document__title: '5e-bits Database',
			document__license_url: 'https://github.com/5e-bits',
			document__url: 'https://api.5e-bits.com'
		};

		return {
			externalId: monster.index,
			name: monster.name,
			summary,
			details,
			challengeRating: cr,
			monsterSize: size,
			monsterType: typeName
		};
	}

	private transformFeat(raw: unknown): TransformResult {
		const feat = validateData(FiveEBitsFeatSchema, raw, 'feat');

		const summary = feat.prerequisites?.length
			? `Prerequisite: ${feat.prerequisites.join(', ')}`
			: 'Feat';

		const details = {
			slug: feat.index,
			name: feat.name,
			description: feat.description,
			prerequisites: feat.prerequisites,
			ability_score_increases: feat.ability_score_increases,
			source: '5e-bits',
			document__slug: '5e-bits',
			document__title: '5e-bits Database',
			document__license_url: 'https://github.com/5e-bits',
			document__url: 'https://api.5e-bits.com'
		};

		return {
			externalId: feat.index,
			name: feat.name,
			summary,
			details,
			featPrerequisites: feat.prerequisites?.join(', ') || '',
			featBenefits: feat.description
		};
	}

	private transformBackground(raw: unknown): TransformResult {
		const bg = validateData(FiveEBitsBackgroundSchema, raw, 'background');

		const summary = bg.feature ? `Feature: ${bg.feature.name}` : 'Background';

		const details = {
			slug: bg.index,
			name: bg.name,
			description: bg.description,
			feature: bg.feature,
			skill_proficiencies: bg.skill_proficiencies,
			tool_proficiencies: bg.tool_proficiencies,
			source: '5e-bits',
			document__slug: '5e-bits',
			document__title: '5e-bits Database',
			document__license_url: 'https://github.com/5e-bits',
			document__url: 'https://api.5e-bits.com'
		};

		return {
			externalId: bg.index,
			name: bg.name,
			summary,
			details,
			backgroundFeature: bg.feature?.name || '',
			backgroundSkillProficiencies: bg.skill_proficiencies?.join(', ') || ''
		};
	}

	private transformRace(raw: unknown): TransformResult {
		const race = validateData(FiveEBitsRaceSchema, raw, 'race');

		const abilityBonuses = race.ability_bonuses
			?.map((b) => `${b.ability_score.name} +${b.bonus}`)
			.join(', ');

		const summary = `${race.size} | Speed ${race.speed}${abilityBonuses ? ` | ${abilityBonuses}` : ''}`;

		const details = {
			slug: race.index,
			name: race.name,
			size: race.size,
			speed: race.speed,
			ability_bonuses: race.ability_bonuses,
			traits: race.traits,
			languages: race.languages,
			subraces: race.subraces,
			source: '5e-bits',
			document__slug: '5e-bits',
			document__title: '5e-bits Database',
			document__license_url: 'https://github.com/5e-bits',
			document__url: 'https://api.5e-bits.com'
		};

		return {
			externalId: race.index,
			name: race.name,
			summary,
			details,
			raceSize: race.size,
			raceSpeed: race.speed,
			raceAbilityScores:
				race.ability_bonuses?.reduce(
					(acc, b) => ({ ...acc, [b.ability_score.name]: b.bonus }),
					{}
				) || {}
		};
	}

	private transformClass(raw: unknown): TransformResult {
		const cls = validateData(FiveEBitsClassSchema, raw, 'class');

		const summary = `Hit Die: d${cls.hit_die}${cls.spellcasting ? ' | Spellcasting' : ''}`;

		const details = {
			slug: cls.index,
			name: cls.name,
			hit_die: cls.hit_die,
			hitDie: cls.hit_die,
			proficiency_choices: cls.proficiency_choices,
			proficiencies: cls.proficiencies,
			saving_throws: cls.saving_throws,
			spellcasting: cls.spellcasting,
			subclasses: cls.subclasses,
			source: '5e-bits',
			document__slug: '5e-bits',
			document__title: '5e-bits Database',
			document__license_url: 'https://github.com/5e-bits',
			document__url: 'https://api.5e-bits.com'
		};

		return {
			externalId: cls.index,
			name: cls.name,
			summary,
			details,
			classHitDie: cls.hit_die,
			classProficiencies: cls.proficiencies.map((p) => p.name),
			classSpellcasting: cls.spellcasting || {}
		};
	}

	protected getEndpoint(type: CompendiumTypeName): string {
		switch (type) {
			case 'spell':
				return '/spells/';
			case 'monster':
				return '/monsters/';
			case 'feat':
				return '/feats/';
			case 'background':
				return '/backgrounds/';
			case 'race':
				return '/races/';
			case 'class':
				return '/classes/';
			default:
				throw new Error(`5e-bits does not support type: ${type}`);
		}
	}
}
