// Data transformation utilities for compendium items

import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('DataTransformer');

export type {
	Open5eSpell,
	Open5eMonster,
	SpellItem,
	MonsterItem
} from '$lib/core/types/compendium/transformers';

import type {
	Open5eSpell,
	Open5eMonster,
	SpellItem,
	MonsterItem
} from '$lib/core/types/compendium/transformers';

export class DataTransformer {
	/**
	 * Transform Open5e v2 spell data to standardized format
	 */
	static transformSpell(spell: Open5eSpell): SpellItem {
		log.debug({ key: spell.key, name: spell.name }, 'Transforming spell');

		const asArray = (value?: string[] | string): string[] => {
			if (!value) return [];
			return Array.isArray(value) ? value : [value];
		};

		// V2 uses boolean flags for components
		const components: string[] = [];
		if (spell.verbal) components.push('V');
		if (spell.somatic) components.push('S');
		if (spell.material) components.push('M');

		const level = spell.level;
		const school =
			typeof spell.school === 'string' ? spell.school : (spell.school?.name ?? 'Unknown');

		// V2 uses classes array instead of dnd_class string
		const classes = spell.classes?.map((c) => c.name) || [];

		log.debug(
			{ key: spell.key, level, school, componentCount: components.length },
			'Spell transformed'
		);

		return {
			index: spell.key,
			name: spell.name,
			summary: `Level ${level} ${school} spell`,
			level,
			school,
			components,
			casting_time: spell.casting_time || 'Unknown',
			range: spell.range_text || 'Unknown',
			duration: spell.duration || 'Unknown',
			description: asArray(spell.desc),
			higher_level: asArray(spell.higher_level),
			classes
		};
	}

	/**
	 * Transform Open5e v2 creature data to standardized format
	 */
	static transformMonster(monster: Open5eMonster): MonsterItem {
		log.debug({ key: monster.key, name: monster.name }, 'Transforming monster');

		const size = typeof monster.size === 'string' ? monster.size : (monster.size?.name ?? 'Medium');
		const type =
			typeof monster.type === 'string' ? monster.type : (monster.type?.name ?? 'Unknown');
		const cr = monster.challenge_rating_text || monster.challenge_rating_decimal || '0';

		// V2 challenge_rating is a string, but MonsterItem expects number
		const crNumber = parseFloat(cr) || 0;

		const hp = monster.hit_points ?? 0;
		const hpDice = monster.hit_dice || '1d8';

		const abilityScores = monster.ability_scores;
		const strength = abilityScores?.strength ?? 10;
		const dexterity = abilityScores?.dexterity ?? 10;
		const constitution = abilityScores?.constitution ?? 10;
		const intelligence = abilityScores?.intelligence ?? 10;
		const wisdom = abilityScores?.wisdom ?? 10;
		const charisma = abilityScores?.charisma ?? 10;

		log.debug({ key: monster.key, name: monster.name, cr }, 'Monster transformed');

		return {
			index: monster.key,
			name: monster.name,
			summary: `${size} ${type}, CR ${cr}`,
			size,
			type,
			challenge_rating: crNumber,
			armor_class: monster.armor_class ?? 10,
			hit_points: hp,
			hit_dice: hpDice,
			strength,
			dexterity,
			constitution,
			intelligence,
			wisdom,
			charisma,
			actions:
				monster.actions?.map((a) => ({
					name: a.name,
					desc: a.desc,
					attack_bonus: a.attack_bonus ?? undefined,
					damage_dice: a.damage?.dice ?? undefined
				})) ?? [],
			special_abilities:
				monster.traits?.map((t) => ({
					name: t.name,
					desc: t.desc
				})) ?? []
		};
	}

	/**
	 * Create a summary string for any compendium item
	 */
	static createSummary(item: Open5eSpell | Open5eMonster, type: 'spell' | 'monster'): string {
		if (type === 'spell') {
			const spell = item as Open5eSpell;
			const level = spell.level ?? 0;
			const school =
				typeof spell.school === 'string' ? spell.school : (spell.school?.name ?? 'Unknown');
			return level === 0 ? `Cantrip ${school}` : `Level ${level} ${school}`;
		} else {
			const monster = item as Open5eMonster;
			const size =
				typeof monster.size === 'string' ? monster.size : (monster.size?.name ?? 'Medium');
			const typeName =
				typeof monster.type === 'string' ? monster.type : (monster.type?.name ?? 'Unknown');
			const cr = monster.challenge_rating_text || monster.challenge_rating_decimal || 'Unknown';
			return `${size} ${typeName}, CR ${cr}`;
		}
	}
}
