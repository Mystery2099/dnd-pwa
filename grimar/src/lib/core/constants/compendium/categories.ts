import type { CompendiumCard, CompendiumCategory } from '$lib/core/types/compendium';
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
	BookOpen,
	GitBranch,
	GitFork,
	Dumbbell,
	Trophy,
	Award,
	Scale,
	Wand,
	Backpack,
	Layers,
	Crosshair,
	Zap,
	Ship,
	Bone
} from 'lucide-svelte';

export const CATEGORIES: CompendiumCategory[] = [
	{ id: 'primary', title: 'Primary Archives', gridCols: 'grid-cols-1 md:grid-cols-3' },
	{
		id: 'character',
		title: 'Character Options',
		gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
	},
	{
		id: 'abilities',
		title: 'Abilities & Proficiencies',
		gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
	},
	{
		id: 'magic',
		title: 'Magic & Elements',
		gridCols: 'grid-cols-1 sm:grid-cols-2'
	},
	{ id: 'armory', title: 'The Armory', gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' },
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
	{
		title: 'Subclasses',
		description: 'Specializations and traditions.',
		href: '/compendium/subclasses',
		icon: GitBranch,
		gradient: 'from-cyan-500/20 to-sky-500/20',
		accent: 'text-cyan-400',
		categoryId: 'character'
	},
	{
		title: 'Subraces',
		description: 'Variants and ethnic ties.',
		href: '/compendium/subraces',
		icon: GitFork,
		gradient: 'from-teal-500/20 to-emerald-500/20',
		accent: 'text-teal-400',
		categoryId: 'character'
	},
	{
		title: 'Traits',
		description: 'Racial abilities and gifts.',
		href: '/compendium/traits',
		icon: Sparkles,
		gradient: 'from-violet-500/20 to-purple-500/20',
		accent: 'text-violet-400',
		categoryId: 'character'
	},
	// Abilities & Proficiencies
	{
		title: 'Ability Scores',
		description: 'Core statistics.',
		href: '/compendium/ability-scores',
		icon: Dumbbell,
		gradient: 'from-orange-500/20 to-red-500/20',
		accent: 'text-orange-400',
		categoryId: 'abilities'
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
		title: 'Proficiencies',
		description: 'Weapon and armor skills.',
		href: '/compendium/proficiencies',
		icon: Award,
		gradient: 'from-emerald-500/20 to-green-500/20',
		accent: 'text-emerald-400',
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
	// Magic & Elements
	{
		title: 'Magic Schools',
		description: 'Arcane disciplines.',
		href: '/compendium/magic-schools',
		icon: Wand,
		gradient: 'from-fuchsia-500/20 to-pink-500/20',
		accent: 'text-fuchsia-400',
		categoryId: 'magic'
	},
	{
		title: 'Damage Types',
		description: 'Elemental forces.',
		href: '/compendium/damage-types',
		icon: Flame,
		gradient: 'from-orange-500/20 to-red-500/20',
		accent: 'text-orange-400',
		categoryId: 'magic'
	},
	// The Armory
	{
		title: 'Equipment',
		description: 'Gears and supplies.',
		href: '/compendium/equipment',
		icon: Backpack,
		gradient: 'from-amber-500/20 to-yellow-500/20',
		accent: 'text-amber-400',
		categoryId: 'armory'
	},
	{
		title: 'Equipment Categories',
		description: 'Item classifications.',
		href: '/compendium/equipment-categories',
		icon: Layers,
		gradient: 'from-stone-500/20 to-warm-gray-500/20',
		accent: 'text-stone-400',
		categoryId: 'armory'
	},
	{
		title: 'Weapon Properties',
		description: 'Weapon traits.',
		href: '/compendium/weapon-properties',
		icon: Crosshair,
		gradient: 'from-red-500/20 to-orange-500/20',
		accent: 'text-red-400',
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
		title: 'Rules',
		description: 'SRD Reference.',
		href: '/compendium/sections',
		icon: BookOpen,
		gradient: 'from-purple-500/20 to-fuchsia-500/20',
		accent: 'text-purple-400',
		categoryId: 'rules'
	},
	{
		title: 'Features',
		description: 'Class features.',
		href: '/compendium/features',
		icon: Zap,
		gradient: 'from-yellow-500/20 to-amber-500/20',
		accent: 'text-yellow-400',
		categoryId: 'rules'
	},
	{
		title: 'Vehicles',
		description: 'Mounts and transports.',
		href: '/compendium/vehicles',
		icon: Ship,
		gradient: 'from-cyan-500/20 to-blue-500/20',
		accent: 'text-cyan-400',
		categoryId: 'rules'
	},
	{
		title: 'Monster Types',
		description: 'Creature classifications.',
		href: '/compendium/monster-types',
		icon: Bone,
		gradient: 'from-green-500/20 to-emerald-500/20',
		accent: 'text-green-400',
		categoryId: 'rules'
	}
];

export function getCardsByCategory(categoryId: string): CompendiumCard[] {
	return CARDS.filter((card) => card.categoryId === categoryId);
}
