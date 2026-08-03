import type { ThemeConfig } from '$lib/core/types/theme';

export const BUILTIN_THEMES: ThemeConfig[] = [
	{
		id: 'amethyst',
		name: 'Amethyst',
		description: 'Deep mystical purple',
		source: 'builtin',
		icon: 'amethyst',
		colors: {
			bgCanvas: '#120f1d',
			bgCard: 'rgba(49, 30, 87, 0.42)',
			bgOverlay: 'rgba(70, 48, 124, 0.62)',
			accent: '#bb86ff',
			accentGlow: 'rgba(187, 134, 255, 0.52)',
			accentRgb: '187, 134, 255',
			bgOverlayRgb: '70, 48, 124',
			textPrimary: '#f6f0ff',
			textSecondary: '#ccb8ee',
			textMuted: '#9b85bf',
			textInverted: '#ffffff',
			border: 'rgba(214, 189, 255, 0.16)',
			borderHover: 'rgba(214, 189, 255, 0.34)',
			shadow: 'rgba(0, 0, 0, 0.62)',
			overlayLight: 'rgba(255, 255, 255, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.42)',
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
		icon: 'arcane',
		colors: {
			bgCanvas: '#18110d',
			bgCard: 'rgba(87, 49, 18, 0.4)',
			bgOverlay: 'rgba(120, 72, 28, 0.58)',
			accent: '#d9b24b',
			accentGlow: 'rgba(217, 178, 75, 0.5)',
			accentRgb: '217, 178, 75',
			bgOverlayRgb: '120, 72, 28',
			textPrimary: '#f7ead2',
			textSecondary: '#d9c08d',
			textMuted: '#a1844a',
			textInverted: '#fef3c7',
			border: 'rgba(217, 178, 75, 0.18)',
			borderHover: 'rgba(217, 178, 75, 0.38)',
			shadow: 'rgba(0, 0, 0, 0.68)',
			overlayLight: 'rgba(254, 243, 199, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.48)',
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
		icon: 'nature',
		colors: {
			bgCanvas: '#081713',
			bgCard: 'rgba(20, 78, 58, 0.38)',
			bgOverlay: 'rgba(28, 98, 74, 0.58)',
			accent: '#79dd9f',
			accentGlow: 'rgba(121, 221, 159, 0.48)',
			accentRgb: '121, 221, 159',
			bgOverlayRgb: '28, 98, 74',
			textPrimary: '#eef8f1',
			textSecondary: '#b6dcbc',
			textMuted: '#6ca287',
			textInverted: '#f0fdf4',
			border: 'rgba(121, 221, 159, 0.16)',
			borderHover: 'rgba(121, 221, 159, 0.34)',
			shadow: 'rgba(0, 0, 0, 0.62)',
			overlayLight: 'rgba(255, 255, 255, 0.06)',
			overlayDark: 'rgba(0, 0, 0, 0.46)',
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
		icon: 'fire',
		colors: {
			bgCanvas: '#16100d',
			bgCard: 'rgba(86, 43, 24, 0.38)',
			bgOverlay: 'rgba(112, 58, 28, 0.58)',
			accent: '#ff8a3d',
			accentGlow: 'rgba(255, 138, 61, 0.5)',
			accentRgb: '255, 138, 61',
			bgOverlayRgb: '112, 58, 28',
			textPrimary: '#fff1e4',
			textSecondary: '#e5b38f',
			textMuted: '#b28a70',
			textInverted: '#fff7ed',
			border: 'rgba(255, 160, 97, 0.16)',
			borderHover: 'rgba(255, 138, 61, 0.36)',
			shadow: 'rgba(0, 0, 0, 0.64)',
			overlayLight: 'rgba(255, 255, 255, 0.06)',
			overlayDark: 'rgba(0, 0, 0, 0.48)',
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
		icon: 'ice',
		colors: {
			bgCanvas: '#08131b',
			bgCard: 'rgba(20, 73, 99, 0.38)',
			bgOverlay: 'rgba(34, 107, 138, 0.54)',
			accent: '#94ecff',
			accentGlow: 'rgba(148, 236, 255, 0.48)',
			accentRgb: '148, 236, 255',
			bgOverlayRgb: '34, 107, 138',
			textPrimary: '#edf8fc',
			textSecondary: '#bedde7',
			textMuted: '#77aebd',
			textInverted: '#f0f9ff',
			border: 'rgba(148, 236, 255, 0.16)',
			borderHover: 'rgba(148, 236, 255, 0.34)',
			shadow: 'rgba(0, 0, 0, 0.64)',
			overlayLight: 'rgba(255, 255, 255, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.46)',
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
		icon: 'ocean',
		colors: {
			bgCanvas: '#050b12',
			bgCard: 'rgba(18, 45, 58, 0.4)',
			bgOverlay: 'rgba(23, 63, 74, 0.58)',
			accent: '#46d7c8',
			accentGlow: 'rgba(70, 215, 200, 0.48)',
			accentRgb: '70, 215, 200',
			bgOverlayRgb: '23, 63, 74',
			textPrimary: '#eaf8f6',
			textSecondary: '#9fd4d0',
			textMuted: '#5e9a98',
			textInverted: '#f0fdfa',
			border: 'rgba(70, 215, 200, 0.14)',
			borderHover: 'rgba(70, 215, 200, 0.32)',
			shadow: 'rgba(0, 0, 0, 0.68)',
			overlayLight: 'rgba(255, 255, 255, 0.06)',
			overlayDark: 'rgba(0, 0, 0, 0.54)',
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
		icon: 'void',
		colors: {
			bgCanvas: '#09070d',
			bgCard: 'rgba(34, 21, 46, 0.42)',
			bgOverlay: 'rgba(52, 33, 70, 0.58)',
			accent: '#d2a6ff',
			accentGlow: 'rgba(210, 166, 255, 0.54)',
			accentRgb: '210, 166, 255',
			bgOverlayRgb: '52, 33, 70',
			textPrimary: '#f6f2fb',
			textSecondary: '#d8caea',
			textMuted: '#9b88ba',
			textInverted: '#fafafa',
			border: 'rgba(210, 166, 255, 0.14)',
			borderHover: 'rgba(210, 166, 255, 0.3)',
			shadow: 'rgba(0, 0, 0, 0.74)',
			overlayLight: 'rgba(255, 255, 255, 0.06)',
			overlayDark: 'rgba(0, 0, 0, 0.58)',
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
		icon: 'beach',
		colors: {
			bgCanvas: '#17120f',
			bgCard: 'rgba(88, 68, 47, 0.36)',
			bgOverlay: 'rgba(113, 88, 58, 0.54)',
			accent: '#5edbed',
			accentGlow: 'rgba(94, 219, 237, 0.46)',
			accentRgb: '94, 219, 237',
			bgOverlayRgb: '113, 88, 58',
			textPrimary: '#faf0df',
			textSecondary: '#d8c0a0',
			textMuted: '#9f8a73',
			textInverted: '#fff7ed',
			border: 'rgba(222, 194, 150, 0.16)',
			borderHover: 'rgba(94, 219, 237, 0.32)',
			shadow: 'rgba(0, 0, 0, 0.64)',
			overlayLight: 'rgba(255, 255, 255, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.46)',
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
		icon: 'necropolis',
		colors: {
			bgCanvas: '#100f0d',
			bgCard: 'rgba(41, 40, 33, 0.42)',
			bgOverlay: 'rgba(60, 60, 44, 0.56)',
			accent: '#a4d65c',
			accentGlow: 'rgba(164, 214, 92, 0.46)',
			accentRgb: '164, 214, 92',
			bgOverlayRgb: '60, 60, 44',
			textPrimary: '#ebe7df',
			textSecondary: '#bab2a6',
			textMuted: '#827c72',
			textInverted: '#e5e5e5',
			border: 'rgba(164, 214, 92, 0.12)',
			borderHover: 'rgba(164, 214, 92, 0.3)',
			shadow: 'rgba(0, 0, 0, 0.72)',
			overlayLight: 'rgba(255, 255, 255, 0.05)',
			overlayDark: 'rgba(0, 0, 0, 0.58)',
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
		icon: 'charmed',
		colors: {
			bgCanvas: '#180d16',
			bgCard: 'rgba(103, 35, 70, 0.38)',
			bgOverlay: 'rgba(126, 45, 84, 0.56)',
			accent: '#f08bbd',
			accentGlow: 'rgba(240, 139, 189, 0.5)',
			accentRgb: '240, 139, 189',
			bgOverlayRgb: '126, 45, 84',
			textPrimary: '#fff0f4',
			textSecondary: '#e7b4c3',
			textMuted: '#b68698',
			textInverted: '#fff1f2',
			border: 'rgba(240, 139, 189, 0.16)',
			borderHover: 'rgba(240, 139, 189, 0.34)',
			shadow: 'rgba(48, 9, 29, 0.7)',
			overlayLight: 'rgba(255, 255, 255, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.46)',
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
		icon: 'divine',
		colors: {
			bgCanvas: '#161007',
			bgCard: 'rgba(94, 67, 22, 0.38)',
			bgOverlay: 'rgba(120, 87, 28, 0.56)',
			accent: '#f0d36a',
			accentGlow: 'rgba(240, 211, 106, 0.5)',
			accentRgb: '240, 211, 106',
			bgOverlayRgb: '120, 87, 28',
			textPrimary: '#f8f2db',
			textSecondary: '#dcc88f',
			textMuted: '#a79055',
			textInverted: '#422006',
			border: 'rgba(240, 211, 106, 0.18)',
			borderHover: 'rgba(240, 211, 106, 0.38)',
			shadow: 'rgba(0, 0, 0, 0.72)',
			overlayLight: 'rgba(254, 240, 138, 0.08)',
			overlayDark: 'rgba(0, 0, 0, 0.52)',
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
		icon: 'underdark',
		colors: {
			bgCanvas: '#09060f',
			bgCard: 'rgba(29, 28, 52, 0.4)',
			bgOverlay: 'rgba(47, 45, 79, 0.56)',
			accent: '#9aa5ff',
			accentGlow: 'rgba(154, 165, 255, 0.46)',
			accentRgb: '154, 165, 255',
			bgOverlayRgb: '47, 45, 79',
			textPrimary: '#e8e8f5',
			textSecondary: '#b0b4d0',
			textMuted: '#7b7ea0',
			textInverted: '#f8fafc',
			border: 'rgba(154, 165, 255, 0.14)',
			borderHover: 'rgba(154, 165, 255, 0.3)',
			shadow: 'rgba(0, 0, 0, 0.9)',
			overlayLight: 'rgba(255, 255, 255, 0.05)',
			overlayDark: 'rgba(0, 0, 0, 0.78)',
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
