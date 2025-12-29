/**
 * Races Compendium Configuration
 */

import { Users } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';
import { colorMap } from '$lib/core/constants/colors';

export const RACES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/races',
		dbType: 'race',
		storageKeyFilters: 'race-filters',
		storageKeyListUrl: 'race-list-url'
	},

	filters: [
		{
			title: 'Size',
			key: 'raceSize',
			urlParam: 'sizes',
			values: [
				{ label: 'Small', value: 'Small' },
				{ label: 'Medium', value: 'Medium' }
			],
			defaultColor: colorMap('pink'),
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
			{ label: 'Name (Z-A)', value: 'name-desc', column: 'name', direction: 'desc' }
		]
	},

	ui: {
		displayName: 'Race',
		displayNamePlural: 'Races',
		icon: Users,
		categoryGradient: 'from-pink-500/20 to-rose-500/20',
		categoryAccent: 'text-pink-400',
		emptyState: {
			title: 'No races found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Races in Compendium',
			description: 'The race database is empty. Run a sync to populate it.',
			ctaText: 'Sync Races',
			ctaLink: '/api/admin/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return `${item.raceSize || 'Medium'} | Speed ${item.raceSpeed || 30}ft`;
		},
		tags: (item) => {
			return [item.raceSize || 'Medium'];
		},
		listItemAccent: () => 'hover:border-pink-500/50',
		detailAccent: () => 'text-pink-400',
		metaDescription: (item) => {
			return `${item.name} is a character race in D&D 5e. ${item.summary || ''}`;
		}
	}
};
