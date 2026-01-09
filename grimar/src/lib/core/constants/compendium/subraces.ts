/**
 * Subrace Configuration
 */

import { Users } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const SUBRACES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/subraces',
		dbType: 'subrace',
		storageKeyFilters: 'subrace-filters',
		storageKeyListUrl: 'subrace-list-url'
	},

	filters: [
		{
			title: 'Race',
			key: 'raceName',
			urlParam: 'races',
			values: [],
			defaultColor: { base: 'text-emerald-400', hover: 'group-hover:border-emerald-500/50' },
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
			{ label: 'Race (A-Z)', value: 'raceName-asc', column: 'raceName', direction: 'asc' },
			{ label: 'Race (Z-A)', value: 'raceName-desc', column: 'raceName', direction: 'desc' }
		]
	},

	ui: {
		displayName: 'Subrace',
		displayNamePlural: 'Subraces',
		icon: Users,
		categoryGradient: 'from-emerald-500/20 to-teal-500/20',
		categoryAccent: 'text-emerald-400',
		emptyState: {
			title: 'No subraces found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Subraces in Compendium',
			description:
				'The subrace database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Subraces',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.raceName ? `${item.raceName} Variant` : '';
		},
		tags: (item) => {
			return item.raceName ? [item.raceName] : [];
		},
		listItemAccent: () => 'text-emerald-400',
		detailAccent: () => 'text-emerald-400',
		metaDescription: () => ''
	}
};
