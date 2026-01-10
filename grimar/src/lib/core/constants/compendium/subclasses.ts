/**
 * Subclass Configuration
 */

import { Scroll } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const SUBCLASSES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/subclasses',
		dbType: 'subclass',
		storageKeyFilters: 'subclass-filters',
		storageKeyListUrl: 'subclass-list-url'
	},

	filters: [
		{
			title: 'Class',
			key: 'className',
			urlParam: 'classes',
			values: [],
			defaultColor: { base: 'text-amber-400', hover: 'group-hover:border-amber-500/50' },
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
			{ label: 'Class (A-Z)', value: 'className-asc', column: 'className', direction: 'asc' },
			{ label: 'Class (Z-A)', value: 'className-desc', column: 'className', direction: 'desc' }
		]
	},

	ui: {
		displayName: 'Subclass',
		displayNamePlural: 'Subclasses',
		icon: Scroll,
		categoryGradient: 'from-amber-500/20 to-orange-500/20',
		categoryAccent: 'text-amber-400',
		emptyState: {
			title: 'No subclasses found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Subclasses in Compendium',
			description:
				'The subclass database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Subclasses',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.className ? `${item.className} Archetype` : '';
		},
		tags: (item) => {
			return item.className ? [item.className] : [];
		},
		listItemAccent: () => 'text-amber-400',
		detailAccent: () => 'text-amber-400',
		metaDescription: (item) => item.subclassFlavor || ''
	}
};
