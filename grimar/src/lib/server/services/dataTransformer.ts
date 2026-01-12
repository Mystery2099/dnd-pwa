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
		log.debug({ key: spell.index, name: spell.name }, 'Transforming spell');

		const asArray = (value?: string[] | string | null): string[] => {
			if (!value || !Array.isArray(value)) return [];
			return value;
		};

		// V2 uses components array directly
		const components = spell.components || [];

		const level = spell.level;
		const school = spell.school?.name || 'Unknown';

		// V2 uses classes array of objects with name property
		const classes = spell.classes?.map((c) => c.name) || [];

		log.debug(
			{ key: spell.index, level, school, componentCount: components.length },
			'Spell transformed'
		);

		return {
			index: spell.index,
			name: spell.name,
			summary: `Level ${level} ${school} spell`,
			level,
			school,
			components,
			casting_time: spell.casting_time || 'Unknown',
			range: spell.range || 'Unknown',
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
		log.debug({ key: monster.index, name: monster.name }, 'Transforming monster');

		const size = monster.size || 'Medium';
		const type = monster.type || 'Unknown';
		const crValue = monster.challenge_rating;
		const cr = typeof crValue === 'string' ? crValue : String(crValue ?? '0');

		// V2 challenge_rating is a string or number
		const crNumber = parseFloat(cr) || 0;

		const hp = monster.hit_points ?? 0;

		log.debug({ key: monster.index, name: monster.name, cr }, 'Monster transformed');

		return {
			index: monster.index,
			name: monster.name,
			summary: `${size} ${type}, CR ${cr}`,
			size,
			type,
			challenge_rating: crNumber,
			armor_class: monster.armor_class ?? 10,
			hit_points: hp,
			hit_dice: monster.hit_dice || '1d8',
			strength: 10,
			dexterity: 10,
			constitution: 10,
			intelligence: 10,
			wisdom: 10,
			charisma: 10,
			actions: [],
			special_abilities: []
		};
	}

	/**
	 * Create a summary string for any compendium item
	 */
	static createSummary(item: Open5eSpell | Open5eMonster, type: 'spell' | 'monster'): string {
		if (type === 'spell') {
			const spell = item as Open5eSpell;
			const level = spell.level ?? 0;
			const school = spell.school?.name || 'Unknown';
			return level === 0 ? `Cantrip ${school}` : `Level ${level} ${school}`;
		} else {
			const monster = item as Open5eMonster;
			const size = monster.size || 'Medium';
			const typeName = monster.type || 'Unknown';
			const crValue = monster.challenge_rating;
			const cr = typeof crValue === 'string' ? crValue : String(crValue ?? 'Unknown');
			return `${size} ${typeName}, CR ${cr}`;
		}
	}
}
