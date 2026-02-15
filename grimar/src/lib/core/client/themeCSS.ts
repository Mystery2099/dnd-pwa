import { browser } from '$app/environment';
import type { ThemeConfig } from '$lib/core/types/theme';

const STYLE_ID = 'grimar-dynamic-theme';

export function generateThemeCSS(theme: ThemeConfig): string {
	const { colors, typography, animation, visualEffects } = theme;

	const css = `[data-theme='${theme.id}'] {
	--theme-bg-canvas: ${colors.bgCanvas};
	--theme-bg-card: ${colors.bgCard};
	--theme-bg-overlay: ${colors.bgOverlay};
	--theme-accent: ${colors.accent};
	--theme-accent-glow: ${colors.accentGlow || `${colors.accent}80`};
	--theme-accent-rgb: ${colors.accentRgb || hexToRgb(colors.accent)};
	--theme-bg-overlay-rgb: ${colors.bgOverlayRgb || hexToRgb(colors.bgOverlay)};
	--theme-text-primary: ${colors.textPrimary};
	--theme-text-secondary: ${colors.textSecondary};
	--theme-text-muted: ${colors.textMuted};
	--theme-text-inverted: ${colors.textInverted || colors.textPrimary};
	--theme-border: ${colors.border};
	--theme-border-hover: ${colors.borderHover};
	--theme-shadow: ${colors.shadow || 'rgba(0, 0, 0, 0.5)'};
	--theme-overlay-light: ${colors.overlayLight || 'rgba(255, 255, 255, 0.1)'};
	--theme-overlay-dark: ${colors.overlayDark || 'rgba(0, 0, 0, 0.3)'};
	--theme-effect-url: ${colors.effectUrl || ''};

	${typography ? `--theme-font-display: ${typography.display};--theme-font-body: ${typography.body};` : ''}
	${animation?.duration ? `--theme-duration-fast: ${animation.duration.fast ?? 150}ms;--theme-duration-slow: ${animation.duration.slow ?? 300}ms;` : ''}
	${animation?.ease ? `--theme-ease-smooth: ${animation.ease};` : ''}
	${visualEffects?.noiseOpacity !== undefined ? `--theme-noise-opacity: ${visualEffects.noiseOpacity};` : ''}
	${visualEffects?.borderSeparator ? `--theme-border-separator: ${visualEffects.borderSeparator};` : ''}
}`;

	return css;
}

export function injectThemeCSS(theme: ThemeConfig): void {
	if (!browser) return;

	const existing = document.getElementById(STYLE_ID);
	if (existing) {
		existing.remove();
	}

	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = generateThemeCSS(theme);
	document.head.appendChild(style);
}

export function clearInjectedThemeCSS(): void {
	if (!browser) return;
	const existing = document.getElementById(STYLE_ID);
	if (existing) {
		existing.remove();
	}
}

function hexToRgb(hex: string): string {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return '0, 0, 0';
	return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function exportThemeAsCSS(theme: ThemeConfig): string {
	return generateThemeCSS(theme);
}

export function getThemeGradient(theme: ThemeConfig): string {
	const accent = theme.colors.accent.toLowerCase();
	
	const colorToShade: Record<string, string> = {
		'#a855f7': 'purple',
		'#f59e0b': 'amber',
		'#10b981': 'emerald',
		'#ef4444': 'red',
		'#06b6d4': 'cyan',
		'#3b82f6': 'blue',
		'#8b5cf6': 'violet',
		'#f97316': 'orange',
		'#84cc16': 'lime',
		'#ec4899': 'pink',
		'#eab308': 'yellow',
		'#6366f1': 'indigo'
	};
	
	const shade = colorToShade[accent] || 'purple';
	return `from-${shade}-500/20 to-${shade}-500/20`;
}

export function getThemeAccentClass(theme: ThemeConfig): string {
	const accent = theme.colors.accent.toLowerCase();
	
	const colorToClass: Record<string, string> = {
		'#a855f7': 'text-purple-400',
		'#f59e0b': 'text-amber-400',
		'#10b981': 'text-emerald-400',
		'#ef4444': 'text-red-400',
		'#06b6d4': 'text-cyan-400',
		'#3b82f6': 'text-blue-400',
		'#8b5cf6': 'text-violet-400',
		'#f97316': 'text-orange-400',
		'#84cc16': 'text-lime-400',
		'#ec4899': 'text-pink-400',
		'#eab308': 'text-yellow-400',
		'#6366f1': 'text-indigo-400'
	};
	
	return colorToClass[accent] || 'text-purple-400';
}
