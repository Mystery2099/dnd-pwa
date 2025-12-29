/**
 * Compendium Transformer Types
 *
 * Type definitions for data transformation between provider formats
 * and the application's standardized format.
 */

// Open5e API types (raw from provider)
export interface Open5eSpell {
	index: string;
	slug: string;
	name: string;
	desc?: string[] | string;
	higher_level?: string[] | string;
	level: number;
	school: { name: string };
	components?: string[];
}

export interface Open5eMonster {
	index: string;
	slug: string;
	name: string;
	size: string;
	type: string;
	challenge_rating: number;
	armor_class?: number | { type: string; value: number }[];
	hit_points?: number;
}

// Standardized item types (transformed)
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
	challenge_rating: number;
	armor_class: number;
	hit_points: number;
}
