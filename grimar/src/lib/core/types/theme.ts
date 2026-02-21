import { z } from 'zod';
import type { ComponentType } from 'svelte';

export const ThemeColorsSchema = z.object({
	bgCanvas: z.string(),
	bgCard: z.string(),
	bgOverlay: z.string(),
	accent: z.string(),
	accentGlow: z.string().optional(),
	accentRgb: z.string().optional(),
	bgOverlayRgb: z.string().optional(),
	textPrimary: z.string(),
	textSecondary: z.string(),
	textMuted: z.string(),
	textInverted: z.string().optional(),
	border: z.string(),
	borderHover: z.string(),
	shadow: z.string().optional(),
	overlayLight: z.string().optional(),
	overlayDark: z.string().optional(),
	effectUrl: z.string().optional()
});

export const ThemeTypographySchema = z.object({
	display: z.string(),
	body: z.string()
});

export const ThemeAnimationSchema = z.object({
	ease: z.string().optional(),
	duration: z
		.object({
			fast: z.number().optional(),
			slow: z.number().optional()
		})
		.optional()
});

export const ThemeVisualEffectsSchema = z.object({
	noiseOpacity: z.number().optional(),
	borderSeparator: z.string().optional()
});

export const ThemeConfigSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	source: z.enum(['builtin', 'created', 'imported']),
	colors: ThemeColorsSchema,
	typography: ThemeTypographySchema.optional(),
	animation: ThemeAnimationSchema.optional(),
	visualEffects: ThemeVisualEffectsSchema.optional(),
	icon: z.any().optional()
});

export const ThemeColorsPartialSchema = ThemeColorsSchema.partial();
export const ThemeConfigPartialSchema = ThemeConfigSchema.partial();

export type ThemeColors = z.infer<typeof ThemeColorsSchema>;
export type ThemeTypography = z.infer<typeof ThemeTypographySchema>;
export type ThemeAnimation = z.infer<typeof ThemeAnimationSchema>;
export type ThemeVisualEffects = z.infer<typeof ThemeVisualEffectsSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type ThemeColorsPartial = z.infer<typeof ThemeColorsPartialSchema>;
export type ThemeConfigPartial = z.infer<typeof ThemeConfigPartialSchema>;

export type ThemeSource = ThemeConfig['source'];

export const DEFAULT_THEME_COLORS: ThemeColors = {
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
};

export const DEFAULT_THEME_TYPOGRAPHY: ThemeTypography = {
	display: 'Quicksand, system-ui, sans-serif',
	body: 'Inter, system-ui, sans-serif'
};

export const DEFAULT_THEME_ANIMATION: ThemeAnimation = {
	ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
	duration: {
		fast: 150,
		slow: 300
	}
};

export const DEFAULT_THEME_VISUAL_EFFECTS: ThemeVisualEffects = {
	noiseOpacity: 0.03,
	borderSeparator: 'none'
};

export function fillDefaults(partial: ThemeConfigPartial): ThemeConfig {
	const colors = { ...DEFAULT_THEME_COLORS, ...partial.colors };
	const typography = { ...DEFAULT_THEME_TYPOGRAPHY, ...partial.typography };
	const animation = { ...DEFAULT_THEME_ANIMATION, ...partial.animation };
	const visualEffects = { ...DEFAULT_THEME_VISUAL_EFFECTS, ...partial.visualEffects };

	const accentGlow = colors.accentGlow || `${colors.accent}80`;
	const accentRgb = colors.accentRgb || hexToRgb(colors.accent);
	const bgOverlayRgb = colors.bgOverlayRgb || hexToRgb(colors.bgOverlay);

	return {
		id: partial.id || 'custom',
		name: partial.name || 'Custom Theme',
		description: partial.description,
		source: partial.source || 'created',
		colors: { ...colors, accentGlow, accentRgb, bgOverlayRgb },
		typography,
		animation,
		visualEffects
	};
}

function hexToRgb(hex: string): string {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return '0, 0, 0';
	return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function validateThemeConfig(input: unknown): {
	success: boolean;
	data?: ThemeConfig;
	error?: string;
} {
	const result = ThemeConfigSchema.safeParse(input);
	if (result.success) {
		return { success: true, data: result.data };
	}
	const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
	return { success: false, error: errors };
}

export function validatePartialThemeConfig(input: unknown): {
	success: boolean;
	data?: ThemeConfig;
	error?: string;
} {
	const result = ThemeConfigPartialSchema.safeParse(input);
	if (result.success) {
		const filled = fillDefaults(result.data);
		return { success: true, data: filled };
	}
	const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
	return { success: false, error: errors };
}
