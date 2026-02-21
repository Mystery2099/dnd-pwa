import type { CompendiumType } from '$lib/core/types/compendium';

export interface CategoryCardConfig {
	title: string;
	description: string;
	href: string;
	icon: string;
	gradient: string;
	accent: string;
	types: CompendiumType[];
}

export interface Category {
	id: string;
	title: string;
	gridCols: string;
}

export const CATEGORIES: Category[] = [
	{ id: 'core', title: 'Core Rules', gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' },
	{ id: 'characters', title: 'Characters', gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' },
	{ id: 'equipment', title: 'Equipment', gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' },
	{ id: 'monsters', title: 'Monsters & Encounters', gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' },
	{ id: 'magic', title: 'Magic', gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' },
	{ id: 'reference', title: 'Reference', gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' }
];

const ALL_CARDS: CategoryCardConfig[] = [
	// Core Rules
	{
		title: 'Rules',
		description: 'Core game mechanics and rulings',
		href: 'rules',
		icon: 'book',
		gradient: 'from-amber-500 to-orange-600',
		accent: 'amber',
		types: ['rules']
	},
	{
		title: 'Feats',
		description: 'Special abilities for characters',
		href: 'feats',
		icon: 'star',
		gradient: 'from-yellow-500 to-amber-600',
		accent: 'yellow',
		types: ['feats']
	},
	// Characters
	{
		title: 'Classes',
		description: 'Character classes and archetypes',
		href: 'classes',
		icon: 'crown',
		gradient: 'from-purple-500 to-indigo-600',
		accent: 'purple',
		types: ['classes']
	},
	{
		title: 'Species',
		description: 'Playable races and ancestries',
		href: 'species',
		icon: 'users',
		gradient: 'from-emerald-500 to-teal-600',
		accent: 'emerald',
		types: ['species']
	},
	{
		title: 'Backgrounds',
		description: 'Character backgrounds and histories',
		href: 'backgrounds',
		icon: 'scroll',
		gradient: 'from-blue-500 to-cyan-600',
		accent: 'blue',
		types: ['backgrounds']
	},
	// Equipment
	{
		title: 'Weapons',
		description: 'Melee and ranged weapons',
		href: 'weapons',
		icon: 'sword',
		gradient: 'from-red-500 to-rose-600',
		accent: 'red',
		types: ['weapons']
	},
	{
		title: 'Armor',
		description: 'Protective gear and shields',
		href: 'armor',
		icon: 'shield',
		gradient: 'from-slate-500 to-zinc-600',
		accent: 'slate',
		types: ['armor']
	},
	{
		title: 'Magic Items',
		description: 'Enchanted items and artifacts',
		href: 'magicitems',
		icon: 'sparkles',
		gradient: 'from-violet-500 to-purple-600',
		accent: 'violet',
		types: ['magicitems']
	},
	// Monsters
	{
		title: 'Creatures',
		description: 'Monsters, NPCs, and beasts',
		href: 'creatures',
		icon: 'dragon',
		gradient: 'from-red-600 to-rose-700',
		accent: 'red',
		types: ['creatures']
	},
	{
		title: 'Environments',
		description: 'Terrain and encounter locations',
		href: 'environments',
		icon: 'map',
		gradient: 'from-green-600 to-emerald-700',
		accent: 'green',
		types: ['environments']
	},
	// Magic
	{
		title: 'Spells',
		description: 'Arcane and divine magic',
		href: 'spells',
		icon: 'zap',
		gradient: 'from-indigo-500 to-violet-600',
		accent: 'indigo',
		types: ['spells']
	},
	// Reference
	{
		title: 'Conditions',
		description: 'Status effects and conditions',
		href: 'conditions',
		icon: 'alert-circle',
		gradient: 'from-orange-500 to-amber-600',
		accent: 'orange',
		types: ['conditions']
	},
	{
		title: 'Skills',
		description: 'Character skills and proficiencies',
		href: 'skills',
		icon: 'award',
		gradient: 'from-teal-500 to-cyan-600',
		accent: 'teal',
		types: ['skills']
	},
	{
		title: 'Languages',
		description: 'Languages and communication',
		href: 'languages',
		icon: 'message-circle',
		gradient: 'from-cyan-500 to-blue-600',
		accent: 'cyan',
		types: ['languages']
	},
	{
		title: 'Alignments',
		description: 'Moral and ethical alignments',
		href: 'alignments',
		icon: 'compass',
		gradient: 'from-pink-500 to-rose-600',
		accent: 'pink',
		types: ['alignments']
	}
];

const CATEGORY_MAP: Record<string, string[]> = {
	core: ['rules', 'feats'],
	characters: ['classes', 'species', 'backgrounds'],
	equipment: ['weapons', 'armor', 'magicitems'],
	monsters: ['creatures', 'environments'],
	magic: ['spells'],
	reference: ['conditions', 'skills', 'languages', 'alignments']
};

export function getCardsByCategory(categoryId: string): CategoryCardConfig[] {
	const hrefs = CATEGORY_MAP[categoryId] || [];
	return ALL_CARDS.filter(card => hrefs.includes(card.href));
}
