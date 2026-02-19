import type { CompendiumCard, CompendiumCategory } from '$lib/core/types/compendium';
import {
	Flame,
	Skull,
	Shield,
	Users,
	Scroll,
	Medal,
	Trophy,
	Globe,
	Scale,
	Activity,
	Sparkles,
	Swords,
	Package
} from 'lucide-svelte';
import { COMPENDIUM_TYPE_REGISTRY, type DbType } from './registry';

export const CATEGORIES: CompendiumCategory[] = [
	{ id: 'primary', title: 'Primary Archives', gridCols: 'grid-cols-1 md:grid-cols-2' },
	{
		id: 'character',
		title: 'Character Options',
		gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
	},
	{
		id: 'equipment',
		title: 'Equipment & Treasures',
		gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
	},
	{
		id: 'abilities',
		title: 'Abilities & Proficiencies',
		gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
	},
	{ id: 'rules', title: 'Rules & Reference', gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' }
];

const HREF_ALIASES: Partial<Record<DbType, string>> = {
	species: 'races',
	magicitems: 'items'
};

const COLOR_GRADIENTS: Record<string, string> = {
	rose: 'from-rose-500/20 to-pink-500/20',
	emerald: 'from-emerald-500/20 to-green-500/20',
	amber: 'from-amber-500/20 to-yellow-500/20',
	sky: 'from-sky-500/20 to-blue-500/20',
	violet: 'from-violet-500/20 to-purple-500/20',
	orange: 'from-orange-500/20 to-amber-500/20',
	teal: 'from-teal-500/20 to-cyan-500/20',
	stone: 'from-stone-500/20 to-neutral-500/20',
	indigo: 'from-indigo-500/20 to-violet-500/20',
	fuchsia: 'from-fuchsia-500/20 to-pink-500/20',
	red: 'from-red-500/20 to-rose-500/20',
	slate: 'from-slate-500/20 to-gray-500/20'
};

const COLOR_ACCENTS: Record<string, string> = {
	rose: 'text-rose-400',
	emerald: 'text-emerald-400',
	amber: 'text-amber-400',
	sky: 'text-sky-400',
	violet: 'text-violet-400',
	orange: 'text-orange-400',
	teal: 'text-teal-400',
	stone: 'text-stone-400',
	indigo: 'text-indigo-400',
	fuchsia: 'text-fuchsia-400',
	red: 'text-red-400',
	slate: 'text-slate-400'
};

function generateCardsFromRegistry(): CompendiumCard[] {
	const cards: CompendiumCard[] = [];

	for (const [dbType, entry] of Object.entries(COMPENDIUM_TYPE_REGISTRY)) {
		if (!entry.showOnDashboard) continue;

		const hrefPath = HREF_ALIASES[dbType as DbType] || entry.urlPath || dbType;
		const colorName = entry.color || 'slate';

		cards.push({
			title: entry.displayName,
			description: entry.description,
			href: `/compendium/${hrefPath}`,
			icon: entry.icon || Scroll,
			gradient: COLOR_GRADIENTS[colorName] || 'from-gray-500/20 to-slate-500/20',
			accent: COLOR_ACCENTS[colorName] || 'text-gray-400',
			categoryId: entry.category || 'rules'
		});
	}

	return cards;
}

export const CARDS: CompendiumCard[] = generateCardsFromRegistry();

export function getCardsByCategory(categoryId: string): CompendiumCard[] {
	return CARDS.filter((card) => card.categoryId === categoryId);
}
