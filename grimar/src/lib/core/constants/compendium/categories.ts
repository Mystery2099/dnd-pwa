import type { CompendiumCard, CompendiumCategory } from '$lib/core/types/compendium';
import {
	Flame,
	Skull,
	Sparkles,
	Shield,
	Users,
	Scroll,
	Medal,
	Dumbbell,
	Trophy,
	Activity,
	Globe,
	Scale,
	Wand,
	Layers,
	Crosshair,
	BookOpen,
	Bone,
	Box,
	Gem,
	Book,
	ArrowUpDown,
	FileText,
	Copyright,
	Building,
	Gamepad2,
	Library,
	ShoppingCart,
	Map,
	Image
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
		href: '/compendium/creatures',
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
		href: '/compendium/species',
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
	// Abilities & Proficiencies
	{
		title: 'Ability Scores',
		description: 'Core statistics.',
		href: '/compendium/abilities',
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
		href: '/compendium/spellschools',
		icon: Wand,
		gradient: 'from-fuchsia-500/20 to-pink-500/20',
		accent: 'text-fuchsia-400',
		categoryId: 'magic'
	},
	{
		title: 'Damage Types',
		description: 'Elemental forces.',
		href: '/compendium/damagetypes',
		icon: Flame,
		gradient: 'from-orange-500/20 to-red-500/20',
		accent: 'text-orange-400',
		categoryId: 'magic'
	},
	// The Armory
	{
		title: 'Equipment Categories',
		description: 'Item classifications.',
		href: '/compendium/itemcategories',
		icon: Layers,
		gradient: 'from-stone-500/20 to-warm-gray-500/20',
		accent: 'text-stone-400',
		categoryId: 'armory'
	},
	{
		title: 'Item Sets',
		description: 'Collectible groupings.',
		href: '/compendium/itemsets',
		icon: Box,
		gradient: 'from-amber-500/20 to-yellow-500/20',
		accent: 'text-amber-400',
		categoryId: 'armory'
	},
	{
		title: 'Weapon Properties',
		description: 'Weapon traits.',
		href: '/compendium/weaponproperties',
		icon: Crosshair,
		gradient: 'from-red-500/20 to-orange-500/20',
		accent: 'text-red-400',
		categoryId: 'armory'
	},
	{
		title: 'Rarities',
		description: 'Item rarity tiers.',
		href: '/compendium/itemrarities',
		icon: Gem,
		gradient: 'from-purple-500/20 to-fuchsia-500/20',
		accent: 'text-purple-400',
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
		href: '/compendium/rules',
		icon: BookOpen,
		gradient: 'from-purple-500/20 to-fuchsia-500/20',
		accent: 'text-purple-400',
		categoryId: 'rules'
	},
	{
		title: 'Rule Sections',
		description: 'Rule subdivisions.',
		href: '/compendium/rulesections',
		icon: Book,
		gradient: 'from-violet-500/20 to-purple-500/20',
		accent: 'text-violet-400',
		categoryId: 'rules'
	},
	{
		title: 'Monster Types',
		description: 'Creature classifications.',
		href: '/compendium/creaturetypes',
		icon: Bone,
		gradient: 'from-green-500/20 to-emerald-500/20',
		accent: 'text-green-400',
		categoryId: 'rules'
	},
	{
		title: 'Planes',
		description: 'Environments and realms.',
		href: '/compendium/environments',
		icon: Map,
		gradient: 'from-cyan-500/20 to-sky-500/20',
		accent: 'text-cyan-400',
		categoryId: 'rules'
	},
	{
		title: 'Sizes',
		description: 'Creature size categories.',
		href: '/compendium/sizes',
		icon: ArrowUpDown,
		gradient: 'from-slate-500/20 to-gray-500/20',
		accent: 'text-slate-400',
		categoryId: 'rules'
	},
	// Open5e Data
	{
		title: 'Documents',
		description: 'Source documents.',
		href: '/compendium/documents',
		icon: FileText,
		gradient: 'from-amber-500/20 to-orange-500/20',
		accent: 'text-amber-400',
		categoryId: 'data'
	},
	{
		title: 'Licenses',
		description: 'Content licenses.',
		href: '/compendium/licenses',
		icon: Copyright,
		gradient: 'from-gray-500/20 to-slate-500/20',
		accent: 'text-gray-400',
		categoryId: 'data'
	},
	{
		title: 'Publishers',
		description: 'Content publishers.',
		href: '/compendium/publishers',
		icon: Building,
		gradient: 'from-emerald-500/20 to-green-500/20',
		accent: 'text-emerald-400',
		categoryId: 'data'
	},
	{
		title: 'Game Systems',
		description: 'Rule system variants.',
		href: '/compendium/gamesystems',
		icon: Gamepad2,
		gradient: 'from-blue-500/20 to-indigo-500/20',
		accent: 'text-blue-400',
		categoryId: 'data'
	},
	{
		title: 'Rule Sets',
		description: 'Rule groupings.',
		href: '/compendium/rulesets',
		icon: Library,
		gradient: 'from-rose-500/20 to-pink-500/20',
		accent: 'text-rose-400',
		categoryId: 'data'
	},
	{
		title: 'Creature Sets',
		description: 'Monster groupings.',
		href: '/compendium/creaturesets',
		icon: Users,
		gradient: 'from-teal-500/20 to-cyan-500/20',
		accent: 'text-teal-400',
		categoryId: 'data'
	},
	{
		title: 'Images',
		description: 'Visual references.',
		href: '/compendium/images',
		icon: Image,
		gradient: 'from-pink-500/20 to-rose-500/20',
		accent: 'text-pink-400',
		categoryId: 'data'
	},
	{
		title: 'Services',
		description: 'Commodities and services.',
		href: '/compendium/services',
		icon: ShoppingCart,
		gradient: 'from-yellow-500/20 to-amber-500/20',
		accent: 'text-yellow-400',
		categoryId: 'data'
	}
];

export function getCardsByCategory(categoryId: string): CompendiumCard[] {
	return CARDS.filter((card) => card.categoryId === categoryId);
}
