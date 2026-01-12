/**
 * Alignment Configuration
 */

import { Scale } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const ALIGNMENTS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/alignments',
		dbType: 'alignments',
		storageKeyFilters: 'alignment-filters',
		storageKeyListUrl: 'alignment-list-url'
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
		displayName: 'Alignment',
		displayNamePlural: 'Alignments',
		icon: Scale,
		categoryGradient: 'from-violet-500/20 to-purple-500/20',
		categoryAccent: 'text-violet-400',
		emptyState: {
			title: 'No alignments found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Alignments in Compendium',
			description:
				'The alignment database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Alignments',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.alignmentAbbreviation || '';
		},
		tags: (item) => {
			return item.alignmentAbbreviation ? [item.alignmentAbbreviation] : [];
		},
		listItemAccent: () => 'text-violet-400',
		detailAccent: () => 'text-violet-400',
		metaDescription: () => ''
	}
};
