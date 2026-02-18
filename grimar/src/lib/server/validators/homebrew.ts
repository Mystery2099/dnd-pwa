/**
 * Homebrew Validators
 *
 * Zod schemas for validating homebrew item input.
 * Uses Open5e format for compatibility.
 */

import { z } from 'zod';

export interface HomebrewItemInput {
	type: string;
	name: string;
	summary: string;
	details: Record<string, unknown>;
	jsonData: string;
	externalId?: string;
	spellLevel?: number;
	spellSchool?: string;
	challengeRating?: string;
	creatureSize?: string;
	creatureType?: string;
	classHitDie?: number;
	raceSize?: string;
	raceSpeed?: number;
	backgroundFeature?: string;
	backgroundSkillProficiencies?: string;
	featPrerequisites?: string;
}

const homebrewSpellSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	level: z.union([z.number().min(0).max(9), z.string()]).optional(),
	school: z.union([z.string(), z.object({ name: z.string() })]).optional(),
	casting_time: z.string().optional(),
	range: z.string().optional(),
	components: z.string().optional(),
	duration: z.string().optional(),
	description: z.string().optional(),
	higher_level: z.string().optional(),
	classes: z.array(z.string()).optional(),
	concentration: z.boolean().optional(),
	ritual: z.boolean().optional()
});

const homebrewMonsterSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	size: z.string().optional(),
	type: z.string().optional(),
	alignment: z.string().optional(),
	armor_class: z.union([z.number(), z.string()]).optional(),
	armor_desc: z.string().optional(),
	hit_points: z.union([z.number(), z.string()]).optional(),
	hit_dice: z.string().optional(),
	speed: z.string().optional(),
	challenge_rating: z.union([z.number(), z.string()]).optional(),
	actions: z.array(z.any()).optional(),
	legendary_actions: z.array(z.any()).optional(),
	special_abilities: z.array(z.any()).optional()
});

const homebrewFeatSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	prerequisites: z.array(z.string()).optional(),
	description: z.array(z.string()).optional()
});

const homebrewBackgroundSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	feature: z.object({ name: z.string() }).optional(),
	skill_proficiencies: z.array(z.string()).optional(),
	tool_proficiencies: z.array(z.string()).optional(),
	languages: z.array(z.string()).optional(),
	equipment: z.array(z.string()).optional()
});

const homebrewRaceSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	size: z.string().optional(),
	speed: z.number().optional(),
	ability_bonuses: z.record(z.string(), z.number()).optional(),
	traits: z.array(z.any()).optional(),
	subraces: z.array(z.any()).optional()
});

const homebrewClassSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	hit_die: z.number().min(1).max(12).optional(),
	primary_ability: z.array(z.string()).optional(),
	saving_throws: z.array(z.string()).optional(),
	armor_proficiencies: z.array(z.string()).optional(),
	weapon_proficiencies: z.array(z.string()).optional(),
	tool_proficiencies: z.array(z.string()).optional(),
	skill_proficiencies: z.number().optional(),
	spellcasting_ability: z.string().optional()
});

const homebrewMagicItemSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	rarity: z.string().optional(),
	type: z.string().optional(),
	attunement: z.string().optional(),
	description: z.array(z.string()).optional(),
	requires_attunement: z.boolean().optional()
});

const homebrewSubclassSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	class: z.string().optional(),
	subclass_flavor: z.string().optional(),
	level_3: z.any().optional(),
	level_9: z.any().optional(),
	level_13: z.any().optional(),
	level_17: z.any().optional()
});

const homebrewSubraceSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	race: z.string().optional(),
	description: z.string().optional(),
	ability_bonuses: z.record(z.string(), z.number()).optional()
});

const homebrewGenericSchema = z.record(z.string(), z.unknown());

