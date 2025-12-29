/**
 * Sections Compendium Configuration
 *
 * This configuration object drives the entire rules sections compendium page behavior.
 */

import { BookOpen } from 'lucide-svelte';
import type { CompendiumTypeConfig, CompendiumItem } from '$lib/core/types/compendium';
import { colorMap } from '$lib/core/constants/colors';

export const SECTIONS_CONFIG: CompendiumTypeConfig = {
	routes: {
		basePath: '/compendium/sections',
		dbType: 'section',
		storageKeyFilters: 'section-filters',
		storageKeyListUrl: 'section-list-url'
	},

	filters: [
		{
			title: 'Chapter',
			key: 'chapter',
			urlParam: 'chapters',
			values: [
				{ label: 'Chapter 1: Step-by-Step Characters', value: 'Chapter 1' },
				{ label: 'Chapter 2: Races', value: 'Chapter 2' },
				{ label: 'Chapter 3: Classes', value: 'Chapter 3' },
				{ label: 'Chapter 4: Personality & Backgrounds', value: 'Chapter 4' },
				{ label: 'Chapter 5: Equipment', value: 'Chapter 5' },
				{ label: 'Chapter 6: Customization', value: 'Chapter 6' },
				{ label: 'Chapter 7: Using Ability Scores', value: 'Chapter 7' },
				{ label: 'Chapter 8: Adventuring', value: 'Chapter 8' },
				{ label: 'Chapter 9: Combat', value: 'Chapter 9' },
				{ label: 'Chapter 10: Spellcasting', value: 'Chapter 10' },
				{ label: 'Appendix A: Conditions', value: 'Appendix A' },
				{ label: 'Appendix B: Gods', value: 'Appendix B' },
				{ label: 'Appendix C: Planes', value: 'Appendix C' },
				{ label: 'Appendix D: Monsters', value: 'Appendix D' },
				{ label: 'Appendix E: Magic Items', value: 'Appendix E' },
				{ label: 'Appendix F: handouts', value: 'Appendix F' }
			],
			defaultColor: colorMap('purple'),
			layout: 'list',
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
		displayName: 'Rule',
		displayNamePlural: 'Rules & Reference',
		icon: BookOpen,
		categoryGradient: 'from-purple-500/20 to-fuchsia-500/20',
		categoryAccent: 'text-purple-400',
		emptyState: {
			title: 'No rules found',
			description: 'Try adjusting your filters to find what you are looking for.'
		},
		databaseEmptyState: {
			title: 'No rules available',
			description: 'The compendium is empty. Run a sync to populate rules from Open5e API.',
			ctaText: 'Sync Compendium',
			ctaLink: '/dashboard'
		}
	},

	display: {
		subtitle: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const chapter = (details.chapter as string) || 'SRD';
			return chapter;
		},
		tags: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const chapter = (details.chapter as string) || 'Unknown';
			return [chapter];
		},
		listItemAccent: () => 'border-purple-400/50 text-purple-300',
		detailAccent: () => colorMap('purple').base,
		metaDescription: (item: CompendiumItem) => {
			const details = item.details as Record<string, unknown>;
			const chapter = (details.chapter as string) || 'SRD';
			return `${item.name} - ${chapter}. ${item.summary || ''}`;
		}
	}
};
