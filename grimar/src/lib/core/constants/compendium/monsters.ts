/**
 * Monsters Compendium Configuration
 *
 * This configuration object drives the entire monsters compendium page behavior.
 */

import { Skull } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';
import {
	colorMap,
	MONSTER_TYPE_COLORS,
	MONSTER_TYPE_TEXT_COLORS
} from '$lib/core/constants/colors';

// Monster size options
const MONSTER_SIZES = [
	{ label: 'Tiny', value: 'Tiny', order: 0 },
	{ label: 'Small', value: 'Small', order: 1 },
	{ label: 'Medium', value: 'Medium', order: 2 },
	{ label: 'Large', value: 'Large', order: 3 },
	{ label: 'Huge', value: 'Huge', order: 4 },
	{ label: 'Gargantuan', value: 'Gargantuan', order: 5 }
];

// Monster type options with colors
const MONSTER_TYPES = [
	{ label: 'Aberration', value: 'Aberration', color: colorMap('purple') },
	{ label: 'Beast', value: 'Beast', color: colorMap('orange') },
	{ label: 'Celestial', value: 'Celestial', color: colorMap('amber') },
	{ label: 'Construct', value: 'Construct', color: colorMap('gray') },
	{ label: 'Dragon', value: 'Dragon', color: colorMap('rose') },
	{ label: 'Elemental', value: 'Elemental', color: colorMap('cyan') },
	{ label: 'Fey', value: 'Fey', color: colorMap('pink') },
	{ label: 'Fiend', value: 'Fiend', color: colorMap('red') },
	{ label: 'Giant', value: 'Giant', color: colorMap('stone') },
	{ label: 'Humanoid', value: 'Humanoid', color: colorMap('slate') },
	{ label: 'Monstrosity', value: 'Monstrosity', color: colorMap('teal') },
	{ label: 'Ooze', value: 'Ooze', color: colorMap('lime') },
	{ label: 'Plant', value: 'Plant', color: colorMap('green') },
	{ label: 'Undead', value: 'Undead', color: colorMap('emerald') }
];

export const MONSTERS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/monsters',
		dbType: 'monster',
		storageKeyFilters: 'monster-filters',
		storageKeyListUrl: 'monster-list-url'
	},

	filters: [
		{
			title: 'Size',
			key: 'size',
			urlParam: 'sizes',
			values: MONSTER_SIZES,
			defaultColor: colorMap('gray'),
			layout: 'chips',
			openByDefault: false
		},
		{
			title: 'Type',
			key: 'type',
			urlParam: 'types',
			values: MONSTER_TYPES,
			defaultColor: colorMap('gray'),
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
			{
				label: 'Name (A-Z)',
				value: 'name-asc',
				column: 'name',
				direction: 'asc'
			},
			{
				label: 'Name (Z-A)',
				value: 'name-desc',
				column: 'name',
				direction: 'desc'
			},
			{
				label: 'Challenge Rating (Low to High)',
				value: 'cr-asc',
				column: 'challengeRating',
				direction: 'asc'
			},
			{
				label: 'Challenge Rating (High to Low)',
				value: 'cr-desc',
				column: 'challengeRating',
				direction: 'desc'
			}
		]
	},

	ui: {
		displayName: 'Monster',
		displayNamePlural: 'Monsters',
		icon: Skull,
		categoryGradient: 'from-emerald-500/20 to-rose-500/20',
		categoryAccent: 'text-emerald-400',
		emptyState: {
			title: 'No monsters found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No monsters available',
			description: 'The compendium is empty. Run a sync to populate monsters from Open5e API.',
			ctaText: 'Sync Compendium',
			ctaLink: '/dashboard'
		}
	},

	display: {
		subtitle: (item) => {
			const cr = item.details.challenge_rating || 'Unknown';
			const type = item.monsterType || 'Unknown';
			const size = item.monsterSize || 'Medium';
			return `${size} ${type} • CR ${cr}`;
		},
		tags: (item) => {
			const type = item.monsterType || 'Unknown';
			const size = item.monsterSize || 'Medium';
			const cr = item.details.challenge_rating || '0';
			return [type, size, `CR ${cr}`];
		},
		listItemAccent: (item) => {
			const type = item.monsterType || 'Unknown';
			return (
				MONSTER_TYPE_COLORS[type as keyof typeof MONSTER_TYPE_COLORS] || MONSTER_TYPE_COLORS.default
			);
		},
		detailAccent: (item) => {
			const type = item.monsterType || 'Unknown';
			return (
				MONSTER_TYPE_TEXT_COLORS[type as keyof typeof MONSTER_TYPE_TEXT_COLORS] ||
				colorMap('gray').base
			);
		},
		metaDescription: (item) => {
			const cr = item.details.challenge_rating || 'Unknown';
			const type = item.monsterType || 'creature';
			const size = item.monsterSize || 'Medium';
			return `${item.name} is a ${size} ${type} with Challenge Rating ${cr} in D&D 5e. ${item.summary || ''}`;
		}
	}
};
