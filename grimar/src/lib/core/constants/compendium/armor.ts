/**
 * Armor Compendium Configuration
 *
 * This configuration object drives the entire armor compendium page behavior.
 */

import { Shirt } from 'lucide-svelte';
import type { CompendiumTypeConfig, CompendiumItem } from '$lib/core/types/compendium';
import { colorMap } from '$lib/core/constants/colors';

export const ARMOR_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/armor',
		dbType: 'armor',
		storageKeyFilters: 'armor-filters',
		storageKeyListUrl: 'armor-list-url'
	},

	filters: [
		{
			title: 'Armor Type',
			key: 'type',
			urlParam: 'types',
			values: [
				{ label: 'Light Armor', value: 'Light' },
				{ label: 'Medium Armor', value: 'Medium' },
				{ label: 'Heavy Armor', value: 'Heavy' },
				{ label: 'Shields', value: 'Shield' }
			],
			defaultColor: colorMap('zinc'),
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
			},
			{
				label: 'Armor Class (High to Low)',
				value: 'ac-desc',
				column: 'name',
				direction: 'asc'
			},
			{
				label: 'Armor Class (Low to High)',
				value: 'ac-asc',
				column: 'name',
				direction: 'desc'
			}
		]
	},

	ui: {
		displayName: 'Armor',
		icon: Shirt,
		categoryGradient: 'from-zinc-500/20 to-slate-500/20',
		categoryAccent: 'text-zinc-400',
		emptyState: {
			title: 'No armor found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No armor available',
			description: 'The compendium is empty. Run a sync to populate armor from Open5e API.',
			ctaText: 'Sync Compendium',
			ctaLink: '/dashboard'
		}
	},

	display: {
		subtitle: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const ac = (details.armor_class as string) || '10';
			const type = (details.type as string) || 'Light';
			const stealth = details.stealth_disadvantage ? ' (Stealth Disadvantage)' : '';
			return `AC ${ac} • ${type}${stealth}`;
		},
		tags: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const type = (details.type as string) || 'Unknown';
			const ac = details.armor_class ? `AC ${details.armor_class}` : '';
			const weight = details.weight ? `${details.weight} lb.` : '';
			return [type, ac, weight].filter(Boolean);
		},
		listItemAccent: () => 'border-zinc-400/50 text-zinc-300',
		detailAccent: () => colorMap('zinc').base,
		metaDescription: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const ac = (details.armor_class as string) || '10';
			const type = (details.type as string) || 'Unknown';
			return `${item.name} is ${type} armor with AC ${ac} in D&D 5e. ${item.summary || ''}`;
		}
	}
};
