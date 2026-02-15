import { browser } from '$app/environment';
import { writable, get, type Writable } from 'svelte/store';
import {
	getAllThemes as registryGetAllThemes,
	getThemeById as registryGetThemeById,
	getBuiltinThemes as registryGetBuiltinThemes,
	getImportedThemes as registryGetImportedThemes,
	addImportedTheme,
	removeImportedTheme,
	getUserCreatedThemes as registryGetUserCreatedThemes,
	addUserCreatedTheme,
	updateUserCreatedTheme,
	removeUserCreatedTheme,
	type ThemeConfig,
	ThemeConfigSchema,
} from './themeRegistry';
import { generateThemeCSS, injectThemeCSS, getThemeGradient, getThemeAccentClass } from './themeCSS';

const THEME_KEY = 'grimar-theme';

function getInitialTheme(): string {
	if (!browser) return 'amethyst';

	const stored = localStorage.getItem(THEME_KEY);
	if (stored && registryGetThemeById(stored)) {
		return stored;
	}
	return 'amethyst';
}

function createThemeStore(): {
	subscribe: Writable<string>['subscribe'];
	init: () => void;
	setTheme: (themeId: string) => boolean;
	getCurrentTheme: () => ThemeConfig | undefined;
	getAllThemes: () => ThemeConfig[];
	getBuiltinThemes: () => ThemeConfig[];
	getUserCreatedThemes: () => ThemeConfig[];
	getImportedThemes: () => ThemeConfig[];
	importTheme: (jsonString: string) => { success: boolean; theme?: ThemeConfig; error?: string };
	importThemeFromFile: (file: File) => Promise<{ success: boolean; theme?: ThemeConfig; error?: string }>;
	removeImportedTheme: (themeId: string) => boolean;
	createTheme: (theme: Omit<ThemeConfig, 'id' | 'source'>) => { success: boolean; theme?: ThemeConfig; error?: string };
	updateTheme: (themeId: string, updates: Partial<Omit<ThemeConfig, 'id' | 'source'>>) => boolean;
	deleteTheme: (themeId: string) => boolean;
	exportTheme: (themeId: string) => string | null;
} {
	const store = writable<string>(getInitialTheme());

	function setAndApply(themeId: string): boolean {
		const theme = registryGetThemeById(themeId);
		if (!theme) {
			console.error(`Theme not found: ${themeId}`);
			return false;
		}

		document.documentElement.setAttribute('data-theme', theme.id);
		localStorage.setItem(THEME_KEY, theme.id);
		store.set(themeId);

		if (theme.source !== 'builtin') {
			injectThemeCSS(theme);
		}

		return true;
	}

	return {
		subscribe: store.subscribe,

		init() {
			if (!browser) return;

			const currentTheme = getInitialTheme();
			const theme = registryGetThemeById(currentTheme);
			if (theme) {
				document.documentElement.setAttribute('data-theme', theme.id);
				if (theme.source !== 'builtin') {
					injectThemeCSS(theme);
				}
			}
		},

		setTheme(themeId: string): boolean {
			if (!browser) {
				store.set(themeId);
				return true;
			}
			return setAndApply(themeId);
		},

		getCurrentTheme(): ThemeConfig | undefined {
			const current = get(store);
			return registryGetThemeById(current);
		},

		getAllThemes(): ThemeConfig[] {
			return registryGetAllThemes();
		},

		getBuiltinThemes(): ThemeConfig[] {
			return registryGetAllThemes().filter((t) => t.source === 'builtin');
		},

		getUserCreatedThemes(): ThemeConfig[] {
			return registryGetUserCreatedThemes();
		},

		getImportedThemes(): ThemeConfig[] {
			return registryGetImportedThemes();
		},

		importTheme(jsonString: string): { success: boolean; theme?: ThemeConfig; error?: string } {
			if (!browser) {
				return { success: false, error: 'Cannot import themes on server' };
			}

			try {
				const parsed = JSON.parse(jsonString);
				const result = ThemeConfigSchema.safeParse(parsed);

				if (!result.success) {
					const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
					return { success: false, error: `Invalid theme: ${issues}` };
				}

				const theme = result.data;
				const existing = registryGetThemeById(theme.id);
				if (existing) {
					return { success: false, error: `Theme with ID "${theme.id}" already exists` };
				}

				addImportedTheme(theme);
				return { success: true, theme };
			} catch (e) {
				return { success: false, error: `Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}` };
			}
		},

		importThemeFromFile(file: File): Promise<{ success: boolean; theme?: ThemeConfig; error?: string }> {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = () => {
					const result = this.importTheme(reader.result as string);
					resolve(result);
				};
				reader.onerror = () => {
					resolve({ success: false, error: 'Failed to read file' });
				};
				reader.readAsText(file);
			});
		},

		removeImportedTheme(themeId: string): boolean {
			if (!browser) return false;

			const theme = registryGetThemeById(themeId);
			if (!theme || theme.source !== 'imported') {
				return false;
			}

			removeImportedTheme(themeId);

			const current = get(store);
			if (current === themeId) {
				this.setTheme('amethyst');
			}

			return true;
		},

		createTheme(theme: Omit<ThemeConfig, 'id' | 'source'>): { success: boolean; theme?: ThemeConfig; error?: string } {
			if (!browser) {
				return { success: false, error: 'Cannot create themes on server' };
			}

			const id = `user_${Date.now()}`;
			const fullTheme: ThemeConfig = {
				...theme,
				id,
				source: 'created',
			};

			const result = ThemeConfigSchema.safeParse(fullTheme);
			if (!result.success) {
				const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
				return { success: false, error: `Invalid theme: ${issues}` };
			}

			addUserCreatedTheme(fullTheme);
			return { success: true, theme: fullTheme };
		},

		updateTheme(themeId: string, updates: Partial<Omit<ThemeConfig, 'id' | 'source'>>): boolean {
			if (!browser) return false;

			const theme = registryGetThemeById(themeId);
			if (!theme || theme.source !== 'created') {
				return false;
			}

			const updated = { ...theme, ...updates };
			const result = ThemeConfigSchema.safeParse(updated);
			if (!result.success) {
				return false;
			}

			updateUserCreatedTheme(updated);
			return true;
		},

		deleteTheme(themeId: string): boolean {
			if (!browser) return false;

			const theme = registryGetThemeById(themeId);
			if (!theme || theme.source !== 'created') {
				return false;
			}

			removeUserCreatedTheme(themeId);

			const current = get(store);
			if (current === themeId) {
				this.setTheme('amethyst');
			}

			return true;
		},

		exportTheme(themeId: string): string | null {
			const theme = registryGetThemeById(themeId);
			if (!theme) return null;
			return JSON.stringify(theme, null, 2);
		},
	};
}

export const themeStore = createThemeStore();

export const setTheme = themeStore.setTheme;
export const getTheme = themeStore.getCurrentTheme;
export const getCurrentTheme = themeStore.getCurrentTheme;
export const initTheme = themeStore.init;
export const initThemeSync = themeStore.init;
export const getAllThemes = themeStore.getAllThemes;

export { getBuiltinThemes, getUserCreatedThemes, getImportedThemes, getThemeById, getAllThemes as allThemes } from './themeRegistry';
export { generateThemeCSS, injectThemeCSS, getThemeGradient, getThemeAccentClass } from './themeCSS';
export type { ThemeConfig } from './themeRegistry';

export const THEMES: ThemeConfig[] = registryGetBuiltinThemes();
export const THEME_OPTIONS = THEMES.map((t: ThemeConfig) => ({ value: t.id, label: t.name }));

export function logThemesToConsole(): void {
	console.table(getAllThemes().map((t) => ({ id: t.id, name: t.name, source: t.source })));
}

export function getThemeAccentClassOld(themeId: string): string {
	const theme = registryGetThemeById(themeId);
	if (!theme) return '';
	return `theme-accent-${theme.colors.accent.replace('#', '')}`;
}
