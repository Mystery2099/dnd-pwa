/**
 * Feature Configuration
 */

import { Zap } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const FEATURES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/features',
		dbType: 'feature',
		storageKeyFilters: 'feature-filters',
		storageKeyListUrl: 'feature-list-url'
	},

	filters: [
		{
			title: 'Class',
			key: 'className',
			urlParam: 'classes',
			values: [],
			defaultColor: { base: 'text-blue-400', hover: 'group-hover:border-blue-500/50' },
			layout: 'chips',
			openByDefault: true
		},
		{
			title: 'Level',
			key: 'featureLevel',
			urlParam: 'levels',
			values: [
				{ label: '1st', value: 1 },
				{ label: '2nd', value: 2 },
				{ label: '3rd', value: 3 },
				{ label: '4th+', value: 4 }
			],
			defaultColor: { base: 'text-blue-400', hover: 'group-hover:border-blue-500/50' },
			layout: 'list',
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
			{ label: 'Level (Low to High)', value: 'featureLevel-asc', column: 'featureLevel', direction: 'asc' },
			{ label: 'Level (High to Low)', value: 'featureLevel-desc', column: 'featureLevel', direction: 'desc' }
		]
	},

	ui: {
		displayName: 'Feature',
		displayNamePlural: 'Features',
		icon: Zap,
		categoryGradient: 'from-blue-500/20 to-indigo-500/20',
		categoryAccent: 'text-blue-400',
		emptyState: {
			title: 'No features found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Features in Compendium',
			description:
				'The feature database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Features',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.className ? `Level ${item.featureLevel || '?'} - ${item.className}` : '';
		},
		tags: (item) => {
			const tags = [];
			if (item.className) tags.push(item.className);
			if (item.featureLevel) tags.push(`L${item.featureLevel}`);
			return tags;
		},
		listItemAccent: () => 'text-blue-400',
		detailAccent: () => 'text-blue-400',
		metaDescription: () => ''
	}
};
