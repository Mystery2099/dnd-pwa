/**
 * Creatures Compendium Configuration
 *
 * This configuration object drives the entire creatures compendium page behavior.
 */

import { Skull } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';
import {
	colorMap,
	CREATURE_TYPE_COLORS,
	CREATURE_TYPE_TEXT_COLORS
} from '$lib/core/constants/colors';

// Creature size options
const CREATURE_SIZES = [
	{ label: 'Tiny', value: 'Tiny', order: 0 },
	{ label: 'Small', value: 'Small', order: 1 },
	{ label: 'Medium', value: 'Medium', order: 2 },
	{ label: 'Large', value: 'Large', order: 3 },
	{ label: 'Huge', value: 'Huge', order: 4 },
	{ label: 'Gargantuan', value: 'Gargantuan', order: 5 }
];

// Creature type options with colors
const CREATURE_TYPES = [
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

export const CREATURES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/creatures',
		dbType: 'creatures',
		storageKeyFilters: 'creature-filters',
		storageKeyListUrl: 'creature-list-url'
	},

	filters: [
		{
			title: 'Size',
			key: 'size',
			urlParam: 'sizes',
			values: CREATURE_SIZES,
			defaultColor: colorMap('gray'),
			layout: 'chips',
			openByDefault: false
		},
		{
			title: 'Type',
			key: 'type',
			urlParam: 'types',
			values: CREATURE_TYPES,
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
		displayName: 'Creature',
		displayNamePlural: 'Creatures',
		icon: Skull,
		categoryGradient: 'from-emerald-500/20 to-rose-500/20',
		categoryAccent: 'text-emerald-400',
		emptyState: {
			title: 'No creatures found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No creatures available',
			description: 'The compendium is empty. Run a sync to populate creatures from Open5e.',
			ctaText: 'Sync Compendium',
			ctaLink: '/dashboard'
		}
	},

	display: {
		subtitle: (item) => {
			const cr = item.details.challenge_rating || 'Unknown';
			const type = item.creatureType || 'Unknown';
			const size = item.creatureSize || 'Medium';
			return `${size} ${type} • CR ${cr}`;
		},
		tags: (item) => {
			const type = item.creatureType || 'Unknown';
			const size = item.creatureSize || 'Medium';
			const cr = item.details.challenge_rating || '0';
			return [type, size, `CR ${cr}`];
		},
		listItemAccent: (item) => {
			const type = item.creatureType || 'Unknown';
			return (
				CREATURE_TYPE_COLORS[type as keyof typeof CREATURE_TYPE_COLORS] ||
				CREATURE_TYPE_COLORS.default
			);
		},
		detailAccent: (item) => {
			const type = item.creatureType || 'Unknown';
			return (
				CREATURE_TYPE_TEXT_COLORS[type as keyof typeof CREATURE_TYPE_TEXT_COLORS] ||
				colorMap('gray').base
			);
		},
		metaDescription: (item) => {
			const cr = item.details.challenge_rating || 'Unknown';
			const type = item.creatureType || 'creature';
			const size = item.creatureSize || 'Medium';
			return `${item.name} is a ${size} ${type} with Challenge Rating ${cr} in D&D 5e. ${item.summary || ''}`;
		}
	}
};
