/**
 * Damage Type Configuration
 */

import { Flame } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const DAMAGE_TYPES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/damage-types',
		dbType: 'damagetypes',
		storageKeyFilters: 'damage-type-filters',
		storageKeyListUrl: 'damage-type-list-url'
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
		displayName: 'Damage Types',
		icon: Flame,
		categoryGradient: 'from-red-500/20 to-orange-500/20',
		categoryAccent: 'text-red-400',
		emptyState: {
			title: 'No damage types found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Damage Types in Compendium',
			description:
				'The damage type database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Damage Types',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: () => 'Damage Type',
		tags: () => [],
		listItemAccent: () => 'text-red-400',
		detailAccent: () => 'text-red-400',
		metaDescription: () => ''
	}
};
