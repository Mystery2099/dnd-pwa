/**
 * Compendium Transformer Types
 *
 * Type definitions for data transformation between provider formats
 * and the application's standardized format.
 *
 * NOTE: These types are now derived from Zod schemas in schemas.ts.
 * The Open5e and SRD types are re-exported from schemas.ts.
 * The standardized SpellItem and MonsterItem types are defined here.
 */

export type {
	Open5eV2Spell as Open5eSpell,
	Open5eV2Creature as Open5eMonster,
	Open5eItem,
	Open5eListResponse,
	SrdSpell,
	SrdMonsterSummary,
	SrdMonsterDetail,
	HomebrewItem
} from '$lib/core/types/compendium/schemas';

// Standardized item types (transformed) - these are app-specific
export interface SpellItem {
	index: string;
	name: string;
	summary: string;
	level: number;
	school: string;
	components: string[];
	casting_time: string;
	range: string;
	duration: string;
	description: string[];
	higher_level: string[];
	classes: string[];
}

export interface MonsterItem {
	index: string;
	name: string;
	summary: string;
	size: string;
	type: string;
	subtype?: string;
	alignment?: string;
	challenge_rating: number;
	armor_class: number | { type: string; value: number }[];
	armor_desc?: string;
	hit_points: number;
	hit_dice?: string;
	speed?: Record<string, string | number>;
	strength?: number;
	dexterity?: number;
	constitution?: number;
	intelligence?: number;
	wisdom?: number;
	charisma?: number;
	skills?: Record<string, number>;
	damage_vulnerabilities?: string;
	damage_resistances?: string;
	damage_immunities?: string;
	condition_immunities?: string;
	senses?: string;
	languages?: string;
	desc?: string;
	actions?: Array<{
		name: string;
		desc: string;
		attack_bonus?: number;
		damage_dice?: string;
		damage?: string | { damage_dice: string; damage_type?: { name: string } };
	}>;
	special_abilities?: Array<{
		name: string;
		desc: string;
		attack_bonus?: number;
	}>;
	legendary_actions?: Array<{
		name: string;
		desc: string;
		attack_bonus?: number;
	}>;
	reactions?: Array<{
		name: string;
		desc: string;
	}>;
}
