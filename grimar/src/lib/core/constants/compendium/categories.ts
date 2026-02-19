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

export const CARDS: CompendiumCard[] = [
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
		title: 'Creatures',
		description: 'Beasts and planar entities.',
		href: '/compendium/creatures',
		icon: Skull,
		gradient: 'from-emerald-500/20 to-teal-500/20',
		accent: 'text-emerald-400',
		categoryId: 'primary'
	},
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
		title: 'Class Features',
		description: 'Class abilities and features.',
		href: '/compendium/classfeatures',
		icon: Sparkles,
		gradient: 'from-blue-500/20 to-indigo-500/20',
		accent: 'text-blue-400',
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
	{
		title: 'Races',
		description: 'Species and lineages.',
		href: '/compendium/races',
		icon: Users,
		gradient: 'from-lime-500/20 to-green-500/20',
		accent: 'text-lime-400',
		categoryId: 'character'
	},
	{
		title: 'Magic Items',
		description: 'Enchanted objects.',
		href: '/compendium/items',
		icon: Package,
		gradient: 'from-purple-500/20 to-pink-500/20',
		accent: 'text-purple-400',
		categoryId: 'equipment'
	},
	{
		title: 'Weapons',
		description: 'Arms for combat.',
		href: '/compendium/weapons',
		icon: Swords,
		gradient: 'from-slate-500/20 to-gray-500/20',
		accent: 'text-slate-400',
		categoryId: 'equipment'
	},
	{
		title: 'Armor',
		description: 'Protective gear.',
		href: '/compendium/armor',
		icon: Shield,
		gradient: 'from-cyan-500/20 to-blue-500/20',
		accent: 'text-cyan-400',
		categoryId: 'equipment'
	},
	{
		title: 'Skills',
		description: 'Proficiency areas.',
		href: '/compendium/skills',
		icon: Trophy,
		gradient: 'from-amber-500/20 to-yellow-500/20',
		accent: 'text-amber-400',
		categoryId: 'abilities'
	},
	{
		title: 'Languages',
		description: 'Known tongues.',
		href: '/compendium/languages',
		icon: Globe,
		gradient: 'from-cyan-500/20 to-teal-500/20',
		accent: 'text-cyan-400',
		categoryId: 'abilities'
	},
	{
		title: 'Alignments',
		description: 'Moral and ethical codes.',
		href: '/compendium/alignments',
		icon: Scale,
		gradient: 'from-indigo-500/20 to-violet-500/20',
		accent: 'text-indigo-400',
		categoryId: 'abilities'
	},
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
		title: 'Damage Types',
		description: 'Forms of harm.',
		href: '/compendium/damagetypes',
		icon: Flame,
		gradient: 'from-orange-500/20 to-red-500/20',
		accent: 'text-orange-400',
		categoryId: 'rules'
	},
	{
		title: 'Spell Schools',
		description: 'Schools of magic.',
		href: '/compendium/spellschools',
		icon: Sparkles,
		gradient: 'from-violet-500/20 to-purple-500/20',
		accent: 'text-violet-400',
		categoryId: 'rules'
	},
	{
		title: 'Creature Types',
		description: 'Monster classifications.',
		href: '/compendium/creaturetypes',
		icon: Skull,
		gradient: 'from-emerald-500/20 to-green-500/20',
		accent: 'text-emerald-400',
		categoryId: 'rules'
	},
	{
		title: 'Rules',
		description: 'Game mechanics.',
		href: '/compendium/rules',
		icon: Scroll,
		gradient: 'from-gray-500/20 to-slate-500/20',
		accent: 'text-gray-400',
		categoryId: 'rules'
	}
];

export function getCardsByCategory(categoryId: string): CompendiumCard[] {
	return CARDS.filter((card) => card.categoryId === categoryId);
}
