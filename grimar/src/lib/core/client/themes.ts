import type { ComponentType } from 'svelte';
import { Sparkles, Flame, Leaf, Droplets, CircleDot, Snowflake } from 'lucide-svelte';

// Theme configuration - SINGLE SOURCE OF TRUTH
// Add new themes here, and it will automatically:
// 1. Generate CSS custom properties
// 2. Populate theme store arrays
// 3. Update ThemeCardSelector with icons/gradients

export interface ThemeConfig {
	id: string;
	name: string;
	description: string;
	icon: ComponentType;
	gradient: string;
	accentClass: string;
	css: {
		bgCanvas: string;
		bgCard: string;
		bgOverlay: string;
		accent: string;
		accentGlow: string;
		gemRuby: string;
		gemSapphire: string;
		gemEmerald: string;
		gemAmethyst: string;
		gemTopaz: string;
		textPrimary: string;
		textSecondary: string;
		textMuted: string;
		border: string;
		borderHover: string;
	};
}

export const THEMES: ThemeConfig[] = [
	{
		id: 'amethyst',
		name: 'Amethyst',
		description: 'Deep purple magic',
		icon: Sparkles,
		gradient: 'from-purple-500/20 to-pink-500/20',
		accentClass: 'text-purple-400',
		css: {
			bgCanvas: '#0f172a',
			bgCard: 'rgba(30, 27, 75, 0.6)',
			bgOverlay: 'rgba(49, 46, 129, 0.8)',
			accent: '#a855f7',
			accentGlow: 'rgba(168, 85, 247, 0.5)',
			gemRuby: '#f472b6',
			gemSapphire: '#38bdf8',
			gemEmerald: '#4ade80',
			gemAmethyst: '#c084fc',
			gemTopaz: '#fbbf24',
			textPrimary: '#f8fafc',
			textSecondary: '#94a3b8',
			textMuted: '#64748b',
			border: 'rgba(255, 255, 255, 0.15)',
			borderHover: 'rgba(255, 255, 255, 0.3)'
		}
	},
	{
		id: 'arcane',
		name: 'Arcane',
		description: 'Golden Weave radiance',
		icon: Flame,
		gradient: 'from-amber-500/20 to-orange-500/20',
		accentClass: 'text-amber-400',
		css: {
			bgCanvas: '#451a03',
			bgCard: 'rgba(120, 53, 15, 0.7)',
			bgOverlay: 'rgba(146, 64, 14, 0.8)',
			accent: '#f59e0b',
			accentGlow: 'rgba(245, 158, 11, 0.6)',
			gemRuby: '#dc2626',
			gemSapphire: '#eab308',
			gemEmerald: '#d97706',
			gemAmethyst: '#fef3c7',
			gemTopaz: '#fde047',
			textPrimary: '#fef3c7',
			textSecondary: '#fcd34d',
			textMuted: '#d97706',
			border: 'rgba(245, 158, 11, 0.3)',
			borderHover: 'rgba(245, 158, 11, 0.5)'
		}
	},
	{
		id: 'nature',
		name: 'Nature',
		description: 'Verdant forest',
		icon: Leaf,
		gradient: 'from-emerald-500/20 to-green-500/20',
		accentClass: 'text-emerald-400',
		css: {
			bgCanvas: '#052e16',
			bgCard: 'rgba(19, 78, 74, 0.7)',
			bgOverlay: 'rgba(17, 94, 89, 0.8)',
			accent: '#10b981',
			accentGlow: 'rgba(16, 185, 129, 0.5)',
			gemRuby: '#fb7185',
			gemSapphire: '#2dd4bf',
			gemEmerald: '#4ade80',
			gemAmethyst: '#6ee7b7',
			gemTopaz: '#fbbf24',
			textPrimary: '#f0fdf4',
			textSecondary: '#86efac',
			textMuted: '#6ee7b7',
			border: 'rgba(16, 185, 129, 0.25)',
			borderHover: 'rgba(16, 185, 129, 0.4)'
		}
	},
	{
		id: 'fire',
		name: 'Fire',
		description: 'Blazing inferno',
		icon: Flame,
		gradient: 'from-red-500/20 to-orange-500/20',
		accentClass: 'text-red-400',
		css: {
			bgCanvas: '#450a0a',
			bgCard: 'rgba(127, 29, 29, 0.7)',
			bgOverlay: 'rgba(153, 27, 27, 0.8)',
			accent: '#f97316',
			accentGlow: 'rgba(249, 115, 22, 0.6)',
			gemRuby: '#ef4444',
			gemSapphire: '#f97316',
			gemEmerald: '#facc15',
			gemAmethyst: '#fde047',
			gemTopaz: '#fef3c7',
			textPrimary: '#fef2f2',
			textSecondary: '#fca5a5',
			textMuted: '#f87171',
			border: 'rgba(249, 115, 22, 0.3)',
			borderHover: 'rgba(249, 115, 22, 0.5)'
		}
	},
	{
		id: 'ice',
		name: 'Ice',
		description: 'Crystalline frost',
		icon: Snowflake,
		gradient: 'from-cyan-500/20 to-blue-500/20',
		accentClass: 'text-cyan-400',
		css: {
			bgCanvas: '#0c4a6e',
			bgCard: 'rgba(14, 116, 144, 0.7)',
			bgOverlay: 'rgba(21, 94, 117, 0.8)',
			accent: '#06b6d4',
			accentGlow: 'rgba(6, 182, 212, 0.5)',
			gemRuby: '#f9a8d4',
			gemSapphire: '#7dd3fc',
			gemEmerald: '#22d3ee',
			gemAmethyst: '#e0f2fe',
			gemTopaz: '#cbd5e1',
			textPrimary: '#ecfeff',
			textSecondary: '#7dd3fc',
			textMuted: '#38bdf8',
			border: 'rgba(6, 182, 212, 0.25)',
			borderHover: 'rgba(6, 182, 212, 0.4)'
		}
	},
	{
		id: 'ocean',
		name: 'Ocean',
		description: 'Abyssal depths',
		icon: Droplets,
		gradient: 'from-cyan-500/20 to-teal-500/20',
		accentClass: 'text-cyan-400',
		css: {
			bgCanvas: '#042f2e',
			bgCard: 'rgba(13, 148, 136, 0.6)',
			bgOverlay: 'rgba(17, 94, 89, 0.8)',
			accent: '#14b8a6',
			accentGlow: 'rgba(20, 184, 166, 0.5)',
			gemRuby: '#fb7185',
			gemSapphire: '#1e3a8a',
			gemEmerald: '#0d9488',
			gemAmethyst: '#5eead4',
			gemTopaz: '#e0f2f1',
			textPrimary: '#f0fdfa',
			textSecondary: '#5eead4',
			textMuted: '#2dd4bf',
			border: 'rgba(20, 184, 166, 0.25)',
			borderHover: 'rgba(20, 184, 166, 0.4)'
		}
	},
	{
		id: 'void',
		name: 'Void',
		description: 'Cosmic darkness',
		icon: CircleDot,
		gradient: 'from-violet-500/20 to-gray-500/20',
		accentClass: 'text-violet-400',
		css: {
			bgCanvas: '#000000',
			bgCard: 'rgba(20, 20, 30, 0.8)',
			bgOverlay: 'rgba(30, 25, 45, 0.85)',
			accent: '#a855f7',
			accentGlow: 'rgba(168, 85, 247, 0.6)',
			gemRuby: '#7f1d1d',
			gemSapphire: '#4c1d95',
			gemEmerald: '#111827',
			gemAmethyst: '#8b5cf6',
			gemTopaz: '#f0f9ff',
			textPrimary: '#f5f5f5',
			textSecondary: '#c4b5fd',
			textMuted: '#8b5cf6',
			border: 'rgba(139, 92, 246, 0.25)',
			borderHover: 'rgba(139, 92, 246, 0.4)'
		}
	}
] as const;

