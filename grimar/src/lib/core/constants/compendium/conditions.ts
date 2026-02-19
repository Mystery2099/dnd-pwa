/**
 * Conditions Compendium Configuration
 *
 * This configuration object drives the entire conditions compendium page behavior.
 */

import { Activity } from 'lucide-svelte';
import type { CompendiumTypeConfig, CompendiumItem } from '$lib/core/types/compendium';
import { colorMap } from '$lib/core/constants/colors';

export const CONDITIONS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/conditions',
		dbType: 'conditions',
		storageKeyFilters: 'condition-filters',
		storageKeyListUrl: 'condition-list-url'
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
			{
				label: 'Name (A-Z)',
				value: 'name-asc',
				column: 'name',
				direction: 'asc'
			},
			{
				label: 'Name (Z-A)',
				value: 'name-desc',
				column: 'name',
				direction: 'desc'
			}
		]
	},

	ui: {
		displayName: 'Conditions',
		icon: Activity,
		categoryGradient: 'from-red-500/20 to-rose-500/20',
		categoryAccent: 'text-red-400',
		emptyState: {
			title: 'No conditions found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No conditions available',
			description: 'The compendium is empty. Run a sync to populate conditions from Open5e API.',
			ctaText: 'Sync Compendium',
			ctaLink: '/dashboard'
		}
	},

	display: {
		subtitle: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const source = (details.source as string) || 'PHB';
			return `Source: ${source}`;
		},
		tags: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const source = (details.source as string) || 'Unknown';
			return [source];
		},
		listItemAccent: () => 'border-red-400/50 text-red-300',
		detailAccent: () => colorMap('red').base,
		metaDescription: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			return `${item.name} is a condition in D&D 5e. ${item.summary || (details.description as string) || ''}`;
		}
	}
};
