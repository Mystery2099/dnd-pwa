/**
 * Classes Compendium Configuration
 */

import { Shield } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/types/compendium';
import { colorMap } from '$lib/constants/colors';

export const CLASSES_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/classes',
		dbType: 'class',
		storageKeyFilters: 'class-filters',
		storageKeyListUrl: 'class-list-url'
	},

	filters: [
		{
			title: 'Hit Die',
			key: 'classHitDie',
			urlParam: 'hitdice',
			values: [
				{ label: 'd6', value: 6 },
				{ label: 'd8', value: 8 },
				{ label: 'd10', value: 10 },
				{ label: 'd12', value: 12 }
			],
			defaultColor: colorMap('amber'),
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
		displayName: 'Class',
		displayNamePlural: 'Classes',
		icon: Shield,
		categoryGradient: 'from-amber-500/20 to-orange-500/20',
		categoryAccent: 'text-amber-400',
		emptyState: {
			title: 'No classes found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Classes in Compendium',
			description: 'The class database is empty. Run a sync to populate it.',
			ctaText: 'Sync Classes',
			ctaLink: '/api/admin/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return `Hit Die: d${item.classHitDie || 8}`;
		},
		tags: (item) => {
			return [`d${item.classHitDie || 8}`];
		},
		listItemAccent: () => 'hover:border-amber-500/50',
		detailAccent: () => 'text-amber-400',
		metaDescription: (item) => {
			return `${item.name} is a character class in D&D 5e. ${item.summary || ''}`;
		}
	}
};