// Generate CSS custom properties for a theme
export function generateThemeCSS(theme: ThemeConfig): string {
	return `
	--theme-bg-canvas: ${theme.css.bgCanvas};
	--theme-bg-card: ${theme.css.bgCard};
	--theme-bg-overlay: ${theme.css.bgOverlay};
	--theme-accent: ${theme.css.accent};
	--theme-accent-glow: ${theme.css.accentGlow};
	--theme-accent-rgb: ${
		theme.css.accent
			.replace('#', '')
			.match(/.{2}/g)
			?.map((h) => parseInt(h, 16))
			.join(', ') || '0,0,0'
	};
	--theme-bg-overlay-rgb: ${theme.css.bgOverlay.match(/\d+/g)?.slice(0, 3).join(', ') || '0,0,0'};
	--theme-gem-ruby: ${theme.css.gemRuby};
	--theme-gem-sapphire: ${theme.css.gemSapphire};
	--theme-gem-emerald: ${theme.css.gemEmerald};
	--theme-gem-amethyst: ${theme.css.gemAmethyst};
	--theme-gem-topaz: ${theme.css.gemTopaz};
	--theme-text-primary: ${theme.css.textPrimary};
	--theme-text-secondary: ${theme.css.textSecondary};
	--theme-text-muted: ${theme.css.textMuted};
	--theme-border: ${theme.css.border};
	--theme-border-hover: ${theme.css.borderHover};`;
}

// Generate all theme CSS
export function generateAllThemesCSS(): string {
	return THEMES.map((t) => `[data-theme='${t.id}'] { ${generateThemeCSS(t)} }`).join('\n');
}

// Helper types for components
export type ThemeId = (typeof THEMES)[number]['id'];
export type ThemeInfo = (typeof THEMES)[number];
