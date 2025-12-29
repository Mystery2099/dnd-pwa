/**
 * Compendium filter configurations
 *
 * Centralized configuration for filter sets, sort options, and defaults
 * for different compendium types (spells, monsters, items, etc.)
 */

import type { CompendiumFilterConfig } from '$lib/types/compendium/filter';

/**
 * Spells filter configuration
 *
 * Filter sets:
 * - levels: Spell levels (Cantrip, 1st, 2nd, etc.)
 * - schools: Magic schools (Abjuration, Evocation, etc.)
 */
export const SPELLS_FILTER_CONFIG: CompendiumFilterConfig = {
	setParams: {
		levels: 'level',
		schools: 'school'
	},
	validSortBy: ['name', 'spellLevel', 'spellSchool'],
	defaults: {
		sortBy: 'name',
		sortOrder: 'asc'
	}
};

/**
 * Monsters filter configuration
 *
 * Filter sets:
 * - types: Monster types (Dragon, Undead, etc.)
 * - sizes: Monster sizes (Tiny, Small, Medium, etc.)
 */
export const MONSTERS_FILTER_CONFIG: CompendiumFilterConfig = {
	setParams: {
		types: 'type',
		sizes: 'size'
	},
	validSortBy: ['name', 'challengeRating', 'monsterType', 'monsterSize'],
	defaults: {
		sortBy: 'name',
		sortOrder: 'asc'
	}
};
