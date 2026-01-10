/**
 * Trait Configuration
 */

import { Sparkles } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const TRAITS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/traits',
		dbType: 'trait',
		storageKeyFilters: 'trait-filters',
		storageKeyListUrl: 'trait-list-url'
	},

	filters: [
		{
			title: 'Race',
			key: 'traitRaces',
			urlParam: 'races',
			values: [],
			defaultColor: { base: 'text-purple-400', hover: 'group-hover:border-purple-500/50' },
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
		displayName: 'Trait',
		displayNamePlural: 'Traits',
		icon: Sparkles,
		categoryGradient: 'from-purple-500/20 to-pink-500/20',
		categoryAccent: 'text-purple-400',
		emptyState: {
			title: 'No traits found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Traits in Compendium',
			description:
				'The trait database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Traits',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.traitRaces || '';
		},
		tags: (item) => {
			return item.traitRaces ? [item.traitRaces] : [];
		},
		listItemAccent: () => 'text-purple-400',
		detailAccent: () => 'text-purple-400',
		metaDescription: () => ''
	}
};
