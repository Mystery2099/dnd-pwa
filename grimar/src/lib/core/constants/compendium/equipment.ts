/**
 * Equipment Configuration
 */

import { Sword } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const EQUIPMENT_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/equipment',
		dbType: 'equipment',
		storageKeyFilters: 'equipment-filters',
		storageKeyListUrl: 'equipment-list-url'
	},

	filters: [
		{
			title: 'Category',
			key: 'equipmentCategory',
			urlParam: 'categories',
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
			{ label: 'Name (Z-A)', value: 'name-desc', column: 'name', direction: 'desc' }
		]
	},

	ui: {
		displayName: 'Equipment',
		displayNamePlural: 'Equipment',
		icon: Sword,
		categoryGradient: 'from-amber-500/20 to-yellow-500/20',
		categoryAccent: 'text-amber-400',
		emptyState: {
			title: 'No equipment found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Equipment in Compendium',
			description:
				'The equipment database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Equipment',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.equipmentCategory || '';
		},
		tags: (item) => {
			return item.equipmentCategory ? [item.equipmentCategory] : [];
		},
		listItemAccent: () => 'text-amber-400',
		detailAccent: () => 'text-amber-400',
		metaDescription: () => ''
	}
};
