import type { CompendiumCard, CompendiumCategory } from '$lib/core/types/compendium/categories';
import {
	Flame,
	Skull,
	Sparkles,
	Shield,
	Users,
	Scroll,
	Medal,
	Sword,
	Shirt,
	Activity,
	Globe,
	BookOpen
} from 'lucide-svelte';

export const CATEGORIES: CompendiumCategory[] = [
	{ id: 'primary', title: 'Primary Archives', gridCols: 'grid-cols-1 md:grid-cols-3' },
	{ id: 'character', title: 'Character Options', gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' },
	{ id: 'armory', title: 'The Armory', gridCols: 'grid-cols-1 sm:grid-cols-2' },
	{ id: 'rules', title: 'Rules & Reference', gridCols: 'grid-cols-1 sm:grid-cols-3' }
];

export const CARDS: CompendiumCard[] = [
	// Primary Archives
	{
		title: 'Spells',
		description: 'Incantations and rituals.',
		href: '/compendium/spells',
		icon: Flame,
		gradient: 'from-rose-500/20 to-orange-500/20',
		accent: 'text-rose-400',
		categoryId: 'primary'
	},
	{
		title: 'Monsters',
		description: 'Beasts and planar entities.',
		href: '/compendium/monsters',
		icon: Skull,
		gradient: 'from-emerald-500/20 to-teal-500/20',
		accent: 'text-emerald-400',
		categoryId: 'primary'
	},
	{
		title: 'Magic Items',
		description: 'Artifacts and wonders.',
		href: '/compendium/magicitems',
		icon: Sparkles,
		gradient: 'from-sky-500/20 to-indigo-500/20',
		accent: 'text-sky-400',
		categoryId: 'primary'
	},
	// Character Options
	{
		title: 'Classes',
		description: 'Paths of power.',
		href: '/compendium/classes',
		icon: Shield,
		gradient: 'from-amber-500/20 to-orange-500/20',
		accent: 'text-amber-400',
		categoryId: 'character'
	},
	{
		title: 'Races',
		description: 'Lineages and origins.',
		href: '/compendium/races',
		icon: Users,
		gradient: 'from-pink-500/20 to-rose-500/20',
		accent: 'text-pink-400',
		categoryId: 'character'
	},
	{
		title: 'Backgrounds',
		description: 'History and lore.',
		href: '/compendium/backgrounds',
		icon: Scroll,
		gradient: 'from-indigo-500/20 to-violet-500/20',
		accent: 'text-indigo-400',
		categoryId: 'character'
	},
	{
		title: 'Feats',
		description: 'Specialized talents.',
		href: '/compendium/feats',
		icon: Medal,
		gradient: 'from-yellow-500/20 to-amber-500/20',
		accent: 'text-yellow-400',
		categoryId: 'character'
	},
	// The Armory
	{
		title: 'Weapons',
		description: 'Blades, bows, and axes.',
		href: '/compendium/weapons',
		icon: Sword,
		gradient: 'from-slate-500/20 to-gray-500/20',
		accent: 'text-slate-400',
		categoryId: 'armory'
	},
	{
		title: 'Armor',
		description: 'Protection and shields.',
		href: '/compendium/armor',
		icon: Shirt,
		gradient: 'from-zinc-500/20 to-slate-500/20',
		accent: 'text-zinc-400',
		categoryId: 'armory'
	},
	// Rules & Reference
	{
		title: 'Conditions',
		description: 'Afflictions and states.',
		href: '/compendium/conditions',
		icon: Activity,
		gradient: 'from-red-500/20 to-rose-500/20',
		accent: 'text-red-400',
		categoryId: 'rules'
	},
	{
		title: 'Planes',
		description: 'The multiverse.',
		href: '/compendium/planes',
		icon: Globe,
		gradient: 'from-blue-500/20 to-cyan-500/20',
		accent: 'text-blue-400',
		categoryId: 'rules'
	},
	{
		title: 'Rules',
		description: 'SRD Reference.',
		href: '/compendium/sections',
		icon: BookOpen,
		gradient: 'from-purple-500/20 to-fuchsia-500/20',
		accent: 'text-purple-400',
		categoryId: 'rules'
	}
];

export function getCardsByCategory(categoryId: string): CompendiumCard[] {
	return CARDS.filter((card) => card.categoryId === categoryId);
}
