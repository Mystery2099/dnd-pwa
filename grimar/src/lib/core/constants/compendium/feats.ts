/**
 * Feats Compendium Configuration
 */

import { Medal } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const FEATS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/feats',
		dbType: 'feats',
		storageKeyFilters: 'feat-filters',
		storageKeyListUrl: 'feat-list-url'
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
		displayName: 'Feat',
		displayNamePlural: 'Feats',
		icon: Medal,
		categoryGradient: 'from-yellow-500/20 to-amber-500/20',
		categoryAccent: 'text-yellow-400',
		emptyState: {
			title: 'No feats found',
			description: 'Try adjusting your search to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Feats in Compendium',
			description: 'The feat database is empty. Run a sync to populate it.',
			ctaText: 'Sync Feats',
			ctaLink: '/api/admin/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.featPrerequisites ? `Prerequisite: ${item.featPrerequisites}` : 'Feat';
		},
		tags: (item) => {
			return item.featPrerequisites ? [item.featPrerequisites] : [];
		},
		listItemAccent: () => 'hover:border-yellow-500/50',
		detailAccent: () => 'text-yellow-400',
		metaDescription: (item) => {
			return `${item.name} is a feat in D&D 5e. ${item.summary || ''}`;
		}
	}
};
