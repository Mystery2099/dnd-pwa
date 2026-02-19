/**
 * Magic Items Compendium Configuration
 */

import { Sparkles } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const ITEMS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/magicitems',
		dbType: 'magicitems',
		storageKeyFilters: 'item-filters',
		storageKeyListUrl: 'item-list-url'
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
		displayName: 'Magic Items',
		icon: Sparkles,
		categoryGradient: 'from-sky-500/20 to-indigo-500/20',
		categoryAccent: 'text-sky-400',
		emptyState: {
			title: 'No items found',
			description: 'Try adjusting your search to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Magic Items in Compendium',
			description: 'The item database is empty. Run a sync to populate it.',
			ctaText: 'Sync Items',
			ctaLink: '/api/admin/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return (item.details.type as string) || 'Magic Item';
		},
		tags: (item) => {
			const rarity = (item.details.rarity as string) || '';
			const type = (item.details.type as string) || '';
			return [rarity, type].filter(Boolean);
		},
		listItemAccent: () => 'hover:border-sky-500/50',
		detailAccent: () => 'text-sky-400',
		metaDescription: (item) => {
			return `${item.name} is a magic item in D&D 5e. ${item.summary || ''}`;
		}
	}
};
