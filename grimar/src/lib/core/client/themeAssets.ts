import { browser } from '$app/environment';
import { BUILTIN_THEMES } from './builtinThemes';

const GENERIC_FONT_FAMILIES = new Set([
	'serif',
	'sans-serif',
	'monospace',
	'cursive',
	'fantasy',
	'system-ui',
	'ui-serif',
	'ui-sans-serif',
	'ui-monospace',
	'math',
	'emoji',
	'fangsong'
]);

const GOOGLE_FONT_REQUESTS: Record<string, string> = {
	'Bebas Neue': 'family=Bebas+Neue&display=swap',
	Cinzel: 'family=Cinzel:wght@400;500;600;700&display=swap',
	'Cormorant Garamond': 'family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
	'Crimson Text': 'family=Crimson+Text:wght@400;600;700&display=swap',
	'DM Sans': 'family=DM+Sans:wght@400;500;600;700&display=swap',
	'DM Serif Display': 'family=DM+Serif+Display&display=swap',
	Inter: 'family=Inter:wght@400;500;600;700&display=swap',
	Lato: 'family=Lato:wght@400;700&display=swap',
	Montserrat: 'family=Montserrat:wght@400;500;600;700&display=swap',
	Nunito: 'family=Nunito:wght@400;500;600;700&display=swap',
	Outfit: 'family=Outfit:wght@400;500;600;700&display=swap',
	Quicksand: 'family=Quicksand:wght@400;500;600;700&display=swap',
	Rajdhani: 'family=Rajdhani:wght@400;500;600;700&display=swap',
	'Space Grotesk': 'family=Space+Grotesk:wght@400;500;600;700&display=swap',
	Teko: 'family=Teko:wght@400;500;600;700&display=swap',
	'Uncial Antiqua': 'family=Uncial+Antiqua&display=swap'
};

export const DEFAULT_THEME_ID = 'amethyst';
export const BUILTIN_THEME_IDS = BUILTIN_THEMES.map((theme) => theme.id);
export const THEME_OPTIONS = BUILTIN_THEMES.map((theme) => ({
	value: theme.id,
	label: theme.name
}));

function extractPrimaryFontFamily(fontStack: string | undefined): string | null {
	if (!fontStack) {
		return null;
	}

	const [primaryFamily = ''] = fontStack.split(',');
	const normalizedFamily = primaryFamily.trim().replace(/^['"]|['"]$/g, '');
	if (!normalizedFamily) {
		return null;
	}

	return GENERIC_FONT_FAMILIES.has(normalizedFamily.toLowerCase()) ? null : normalizedFamily;
}

function getThemeFontFamilies(themeId: string): string[] {
	const theme = BUILTIN_THEMES.find((entry) => entry.id === themeId);
	if (!theme?.typography) {
		return [];
	}

	const fontFamilies = [theme.typography.display, theme.typography.body]
		.map(extractPrimaryFontFamily)
		.filter((family): family is string => Boolean(family));

	return [...new Set(fontFamilies)];
}

export function getThemeFontHref(themeId: string): string | null {
	const fontRequests = getThemeFontFamilies(themeId)
		.map((family) => GOOGLE_FONT_REQUESTS[family])
		.filter(Boolean);

	if (fontRequests.length === 0) {
		return null;
	}

	return `https://fonts.googleapis.com/css2?${fontRequests.join('&')}`;
}

export const THEME_FONT_HREF_BY_ID = Object.fromEntries(
	BUILTIN_THEME_IDS.map((themeId) => [themeId, getThemeFontHref(themeId)]).filter(
		(entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
	)
);

export function isBuiltinThemeId(themeId: string | null | undefined): themeId is string {
	return typeof themeId === 'string' && BUILTIN_THEME_IDS.includes(themeId);
}

export function ensureThemeFontsLoaded(themeId: string): void {
	if (!browser) {
		return;
	}

	const saveData =
		'connection' in navigator &&
		Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
	if (saveData) {
		return;
	}

	const href = getThemeFontHref(themeId);
	if (!href || document.querySelector(`link[data-theme-fonts="${themeId}"]`)) {
		return;
	}

	if (!document.querySelector('link[data-theme-font-preconnect="googleapis"]')) {
		const googleApisPreconnect = document.createElement('link');
		googleApisPreconnect.rel = 'preconnect';
		googleApisPreconnect.href = 'https://fonts.googleapis.com';
		googleApisPreconnect.setAttribute('data-theme-font-preconnect', 'googleapis');
		document.head.appendChild(googleApisPreconnect);
	}

	if (!document.querySelector('link[data-theme-font-preconnect="gstatic"]')) {
		const gstaticPreconnect = document.createElement('link');
		gstaticPreconnect.rel = 'preconnect';
		gstaticPreconnect.href = 'https://fonts.gstatic.com';
		gstaticPreconnect.crossOrigin = 'anonymous';
		gstaticPreconnect.setAttribute('data-theme-font-preconnect', 'gstatic');
		document.head.appendChild(gstaticPreconnect);
	}

	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = href;
	link.setAttribute('data-theme-fonts', themeId);
	document.head.appendChild(link);
}
