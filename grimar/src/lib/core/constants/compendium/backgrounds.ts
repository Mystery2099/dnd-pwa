/**
 * Backgrounds Compendium Configuration
 */

import { Scroll } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const BACKGROUNDS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/backgrounds',
		dbType: 'backgrounds',
		storageKeyFilters: 'background-filters',
		storageKeyListUrl: 'background-list-url'
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
		displayName: 'Backgrounds',
		icon: Scroll,
		categoryGradient: 'from-indigo-500/20 to-violet-500/20',
		categoryAccent: 'text-indigo-400',
		emptyState: {
			title: 'No backgrounds found',
			description: 'Try adjusting your search to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Backgrounds in Compendium',
			description: 'The background database is empty. Run a sync to populate it.',
			ctaText: 'Sync Backgrounds',
			ctaLink: '/api/admin/sync'
		}
	},

	display: {
		subtitle: (item) => {
			const skills = item.details.skill_proficiencies as string | undefined;
			return skills ? `Skills: ${skills}` : 'Background';
		},
		tags: (item) => {
			const skills = item.details.skill_proficiencies as string | undefined;
			return skills ? skills.split(', ') : [];
		},
		listItemAccent: () => 'hover:border-indigo-500/50',
		detailAccent: () => 'text-indigo-400',
		metaDescription: (item) => {
			return `${item.name} is a character background in D&D 5e. ${item.summary || ''}`;
		}
	}
};