function buildSummary(data: Record<string, unknown>, type: string): string {
	switch (type) {
		case 'spells': {
			const level = data.level;
			const school = typeof data.school === 'string' ? data.school : (data.school as Record<string, unknown>)?.name || 'Unknown';
			if (level === 0 || level === 'Cantrip') return `Cantrip ${school}`;
			return `Level ${level} ${school}`;
		}
		case 'creatures': {
			const size = data.size || 'Medium';
			const typeName = data.type || 'Humanoid';
			const cr = data.challenge_rating || '0';
			return `${size} ${typeName}, CR ${cr}`;
		}
		case 'feats': {
			const prereqs = (data.prerequisites as string[]) || [];
			return prereqs.length > 0 ? `Prerequisite: ${prereqs.join(', ')}` : 'Feat';
		}
		case 'backgrounds': {
			const feature = (data.feature as Record<string, unknown>)?.name;
			return feature ? `Feature: ${feature}` : 'Background';
		}
		case 'species': {
			const size = data.size || 'Medium';
			const speed = data.speed || 30;
			return `${size} | Speed ${speed}`;
		}
		case 'classes': {
			const hitDie = data.hit_die || 8;
			return `Hit Die: d${hitDie}`;
		}
		case 'magicitems': {
			const rarity = data.rarity || 'Unknown';
			const attunement = data.requires_attunement ? ' (Attunement)' : '';
			return `${rarity}${attunement}`;
		}
		default:
			return `${type} (Homebrew)`;
	}
}

function toTitleCase(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function extractTypeSpecificFields(data: Record<string, unknown>, type: string) {
	const result: Partial<HomebrewItemInput> = {};

	switch (type) {
		case 'spells': {
			const level = data.level;
			result.spellLevel = typeof level === 'number' ? level : (level === 'Cantrip' ? 0 : parseInt(String(level)) || 0);
			let school = 'Unknown';
			if (typeof data.school === 'string') {
				school = data.school;
			} else if (data.school && typeof data.school === 'object') {
				const schoolObj = data.school as Record<string, unknown>;
				school = typeof schoolObj.name === 'string' ? schoolObj.name : 'Unknown';
			}
			result.spellSchool = toTitleCase(school);
			break;
		}
		case 'creatures': {
			result.challengeRating = String(data.challenge_rating || '0');
			result.creatureSize = typeof data.size === 'string' ? toTitleCase(data.size) : 'Medium';
			result.creatureType = typeof data.type === 'string' ? toTitleCase(data.type) : 'Humanoid';
			break;
		}
		case 'feats': {
			result.featPrerequisites = Array.isArray(data.prerequisites) ? data.prerequisites.join(', ') : '';
			break;
		}
		case 'backgrounds': {
			result.backgroundFeature = (data.feature as Record<string, unknown>)?.name as string || '';
			result.backgroundSkillProficiencies = Array.isArray(data.skill_proficiencies) ? data.skill_proficiencies.join(', ') : '';
			break;
		}
		case 'species': {
			result.raceSize = typeof data.size === 'string' ? toTitleCase(data.size) : 'Medium';
			result.raceSpeed = typeof data.speed === 'number' ? data.speed : 30;
			break;
		}
		case 'classes': {
			result.classHitDie = typeof data.hit_die === 'number' ? data.hit_die : 8;
			break;
		}
	}

	return result;
}

export const homebrewItemSchema = z
	.object({
		type: z.enum([
			'spells',
			'creatures',
			'magicitems',
			'feats',
			'backgrounds',
			'species',
			'classes',
			'subclasses',
			'subraces'
		]),
		data: z.union([
			homebrewSpellSchema,
			homebrewMonsterSchema,
			homebrewFeatSchema,
			homebrewBackgroundSchema,
			homebrewRaceSchema,
			homebrewClassSchema,
			homebrewMagicItemSchema,
			homebrewSubclassSchema,
			homebrewSubraceSchema,
			homebrewGenericSchema
		])
	})
	.transform((val) => {
		const type = val.type;
		const data = val.data as Record<string, unknown>;
		const name = String(data.name || '');
		const summary = buildSummary(data, type);
		const jsonData = JSON.stringify(data);
		const details = data;

		const typeSpecificFields = extractTypeSpecificFields(data, type);

		return {
			type,
			name,
			summary,
			details,
			jsonData,
			...typeSpecificFields
		} as HomebrewItemInput;
	});

export const homebrewImportSchema = z.array(homebrewItemSchema);
