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
	 * Transform Open5e spell data to standardized format
	 */
	static transformSpell(spell: Open5eSpell): SpellItem {
		log.debug({ slug: spell.slug, name: spell.name }, 'Transforming spell');

		const asArray = (value?: string[] | string): string[] => {
			if (!value) return [];
			return Array.isArray(value) ? value : [value];
		};

		const levelRaw = spell.level;
		const level = typeof levelRaw === 'string' ? parseInt(levelRaw) : (levelRaw ?? 0);
		if (typeof levelRaw === 'string' && isNaN(parseInt(levelRaw))) {
			log.warn({ rawLevel: levelRaw, defaultingTo: 0 }, 'Invalid spell level, defaulting to 0');
		}

		const schoolRaw = spell.school;
		const school = typeof schoolRaw === 'string' ? schoolRaw : (schoolRaw?.name ?? 'Unknown');

		const componentsRaw = spell.components;
		const components = Array.isArray(componentsRaw)
			? componentsRaw
			: typeof componentsRaw === 'string'
				? componentsRaw.split(',').map((c) => c.trim())
				: [];

		log.debug(
			{ slug: spell.slug, level, school, componentCount: components.length },
			'Spell transformed'
		);

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
		log.debug({ slug: monster.slug, name: monster.name }, 'Transforming monster');

		const getArmorClass = (
			ac?: number | { type: string; value: number }[]
		): number | { type: string; value: number }[] => {
			if (!ac) return 10;
			return ac;
		};

		const crRaw = monster.challenge_rating;
		const cr = typeof crRaw === 'string' ? parseFloat(crRaw) : (crRaw ?? 0);
		if (typeof crRaw === 'string' && isNaN(parseFloat(crRaw))) {
			log.warn({ rawCr: crRaw, defaultingTo: 0 }, 'Invalid challenge rating, defaulting to 0');
		}

		// Sanitize speed to exclude booleans
		const speed: Record<string, string | number> = {};
		if (monster.speed) {
			for (const [key, value] of Object.entries(monster.speed)) {
				if (typeof value === 'string' || typeof value === 'number') {
					speed[key] = value;
				} else {
					log.debug({ key, valueType: typeof value }, 'Skipping non-string/number speed value');
				}
			}
		}

		const actionsCount = monster.actions?.length || 0;
		const specialAbilitiesCount = monster.special_abilities?.length || 0;

		log.debug(
			{
				slug: monster.slug,
				size: monster.size,
				type: monster.type,
				cr,
				actionsCount,
				specialAbilitiesCount
			},
			'Monster transformed'
		);

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
					name: a.name,
					desc: a.desc,
					attack_bonus: a.attack_bonus,
					damage: a.damage_dice || undefined
				})) || [],
			special_abilities: monster.special_abilities || [],
			legendary_actions:
				monster.legendary_actions?.map((a) => ({
					name: a.name,
					desc: a.desc,
					attack_bonus: a.attack_bonus,
					damage: a.damage_dice || undefined
				})) || [],
			reactions:
				monster.reactions?.map((a) => ({
					name: a.name,
					desc: a.desc,
					attack_bonus: a.attack_bonus,
					damage: a.damage_dice || undefined
				})) || []
		};
	}

	/**
	 * Create a summary text for items
	 */
	static createSummary(type: string, item: any): string {
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
