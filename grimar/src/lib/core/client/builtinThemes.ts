import type { ThemeConfig } from '$lib/core/types/theme';
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

export const BUILTIN_THEMES: ThemeConfig[] = [
	{
		id: 'amethyst',
		name: 'Amethyst',
		description: 'Deep mystical purple',
		source: 'builtin',
		icon: Sparkles,
		colors: {
			bgCanvas: '#0f172a',
			bgCard: 'rgba(30, 27, 75, 0.6)',
			bgOverlay: 'rgba(49, 46, 129, 0.8)',
			accent: '#a855f7',
			accentGlow: 'rgba(168, 85, 247, 0.5)',
			accentRgb: '168, 85, 247',
			bgOverlayRgb: '49, 46, 129',
			textPrimary: '#f8fafc',
			textSecondary: '#94a3b8',
			textMuted: '#64748b',
			textInverted: '#ffffff',
			border: 'rgba(255, 255, 255, 0.15)',
			borderHover: 'rgba(255, 255, 255, 0.3)',
			shadow: 'rgba(0, 0, 0, 0.5)',
			overlayLight: 'rgba(255, 255, 255, 0.1)',
			overlayDark: 'rgba(0, 0, 0, 0.3)',
			effectUrl: ''
		},
		typography: {
			display: 'Quicksand, system-ui, sans-serif',
			body: 'Inter, system-ui, sans-serif'
		},
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 150, slow: 300 }
		},
		visualEffects: { noiseOpacity: 0.03, borderSeparator: 'none' }
	},
	{
		id: 'arcane',
		name: 'Arcane',
		description: 'Gold runes on dark leather',
		source: 'builtin',
		icon: Flame,
		colors: {
			bgCanvas: '#271c19',
			bgCard: 'rgba(66, 32, 6, 0.5)',
			bgOverlay: 'rgba(120, 53, 15, 0.6)',
			accent: '#fbbf24',
			accentGlow: 'rgba(251, 191, 36, 0.5)',
			accentRgb: '251, 191, 36',
			bgOverlayRgb: '120, 53, 15',
			textPrimary: '#fef3c7',
			textSecondary: '#fcd34d',
			textMuted: '#d97706',
			textInverted: '#fef3c7',
			border: 'rgba(251, 191, 36, 0.2)',
			borderHover: 'rgba(251, 191, 36, 0.5)',
			shadow: 'rgba(0, 0, 0, 0.6)',
			overlayLight: 'rgba(254, 243, 199, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.4)',
			effectUrl: ''
		},
		typography: { display: 'Cinzel, Georgia, serif', body: 'Cormorant Garamond, Georgia, serif' },
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 200, slow: 400 }
		},
		visualEffects: {
			noiseOpacity: 0.02,
			borderSeparator: 'linear-gradient(90deg, transparent, var(--theme-accent), transparent)'
		}
	},
	{
		id: 'nature',
		name: 'Nature',
		description: 'Bioluminescence in the dark',
		source: 'builtin',
		icon: Leaf,
		colors: {
			bgCanvas: '#022c22',
			bgCard: 'rgba(6, 78, 59, 0.5)',
			bgOverlay: 'rgba(6, 95, 70, 0.7)',
			accent: '#4ade80',
			accentGlow: 'rgba(74, 222, 128, 0.5)',
			accentRgb: '74, 222, 128',
			bgOverlayRgb: '6, 95, 70',
			textPrimary: '#f0fdf4',
			textSecondary: '#86efac',
			textMuted: '#34d399',
			textInverted: '#f0fdf4',
			border: 'rgba(134, 239, 172, 0.15)',
			borderHover: 'rgba(74, 222, 128, 0.4)',
			shadow: 'rgba(0, 0, 0, 0.5)',
			overlayLight: 'rgba(255, 255, 255, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.4)',
			effectUrl: ''
		},
		typography: {
			display: 'DM Serif Display, Georgia, serif',
			body: 'DM Sans, system-ui, sans-serif'
		},
		animation: {
			ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			duration: { fast: 200, slow: 500 }
		},
		visualEffects: { noiseOpacity: 0.025, borderSeparator: 'none' }
	},
	{
		id: 'fire',
		name: 'Fire',
		description: 'Magma flowing over cold stone',
		source: 'builtin',
		icon: Flame,
		colors: {
			bgCanvas: '#1c1917',
			bgCard: 'rgba(41, 37, 36, 0.6)',
			bgOverlay: 'rgba(68, 64, 60, 0.7)',
			accent: '#f97316',
			accentGlow: 'rgba(249, 115, 22, 0.5)',
			accentRgb: '249, 115, 22',
			bgOverlayRgb: '68, 64, 60',
			textPrimary: '#fff7ed',
			textSecondary: '#fdba74',
			textMuted: '#a8a29e',
			textInverted: '#fff7ed',
			border: 'rgba(253, 186, 116, 0.15)',
			borderHover: 'rgba(249, 115, 22, 0.4)',
			shadow: 'rgba(0, 0, 0, 0.5)',
			overlayLight: 'rgba(255, 255, 255, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.4)',
			effectUrl: ''
		},
		typography: { display: 'Teko, system-ui, sans-serif', body: 'Rajdhani, system-ui, sans-serif' },
		animation: {
			ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			duration: { fast: 100, slow: 250 }
		},
		visualEffects: {
			noiseOpacity: 0.04,
			borderSeparator: 'linear-gradient(90deg, transparent, var(--theme-accent), transparent)'
		}
	},
	{
		id: 'ice',
		name: 'Ice',
		description: 'Deep freeze',
		source: 'builtin',
		icon: Snowflake,
		colors: {
			bgCanvas: '#082f49',
			bgCard: 'rgba(12, 74, 110, 0.6)',
			bgOverlay: 'rgba(7, 89, 133, 0.7)',
			accent: '#67e8f9',
			accentGlow: 'rgba(103, 232, 249, 0.5)',
			accentRgb: '103, 232, 249',
			bgOverlayRgb: '7, 89, 133',
			textPrimary: '#f0f9ff',
			textSecondary: '#bae6fd',
			textMuted: '#38bdf8',
			textInverted: '#f0f9ff',
			border: 'rgba(186, 230, 253, 0.15)',
			borderHover: 'rgba(103, 232, 249, 0.5)',
			shadow: 'rgba(0, 0, 0, 0.5)',
			overlayLight: 'rgba(255, 255, 255, 0.1)',
			overlayDark: 'rgba(0, 0, 0, 0.4)',
			effectUrl: ''
		},
		typography: { display: 'Outfit, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 120, slow: 280 }
		},
		visualEffects: { noiseOpacity: 0.015, borderSeparator: 'none' }
	},
	{
		id: 'ocean',
		name: 'Ocean',
		description: 'Abyssal depths',
		source: 'builtin',
		icon: Droplets,
		colors: {
			bgCanvas: '#020617',
			bgCard: 'rgba(30, 41, 59, 0.6)',
			bgOverlay: 'rgba(15, 23, 42, 0.8)',
			accent: '#14b8a6',
			accentGlow: 'rgba(20, 184, 166, 0.5)',
			accentRgb: '20, 184, 166',
			bgOverlayRgb: '15, 23, 42',
			textPrimary: '#f0fdfa',
			textSecondary: '#5eead4',
			textMuted: '#0f766e',
			textInverted: '#f0fdfa',
			border: 'rgba(94, 234, 212, 0.1)',
			borderHover: 'rgba(20, 184, 166, 0.4)',
			shadow: 'rgba(0, 0, 0, 0.5)',
			overlayLight: 'rgba(255, 255, 255, 0.06)',
			overlayDark: 'rgba(0, 0, 0, 0.5)',
			effectUrl: ''
		},
		typography: {
			display: 'Montserrat, system-ui, sans-serif',
			body: 'Inter, system-ui, sans-serif'
		},
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 180, slow: 350 }
		},
		visualEffects: { noiseOpacity: 0.02, borderSeparator: 'none' }
	},
	{
		id: 'void',
		name: 'Void',
		description: 'Cosmic emptiness',
		source: 'builtin',
		icon: CircleDot,
		colors: {
			bgCanvas: '#0a0a0a',
			bgCard: 'rgba(23, 23, 23, 0.8)',
			bgOverlay: 'rgba(38, 38, 38, 0.8)',
			accent: '#c084fc',
			accentGlow: 'rgba(192, 132, 252, 0.6)',
			accentRgb: '192, 132, 252',
			bgOverlayRgb: '38, 38, 38',
			textPrimary: '#fafafa',
			textSecondary: '#e9d5ff',
			textMuted: '#a855f7',
			textInverted: '#fafafa',
			border: 'rgba(192, 132, 252, 0.15)',
			borderHover: 'rgba(192, 132, 252, 0.4)',
			shadow: 'rgba(0, 0, 0, 0.6)',
			overlayLight: 'rgba(255, 255, 255, 0.06)',
			overlayDark: 'rgba(0, 0, 0, 0.5)',
			effectUrl: ''
		},
		typography: {
			display: 'Space Grotesk, system-ui, sans-serif',
			body: 'Inter, system-ui, sans-serif'
		},
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 200, slow: 500 }
		},
		visualEffects: { noiseOpacity: 0.035, borderSeparator: 'none' }
	},
	{
		id: 'beach',
		name: 'Beach',
		description: 'Sandy shores',
		source: 'builtin',
		icon: Palmtree,
		colors: {
			bgCanvas: '#292524',
			bgCard: 'rgba(69, 58, 43, 0.6)',
			bgOverlay: 'rgba(87, 76, 60, 0.7)',
			accent: '#22d3ee',
			accentGlow: 'rgba(34, 211, 238, 0.5)',
			accentRgb: '34, 211, 238',
			bgOverlayRgb: '87, 76, 60',
			textPrimary: '#fff7ed',
			textSecondary: '#fed7aa',
			textMuted: '#d6d3d1',
			textInverted: '#fff7ed',
			border: 'rgba(254, 215, 170, 0.15)',
			borderHover: 'rgba(34, 211, 238, 0.4)',
			shadow: 'rgba(0, 0, 0, 0.5)',
			overlayLight: 'rgba(255, 255, 255, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.4)',
			effectUrl: ''
		},
		typography: {
			display: 'Bebas Neue, system-ui, sans-serif',
			body: 'Nunito, system-ui, sans-serif'
		},
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 200, slow: 400 }
		},
		visualEffects: { noiseOpacity: 0.015, borderSeparator: 'none' }
	},
	{
		id: 'necropolis',
		name: 'Necropolis',
		description: 'Bone & Spirit',
		source: 'builtin',
		icon: Skull,
		colors: {
			bgCanvas: '#1c1917',
			bgCard: 'rgba(28, 25, 23, 0.8)',
			bgOverlay: 'rgba(41, 37, 36, 0.8)',
			accent: '#84cc16',
			accentGlow: 'rgba(132, 204, 22, 0.5)',
			accentRgb: '132, 204, 22',
			bgOverlayRgb: '41, 37, 36',
			textPrimary: '#e5e5e5',
			textSecondary: '#a3a3a3',
			textMuted: '#525252',
			textInverted: '#e5e5e5',
			border: 'rgba(82, 82, 82, 0.3)',
			borderHover: 'rgba(132, 204, 22, 0.5)',
			shadow: 'rgba(0, 0, 0, 0.6)',
			overlayLight: 'rgba(255, 255, 255, 0.05)',
			overlayDark: 'rgba(0, 0, 0, 0.5)',
			effectUrl: ''
		},
		typography: { display: 'Crimson Text, Georgia, serif', body: 'Inter, system-ui, sans-serif' },
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 250, slow: 600 }
		},
		visualEffects: { noiseOpacity: 0.04, borderSeparator: 'none' }
	},
	{
		id: 'charmed',
		name: 'Charmed',
		description: 'Rose Quartz & Love Potion',
		source: 'builtin',
		icon: Heart,
		colors: {
			bgCanvas: '#4a044e',
			bgCard: 'rgba(131, 24, 67, 0.5)',
			bgOverlay: 'rgba(80, 7, 36, 0.8)',
			accent: '#f472b6',
			accentGlow: 'rgba(244, 114, 182, 0.5)',
			accentRgb: '244, 114, 182',
			bgOverlayRgb: '80, 7, 36',
			textPrimary: '#fff1f2',
			textSecondary: '#fda4af',
			textMuted: '#be123c',
			textInverted: '#fff1f2',
			border: 'rgba(244, 114, 182, 0.2)',
			borderHover: 'rgba(244, 114, 182, 0.5)',
			shadow: 'rgba(80, 7, 36, 0.6)',
			overlayLight: 'rgba(255, 255, 255, 0.15)',
			overlayDark: 'rgba(0, 0, 0, 0.4)',
			effectUrl: ''
		},
		typography: {
			display: 'Quicksand, system-ui, sans-serif',
			body: 'Nunito, system-ui, sans-serif'
		},
		animation: {
			ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
			duration: { fast: 200, slow: 400 }
		},
		visualEffects: { noiseOpacity: 0.02, borderSeparator: 'none' }
	},
	{
		id: 'divine',
		name: 'Divine',
		description: 'Celestial Bronze',
		source: 'builtin',
		icon: Sun,
		colors: {
			bgCanvas: '#271a0c',
			bgCard: 'rgba(66, 32, 6, 0.6)',
			bgOverlay: 'rgba(30, 20, 10, 0.9)',
			accent: '#facc15',
			accentGlow: 'rgba(250, 204, 21, 0.6)',
			accentRgb: '250, 204, 21',
			bgOverlayRgb: '66, 32, 6',
			textPrimary: '#fefce8',
			textSecondary: '#fde047',
			textMuted: '#b45309',
			textInverted: '#422006',
			border: 'rgba(250, 204, 21, 0.25)',
			borderHover: 'rgba(250, 204, 21, 0.6)',
			shadow: 'rgba(0, 0, 0, 0.7)',
			overlayLight: 'rgba(254, 240, 138, 0.1)',
			overlayDark: 'rgba(0, 0, 0, 0.5)',
			effectUrl: ''
		},
		typography: { display: 'Cinzel, serif', body: 'Lato, sans-serif' },
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 200, slow: 500 }
		},
		visualEffects: {
			noiseOpacity: 0.01,
			borderSeparator: 'linear-gradient(90deg, transparent, var(--theme-accent), transparent)'
		}
	},
	{
		id: 'underdark',
		name: 'Underdark',
		description: 'Deep Slate & Spore',
		source: 'builtin',
		icon: Gem,
		colors: {
			bgCanvas: '#020617',
			bgCard: 'rgba(15, 23, 42, 0.85)',
			bgOverlay: 'rgba(2, 6, 23, 0.95)',
			accent: '#818cf8',
			accentGlow: 'rgba(129, 140, 248, 0.4)',
			accentRgb: '129, 140, 248',
			bgOverlayRgb: '15, 23, 42',
			textPrimary: '#e2e8f0',
			textSecondary: '#94a3b8',
			textMuted: '#475569',
			textInverted: '#f8fafc',
			border: 'rgba(129, 140, 248, 0.15)',
			borderHover: 'rgba(129, 140, 248, 0.4)',
			shadow: 'rgba(0, 0, 0, 0.9)',
			overlayLight: 'rgba(255, 255, 255, 0.05)',
			overlayDark: 'rgba(0, 0, 0, 0.8)',
			effectUrl: ''
		},
		typography: { display: 'Uncial Antiqua, cursive', body: 'Inter, system-ui, sans-serif' },
		animation: {
			ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
			duration: { fast: 150, slow: 300 }
		},
		visualEffects: { noiseOpacity: 0.05, borderSeparator: 'none' }
	}
];
