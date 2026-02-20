/**
 * Language Configuration
 */

import { MessageSquare } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const LANGUAGES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/languages',
		dbType: 'languages',
		storageKeyFilters: 'language-filters',
		storageKeyListUrl: 'language-list-url'
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
		displayName: 'Languages',
		icon: MessageSquare,
		categoryGradient: 'from-yellow-500/20 to-orange-500/20',
		categoryAccent: 'text-yellow-400',
		emptyState: {
			title: 'No languages found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Languages in Compendium',
			description:
				'The language database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Languages',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return (item.details.typical_speakers as string) || '';
		},
		tags: () => [],
		listItemAccent: () => 'text-yellow-400',
		detailAccent: () => 'text-yellow-400',
		metaDescription: () => ''
	}
};
