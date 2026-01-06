/**
 * Spells Compendium Configuration
 *
 * This configuration object drives the entire spells compendium page behavior.
 * To add a new compendium type, create a similar config file with type-specific values.
 */

import { Flame } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';
import {
	colorMap,
	SPELL_SCHOOL_COLORS,
	SPELL_SCHOOL_TEXT_COLORS
} from '$lib/core/constants/colors';
import { getSpellSchool, getSpellLevelText } from '$lib/core/types/compendium/helpers';

// Spell level options
const SPELL_LEVELS = [
	{ label: 'Cantrip', value: 0, order: 0 },
	{ label: '1st Level', value: 1, order: 1 },
	{ label: '2nd Level', value: 2, order: 2 },
	{ label: '3rd Level', value: 3, order: 3 },
	{ label: '4th Level', value: 4, order: 4 },
	{ label: '5th Level', value: 5, order: 5 },
	{ label: '6th Level', value: 6, order: 6 },
	{ label: '7th Level', value: 7, order: 7 },
	{ label: '8th Level', value: 8, order: 8 },
	{ label: '9th Level', value: 9, order: 9 }
];

// Spell school options with colors
const SPELL_SCHOOLS = [
	{ label: 'Evocation', value: 'Evocation', color: colorMap('rose') },
	{ label: 'Abjuration', value: 'Abjuration', color: colorMap('sky') },
	{ label: 'Necromancy', value: 'Necromancy', color: colorMap('emerald') },
	{ label: 'Illusion', value: 'Illusion', color: colorMap('purple') },
	{ label: 'Divination', value: 'Divination', color: colorMap('amber') },
	{ label: 'Enchantment', value: 'Enchantment', color: colorMap('pink') },
	{ label: 'Conjuration', value: 'Conjuration', color: colorMap('orange') },
	{ label: 'Transmutation', value: 'Transmutation', color: colorMap('teal') }
];

// Map spell school name to simplified school name for card styling
const SPELL_SCHOOL_TO_GEM: Record<string, string> = {
	Evocation: 'evocation',
	Abjuration: 'abjuration',
	Necromancy: 'necromancy',
	Illusion: 'illusion',
	Divination: 'divination',
	Enchantment: 'illusion',
	Conjuration: 'necromancy',
	Transmutation: 'divination',
	default: 'evocation'
};

export const SPELLS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/spells',
		dbType: 'spell',
		storageKeyFilters: 'spell-filters',
		storageKeyListUrl: 'spell-list-url'
	},

	filters: [
		{
			title: 'Spell Level',
			key: 'spellLevel',
			urlParam: 'levels',
			values: SPELL_LEVELS,
			defaultColor: colorMap('purple'),
			layout: 'list',
			openByDefault: true
		},
		{
			title: 'School of Magic',
			key: 'spellSchool',
			urlParam: 'schools',
			values: SPELL_SCHOOLS,
			defaultColor: colorMap('purple'),
			layout: 'chips',
			openByDefault: true
		}
	],

	sorting: {
		default: {
			label: 'Name (A-Z)',
			value: 'name-asc',
			column: 'name',
			direction: 'asc'
		},
		options: [
			{ label: 'Name (A-Z)', value: 'name-asc', column: 'name', direction: 'asc' },
			{ label: 'Name (Z-A)', value: 'name-desc', column: 'name', direction: 'desc' },
			{
				label: 'Level (Low to High)',
				value: 'spellLevel-asc',
				column: 'spellLevel',
				direction: 'asc'
			},
			{
				label: 'Level (High to Low)',
				value: 'spellLevel-desc',
				column: 'spellLevel',
				direction: 'desc'
			},
			{
				label: 'School (A-Z)',
				value: 'spellSchool-asc',
				column: 'spellSchool',
				direction: 'asc'
			},
			{
				label: 'School (Z-A)',
				value: 'spellSchool-desc',
				column: 'spellSchool',
				direction: 'desc'
			}
		]
	},

	ui: {
		displayName: 'Spell',
		displayNamePlural: 'Spells',
		icon: Flame,
		categoryGradient: 'from-rose-500/20 to-purple-500/20',
		categoryAccent: 'text-rose-400',
		emptyState: {
			title: 'No spells found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Spells in Compendium',
			description:
				'The spell database appears to be empty. Sync data from the Open5e API to populate it.',
			ctaText: 'Sync Spells',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			const level = getSpellLevelText(item);
			const school = getSpellSchool(item);
			return `${level} • ${school}`;
		},

		tags: (item) => {
			const level = getSpellLevelText(item);
			const school = getSpellSchool(item);
			const classes = (item.details.classes as Array<{ name: string }>) || [];
			return [school, level, ...classes.map((c) => c.name)];
		},

		listItemAccent: (item) => {
			const school = getSpellSchool(item);
			return (
				SPELL_SCHOOL_COLORS[school as keyof typeof SPELL_SCHOOL_COLORS] ||
				SPELL_SCHOOL_COLORS.default
			);
		},

		// Get simplified school name for card styling (maps to gem colors)
		cardSchool: (item) => {
			const school = getSpellSchool(item);
			return SPELL_SCHOOL_TO_GEM[school] || SPELL_SCHOOL_TO_GEM.default;
		},

		detailAccent: (item) => {
			const school = getSpellSchool(item);
			return (
				SPELL_SCHOOL_TEXT_COLORS[school as keyof typeof SPELL_SCHOOL_TEXT_COLORS] ||
				SPELL_SCHOOL_TEXT_COLORS.default
			);
		},

		metaDescription: (item) => {
			const level = getSpellLevelText(item);
			const school = getSpellSchool(item);
			return `${item.name} is a ${level} ${school} spell in D&D 5e. ${item.summary || ''}`;
		}
	}
};
