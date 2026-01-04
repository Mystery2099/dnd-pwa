// Data transformation utilities for compendium items

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
	 * Transform Open5e spell data to standardized format
	 */
	static transformSpell(spell: Open5eSpell): SpellItem {
		const asArray = (value?: string[] | string): string[] => {
			if (!value) return [];
			return Array.isArray(value) ? value : [value];
		};

		const level = typeof spell.level === 'string' ? parseInt(spell.level) : (spell.level ?? 0);
		const school =
			typeof spell.school === 'string'
				? spell.school
				: spell.school?.name ?? 'Unknown';

		const components = Array.isArray(spell.components)
			? spell.components
			: typeof spell.components === 'string'
				? spell.components.split(',').map((c) => c.trim())
				: [];

		return {
			index: spell.slug,
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
			classes: spell.dnd_class ? spell.dnd_class.split(',').map((c) => c.trim()) : []
		};
	}

	/**
	 * Transform Open5e monster data to standardized format
	 */
	static transformMonster(monster: Open5eMonster): MonsterItem {
		const getArmorClass = (
			ac?: number | { type: string; value: number }[]
		): number | { type: string; value: number }[] => {
			if (!ac) return 10;
			return ac;
		};

		const cr = typeof monster.challenge_rating === 'string' 
            ? parseFloat(monster.challenge_rating) 
            : (monster.challenge_rating ?? 0);

		// Sanitize speed to exclude booleans
		const speed: Record<string, string | number> = {};
		if (monster.speed) {
			for (const [key, value] of Object.entries(monster.speed)) {
				if (typeof value === 'string' || typeof value === 'number') {
					speed[key] = value;
				}
			}
		}

		return {
			index: monster.slug,
			name: monster.name,
			summary: `${monster.size} ${monster.type}, CR ${monster.challenge_rating ?? '0'}`,
			size: monster.size,
			type: monster.type,
			subtype: monster.subtype,
			alignment: monster.alignment,
			challenge_rating: cr,
			armor_class: getArmorClass(monster.armor_class),
			armor_desc: monster.armor_desc ?? undefined,
			hit_points: monster.hit_points || 0,
			hit_dice: monster.hit_dice,
			speed,
			strength: monster.strength,
			dexterity: monster.dexterity,
			constitution: monster.constitution,
			intelligence: monster.intelligence,
			wisdom: monster.wisdom,
			charisma: monster.charisma,
			skills: monster.skills,
			damage_vulnerabilities: monster.damage_vulnerabilities,
			damage_resistances: monster.damage_resistances,
			damage_immunities: monster.damage_immunities,
			condition_immunities: monster.condition_immunities,
			senses: monster.senses,
			languages: monster.languages,
			desc: undefined,
			actions:
				monster.actions?.map((a) => ({
					...a,
					damage: a.damage ? JSON.stringify(a.damage) : undefined
				})) || [],
			special_abilities: monster.special_abilities || [],
			legendary_actions: monster.legendary_actions || [],
			reactions: [] // Open5e doesn't always provide reactions in the same way
		};
	}

	/**
	 * Create a summary text for items
	 */
	static createSummary(
		type: string,
		item: any
	): string {
		switch (type) {
			case 'spells':
				return `Level ${item.level ?? 0} ${item.school ?? 'Unknown'} spell`;
			case 'monsters':
				return `${item.size ?? 'Unknown'} ${item.type ?? 'Unknown'}, CR ${item.challenge_rating ?? 0}`;
			default:
				return item.name || 'Unknown item';
		}
	}
}
