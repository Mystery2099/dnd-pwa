import { browser } from '$app/environment';

export interface Theme {
	id: string;
	name: string;
	description: string;
	icon?: string;
}

export const THEMES: Theme[] = [
	{ id: 'amethyst', name: 'Amethyst', description: 'Deep purple magic' },
	{ id: 'arcane', name: 'Arcane', description: 'Golden Weave radiance' },
	{ id: 'nature', name: 'Nature', description: 'Verdant forest' },
	{ id: 'fire', name: 'Fire', description: 'Blazing inferno' },
	{ id: 'ice', name: 'Ice', description: 'Crystalline frost' },
	{ id: 'void', name: 'Void', description: 'Cosmic darkness' },
	{ id: 'ocean', name: 'Ocean', description: 'Abyssal depths' }
];

const STORAGE_KEY = 'grimar-theme';

let currentTheme = $state(THEMES[0].id);

export function getTheme(): string {
	return currentTheme;
}

export function getThemeInfo(): Theme {
	return THEMES.find((t) => t.id === currentTheme) || THEMES[0];
}

export function setTheme(themeId: string): boolean {
	const theme = THEMES.find((t) => t.id === themeId);
	if (!theme) return false;

	currentTheme = themeId;
	if (browser) {
		document.documentElement.setAttribute('data-theme', themeId);
		localStorage.setItem(STORAGE_KEY, themeId);
	}
	return true;
}

// Synchronous initialization - must be called before first render
// Reads from localStorage immediately without waiting for onMount
export function initThemeSync() {
	if (!browser) return;

	const saved = localStorage.getItem(STORAGE_KEY);
	const themeToSet = saved && THEMES.find((t) => t.id === saved) ? saved : THEMES[0].id;

	// Apply immediately - before any paint
	document.documentElement.setAttribute('data-theme', themeToSet);
	currentTheme = themeToSet;
}

// Async initialization for dev tools logging (safe to call in onMount)
export function initTheme() {
	if (!browser) return;

	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved && THEMES.find((t) => t.id === saved)) {
		setTheme(saved);
	} else {
		setTheme(THEMES[0].id);
	}
}

// Dev-only: Log available themes to console for easy testing
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
			setTheme,
			getTheme,
			getThemeInfo,
			themes: THEMES,
			theme: {
				set: setTheme,
				get: getTheme,
				info: getThemeInfo,
				list: THEMES
			}
		};
	}
}
