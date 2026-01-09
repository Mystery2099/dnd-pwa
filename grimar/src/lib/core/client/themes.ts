import type { ComponentType } from 'svelte';
import {
	Sparkles,
	Flame,
	Leaf,
	Droplets,
	CircleDot,
	Snowflake,
	Palmtree,
	Skull,
	Heart,
	Sun,
	Gem
} from 'lucide-svelte';

// Lightweight theme registry - SINGLE SOURCE OF TRUTH FOR METADATA
// Colors are defined in layout.css via CSS custom properties
// When adding a new theme, update layout.css with color values

export interface ThemeMeta {
	id: string;
	name: string;
	description: string;
	icon: ComponentType;
}

export const THEMES = [
	{ id: 'amethyst', name: 'Amethyst', description: 'Deep mystical purple', icon: Sparkles },
	{ id: 'arcane', name: 'Arcane', description: 'Gold runes on dark leather', icon: Flame },
	{ id: 'nature', name: 'Nature', description: 'Bioluminescence in the dark', icon: Leaf },
	{ id: 'fire', name: 'Fire', description: 'Magma flowing over cold stone', icon: Flame },
	{ id: 'ice', name: 'Ice', description: 'Deep freeze', icon: Snowflake },
	{ id: 'ocean', name: 'Ocean', description: 'Abyssal depths', icon: Droplets },
	{ id: 'void', name: 'Void', description: 'Cosmic emptiness', icon: CircleDot },
	{ id: 'beach', name: 'Beach', description: 'Sandy shores', icon: Palmtree },
	{ id: 'necropolis', name: 'Necropolis', description: 'Bone & Spirit', icon: Skull },
	{ id: 'charmed', name: 'Charmed', description: 'Rose Quartz & Love Potion', icon: Heart },
	{ id: 'divine', name: 'Divine', description: 'Celestial Bronze', icon: Sun },
	{ id: 'underdark', name: 'Underdark', description: 'Deep Slate & Spore', icon: Gem }
] as const;

// Theme styling helpers - derived from CSS custom properties
// These are read dynamically at runtime based on the current data-theme attribute

export type ThemeId = (typeof THEMES)[number]['id'];
export type ThemeInfo = (typeof THEMES)[number];

// Theme gradients for ThemeCardSelector - visual only, not functional
export const THEME_GRADIENTS: Record<ThemeId, string> = {
	amethyst: 'from-purple-500/20 to-pink-500/20',
	arcane: 'from-amber-500/20 to-orange-500/20',
	nature: 'from-emerald-500/20 to-green-500/20',
	fire: 'from-red-500/20 to-orange-500/20',
	ice: 'from-cyan-500/20 to-blue-500/20',
	ocean: 'from-cyan-500/20 to-teal-500/20',
	void: 'from-violet-500/20 to-gray-500/20',
	beach: 'from-amber-500/20 to-cyan-500/20',
	necropolis: 'from-lime-500/20 to-gray-600/20',
	charmed: 'from-pink-500/20 to-rose-500/20',
	divine: 'from-yellow-500/20 to-amber-500/20',
	underdark: 'from-indigo-500/20 to-violet-500/20'
};

// Helper to get accent class for a theme
export function getThemeAccentClass(themeId: string): string {
	const map: Record<string, string> = {
		amethyst: 'text-purple-400',
		arcane: 'text-amber-400',
		nature: 'text-emerald-400',
		fire: 'text-red-400',
		ice: 'text-cyan-400',
		ocean: 'text-teal-400',
		void: 'text-violet-400',
		beach: 'text-cyan-400',
		necropolis: 'text-lime-400',
		charmed: 'text-pink-400',
		divine: 'text-yellow-400',
		underdark: 'text-indigo-400'
	};
	return map[themeId] || 'text-purple-400';
}

// Derived options for Select components
export const THEME_OPTIONS = THEMES.map((t) => ({
	value: t.id,
	label: t.name,
	description: t.description,
	icon: t.id
}));
