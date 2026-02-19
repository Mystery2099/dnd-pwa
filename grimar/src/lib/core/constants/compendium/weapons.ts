/**
 * Weapons Compendium Configuration
 *
 * This configuration object drives the entire weapons compendium page behavior.
 */

import { Sword } from 'lucide-svelte';
import type { CompendiumTypeConfig, CompendiumItem } from '$lib/core/types/compendium';
import { colorMap } from '$lib/core/constants/colors';

export const WEAPONS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/weapons',
		dbType: 'weapons',
		storageKeyFilters: 'weapon-filters',
		storageKeyListUrl: 'weapon-list-url'
	},

	filters: [
		{
			title: 'Weapon Type',
			key: 'type',
			urlParam: 'types',
			values: [
				{ label: 'Simple Melee', value: 'Simple Melee' },
				{ label: 'Simple Ranged', value: 'Simple Ranged' },
				{ label: 'Martial Melee', value: 'Martial Melee' },
				{ label: 'Martial Ranged', value: 'Martial Ranged' }
			],
			defaultColor: colorMap('slate'),
			layout: 'chips',
			openByDefault: true
		},
		{
			title: 'Property',
			key: 'property',
			urlParam: 'properties',
			values: [
				{ label: 'Finesse', value: 'Finesse' },
				{ label: 'Heavy', value: 'Heavy' },
				{ label: 'Light', value: 'Light' },
				{ label: 'Loading', value: 'Loading' },
				{ label: 'Range', value: 'Range' },
				{ label: 'Reach', value: 'Reach' },
				{ label: 'Thrown', value: 'Thrown' },
				{ label: 'Versatile', value: 'Versatile' }
			],
			defaultColor: colorMap('gray'),
			layout: 'chips',
			openByDefault: false
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
			},
			{
				label: 'Damage (Low to High)',
				value: 'damage-asc',
				column: 'name',
				direction: 'asc'
			},
			{
				label: 'Damage (High to Low)',
				value: 'damage-desc',
				column: 'name',
				direction: 'desc'
			}
		]
	},

	ui: {
		displayName: 'Weapons',
		icon: Sword,
		categoryGradient: 'from-slate-500/20 to-gray-500/20',
		categoryAccent: 'text-slate-400',
		emptyState: {
			title: 'No weapons found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No weapons available',
			description: 'The compendium is empty. Run a sync to populate weapons from Open5e API.',
			ctaText: 'Sync Compendium',
			ctaLink: '/dashboard'
		}
	},

	display: {
		subtitle: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const damage = (details.damage as string) || '1d4';
			const type = (details.type as string) || 'Simple Melee';
			const properties = (details.properties as string[]) || [];
			return `${damage} • ${type}${properties.length ? ` (${properties.join(', ')})` : ''}`;
		},
		tags: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const type = (details.type as string) || 'Unknown';
			const damage = (details.damage as string) || '';
			const weight = details.weight ? `${details.weight} lb.` : '';
			return [type, damage, weight].filter(Boolean);
		},
		listItemAccent: () => 'border-slate-400/50 text-slate-300',
		detailAccent: () => colorMap('slate').base,
		metaDescription: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const damage = (details.damage as string) || '1d4';
			const type = (details.type as string) || 'Unknown';
			return `${item.name} is a ${type} weapon dealing ${damage} damage in D&D 5e. ${item.summary || ''}`;
		}
	}
};
