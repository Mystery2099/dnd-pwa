import type { ComponentType } from 'svelte';
import { Sparkles, Flame, Leaf, Droplets, CircleDot, Snowflake } from 'lucide-svelte';

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
	{ id: 'amethyst', name: 'Amethyst', description: 'Deep purple magic', icon: Sparkles },
	{ id: 'arcane', name: 'Arcane', description: 'Golden Weave radiance', icon: Flame },
	{ id: 'nature', name: 'Nature', description: 'Verdant forest', icon: Leaf },
	{ id: 'fire', name: 'Fire', description: 'Blazing inferno', icon: Flame },
	{ id: 'ice', name: 'Ice', description: 'Crystalline frost', icon: Snowflake },
	{ id: 'ocean', name: 'Ocean', description: 'Abyssal depths', icon: Droplets },
	{ id: 'void', name: 'Void', description: 'Cosmic darkness', icon: CircleDot }
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
	void: 'from-violet-500/20 to-gray-500/20'
};

// Helper to get accent class for a theme
export function getThemeAccentClass(themeId: string): string {
	const map: Record<string, string> = {
		amethyst: 'text-purple-400',
		arcane: 'text-amber-400',
		nature: 'text-emerald-400',
		fire: 'text-red-400',
		ice: 'text-cyan-400',
		ocean: 'text-cyan-400',
		void: 'text-violet-400'
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
