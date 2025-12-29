// Data transformation utilities for compendium items

export type {
	Open5eSpell,
	Open5eMonster,
	SpellItem,
	MonsterItem
} from '$lib/types/compendium/transformers';

import type {
	Open5eSpell,
	Open5eMonster,
	SpellItem,
	MonsterItem
} from '$lib/types/compendium/transformers';

export class DataTransformer {
	/**
	 * Transform Open5e spell data to standardized format
	 */
	static transformSpell(spell: Open5eSpell): SpellItem {
		const asArray = (value?: string[] | string): string[] => {
			if (!value) return [];
			return Array.isArray(value) ? value : [value];
		};

		return {
			index: spell.index,
			name: spell.name,
			summary: `Level ${spell.level} ${spell.school.name} spell`,
			level: spell.level,
			school: spell.school.name,
			components: spell.components || [],
			casting_time: 'Unknown', // Will be populated from SRD data
			range: 'Unknown',
			duration: 'Unknown',
			description: asArray(spell.desc),
			higher_level: asArray(spell.higher_level),
			classes: [] // Will be populated from SRD data
		};
	}

	/**
	 * Transform Open5e monster data to standardized format
	 */
	static transformMonster(monster: Open5eMonster): MonsterItem {
		const getArmorClass = (ac?: number | { type: string; value: number }[]): number => {
			if (!ac) return 10;
			if (typeof ac === 'number') return ac;
			return ac[0]?.value || 10;
		};

		return {
			index: monster.index,
			name: monster.name,
			summary: `${monster.size} ${monster.type}, CR ${monster.challenge_rating}`,
			size: monster.size,
			type: monster.type,
			challenge_rating: monster.challenge_rating,
			armor_class: getArmorClass(monster.armor_class),
			hit_points: monster.hit_points || 0
		};
	}

	/**
	 * Create a summary text for items
	 */
	static createSummary(type: string, item: any): string {
		switch (type) {
			case 'spells':
				return `Level ${item.level} ${item.school} spell`;
			case 'monsters':
				return `${item.size} ${item.type}, CR ${item.challenge_rating}`;
			default:
				return item.name || 'Unknown item';
		}
	}
}
