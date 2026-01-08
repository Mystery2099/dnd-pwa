import { browser } from '$app/environment';
import { THEMES, type ThemeId, type ThemeInfo, THEME_OPTIONS, getThemeAccentClass } from './themes';

export { THEMES, type ThemeId, type ThemeInfo, THEME_OPTIONS, getThemeAccentClass };

const STORAGE_KEY = 'grimar-theme';

let currentTheme = $state<ThemeId>(THEMES[0].id);

export function getTheme(): ThemeId {
	return currentTheme;
}

export function getThemeInfo(): ThemeInfo {
	return THEMES.find((t) => t.id === currentTheme) || THEMES[0];
}

// Get accent class for current theme (for UI styling)
export function getCurrentAccentClass(): string {
	return getThemeAccentClass(currentTheme);
}

// Get any CSS variable from current theme
export function getThemeCSSVar(varName: string): string {
	if (!browser) return '';
	const root = document.documentElement;
	return getComputedStyle(root).getPropertyValue(varName).trim();
}

export function setTheme(themeId: string): boolean {
	const theme = THEMES.find((t) => t.id === themeId);
	if (!theme) return false;

	currentTheme = themeId as ThemeId;
	if (browser) {
		document.documentElement.setAttribute('data-theme', themeId);
		localStorage.setItem(STORAGE_KEY, themeId);
	}
	return true;
}

// Synchronous initialization - must be called before first render
export function initThemeSync() {
	if (!browser) return;

	const saved = localStorage.getItem(STORAGE_KEY);
	const themeToSet = (
		saved && THEMES.find((t) => t.id === saved) ? saved : THEMES[0].id
	) as ThemeId;

	document.documentElement.setAttribute('data-theme', themeToSet);
	currentTheme = themeToSet;
}

// Dev-only: Log available themes to console
export function logThemesToConsole() {
	if (!browser) return;

	const styles = {
		title: 'color: #a855f7; font-size: 14px; font-weight: bold;',
		accent: 'color: #8b5cf6; font-weight: bold;',
		command:
			'color: #10b981; background: #064e3b; padding: 2px 6px; border-radius: 4px; font-family: monospace;',
		description: 'color: #9ca3af; font-size: 12px;'
	};

	console.log('%c🎨 Grimar Theme Debugger%c\nAvailable themes:', styles.title, '');

	THEMES.forEach((theme) => {
		console.log(
			`%c${theme.name}%c - ${theme.description}\n%cCopy: setTheme('${theme.id}')%c or click: grimar.setTheme('${theme.id}')`,
			styles.accent,
			styles.description,
			styles.command,
			''
		);
	});

	console.log(
		`\n%cQuick switch:%c\n  grimar.setTheme('arcane')\n  grimar.setTheme('nature')\n  grimar.setTheme('fire')`,
		'font-weight: bold;',
		''
	);

	// Expose helper globally for dev tools
	if (typeof window !== 'undefined') {
		(window as any).grimar = {
			...((window as any).grimar || {}),
			setTheme,
			getTheme,
			getThemeInfo,
			logThemesToConsole,
			themes: THEMES
		};
	}
}

// Legacy export for backward compatibility
export const initTheme = initThemeSync;
