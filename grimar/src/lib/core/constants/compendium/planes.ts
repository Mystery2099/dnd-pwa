/**
 * Planes Compendium Configuration
 *
 * This configuration object drives the entire planes compendium page behavior.
 */

import { Globe } from 'lucide-svelte';
import type { CompendiumTypeConfig, CompendiumItem } from '$lib/core/types/compendium';
import { colorMap } from '$lib/core/constants/colors';

export const PLANES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/planes',
		dbType: 'plane',
		storageKeyFilters: 'plane-filters',
		storageKeyListUrl: 'plane-list-url'
	},

	filters: [
		{
			title: 'Plane Type',
			key: 'planeType',
			urlParam: 'types',
			values: [
				{ label: 'Inner Plane', value: 'Inner Plane' },
				{ label: 'Outer Plane', value: 'Outer Plane' },
				{ label: 'Demiplane', value: 'Demiplane' },
				{ label: 'Extraplanar', value: 'Extraplanar' }
			],
			defaultColor: colorMap('blue'),
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
		displayName: 'Plane',
		displayNamePlural: 'Planes',
		icon: Globe,
		categoryGradient: 'from-blue-500/20 to-cyan-500/20',
		categoryAccent: 'text-blue-400',
		emptyState: {
			title: 'No planes found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No planes available',
			description: 'The compendium is empty. Run a sync to populate planes from Open5e API.',
			ctaText: 'Sync Compendium',
			ctaLink: '/dashboard'
		}
	},

	display: {
		subtitle: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const planeType = (details.plane_type as string) || 'Unknown';
			const alignment = (details.alignment as string) || '';
			return alignment ? `${planeType} • ${alignment}` : planeType;
		},
		tags: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const planeType = (details.plane_type as string) || 'Unknown';
			const alignment = (details.alignment as string) || '';
			return [planeType, alignment].filter(Boolean);
		},
		listItemAccent: () => 'border-blue-400/50 text-blue-300',
		detailAccent: () => colorMap('blue').base,
		metaDescription: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const planeType = (details.plane_type as string) || 'Unknown';
			return `${item.name} is a ${planeType} in D&D 5e's cosmology. ${item.summary || ''}`;
		}
	}
};
