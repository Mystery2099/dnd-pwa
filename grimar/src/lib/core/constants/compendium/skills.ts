/**
 * Skill Configuration
 */

import { Brain } from 'lucide-svelte';
import type { CompendiumTypeConfig } from '$lib/core/types/compendium';

export const SKILLS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/skills',
		dbType: 'skill',
		storageKeyFilters: 'skill-filters',
		storageKeyListUrl: 'skill-list-url'
	},

	filters: [
		{
			title: 'Ability Score',
			key: 'abilityScore',
			urlParam: 'abilities',
			values: [
				{ label: 'Strength', value: 'STR' },
				{ label: 'Dexterity', value: 'DEX' },
				{ label: 'Constitution', value: 'CON' },
				{ label: 'Intelligence', value: 'INT' },
				{ label: 'Wisdom', value: 'WIS' },
				{ label: 'Charisma', value: 'CHA' }
			],
			defaultColor: { base: 'text-cyan-400', hover: 'group-hover:border-cyan-500/50' },
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
		displayName: 'Skill',
		displayNamePlural: 'Skills',
		icon: Brain,
		categoryGradient: 'from-cyan-500/20 to-teal-500/20',
		categoryAccent: 'text-cyan-400',
		emptyState: {
			title: 'No skills found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No Skills in Compendium',
			description:
				'The skill database appears to be empty. Sync data from the SRD API to populate it.',
			ctaText: 'Sync Skills',
			ctaLink: '/compendium/sync'
		}
	},

	display: {
		subtitle: (item) => {
			return item.abilityScore ? `${item.abilityScore} skill` : '';
		},
		tags: (item) => {
			return item.abilityScore ? [item.abilityScore] : [];
		},
		listItemAccent: () => 'text-cyan-400',
		detailAccent: () => 'text-cyan-400',
		metaDescription: () => ''
	}
};
