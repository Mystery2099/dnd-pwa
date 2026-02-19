/**
 * Magic School Configuration
 */

import { Wand2 } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const MAGIC_SCHOOLS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/magic-schools',
		dbType: 'spellschools',
		storageKeyFilters: 'magic-school-filters',
		storageKeyListUrl: 'magic-school-list-url'
	},

	filters: [],

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
		displayName: 'Magic Schools',
		icon: Wand2,
		categoryGradient: 'from-purple-500/20 to-pink-500/20',
		categoryAccent: 'text-purple-400',
		emptyState: {
			title: 'No magic schools found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Magic Schools in Compendium',
			description:
				'The magic school database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Magic Schools',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: () => 'Magic School',
		tags: () => [],
		listItemAccent: () => 'text-purple-400',
		detailAccent: () => 'text-purple-400',
		metaDescription: () => ''
	}
};
