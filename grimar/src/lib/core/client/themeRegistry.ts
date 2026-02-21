import { browser } from '$app/environment';
import { BUILTIN_THEMES } from './builtinThemes';
import { ThemeConfigSchema, type ThemeConfig } from '$lib/core/types/theme';

export type { ThemeConfig };
export { ThemeConfigSchema };

const IMPORTED_THEMES_KEY = 'grimar-imported-themes';

export function getBuiltinThemes(): ThemeConfig[] {
	return BUILTIN_THEMES;
}

export function getImportedThemes(): ThemeConfig[] {
	if (!browser) return [];
	const stored = localStorage.getItem(IMPORTED_THEMES_KEY);
	if (!stored) return [];
	try {
		return JSON.parse(stored) as ThemeConfig[];
	} catch {
		return [];
	}
}

export function saveImportedThemes(themes: ThemeConfig[]): void {
	if (!browser) return;
	localStorage.setItem(IMPORTED_THEMES_KEY, JSON.stringify(themes));
}

export function addImportedTheme(theme: ThemeConfig): void {
	const existing = getImportedThemes();
	const filtered = existing.filter((t) => t.id !== theme.id);
	saveImportedThemes([...filtered, { ...theme, source: 'imported' as const }]);
}

export function removeImportedTheme(themeId: string): void {
	const existing = getImportedThemes();
	saveImportedThemes(existing.filter((t) => t.id !== themeId));
}

export function getUserCreatedThemes(): ThemeConfig[] {
	if (!browser) return [];
	const stored = localStorage.getItem('grimar-user-created-themes');
	if (!stored) return [];
	try {
		return JSON.parse(stored) as ThemeConfig[];
	} catch {
		return [];
	}
}

export function saveUserCreatedThemes(themes: ThemeConfig[]): void {
	if (!browser) return;
	localStorage.setItem('grimar-user-created-themes', JSON.stringify(themes));
}

export function addUserCreatedTheme(theme: ThemeConfig): void {
	const existing = getUserCreatedThemes();
	const filtered = existing.filter((t) => t.id !== theme.id);
	saveUserCreatedThemes([...filtered, { ...theme, source: 'created' as const }]);
}

export function updateUserCreatedTheme(theme: ThemeConfig): void {
	const existing = getUserCreatedThemes();
	const updated = existing.map((t) =>
		t.id === theme.id ? { ...theme, source: 'created' as const } : t
	);
	saveUserCreatedThemes(updated);
}

export function removeUserCreatedTheme(themeId: string): void {
	const existing = getUserCreatedThemes();
	saveUserCreatedThemes(existing.filter((t) => t.id !== themeId));
}

export function getAllThemes(): ThemeConfig[] {
	return [...getBuiltinThemes(), ...getUserCreatedThemes(), ...getImportedThemes()];
}

export function getThemeById(id: string): ThemeConfig | undefined {
	return getAllThemes().find((t) => t.id === id);
}

export function isBuiltinTheme(id: string): boolean {
	return getBuiltinThemes().some((t) => t.id === id);
}

export function isUserCreatedTheme(id: string): boolean {
	return getUserCreatedThemes().some((t) => t.id === id);
}

export function isImportedTheme(id: string): boolean {
	return getImportedThemes().some((t) => t.id === id);
}

export function getThemeSource(id: string): 'builtin' | 'created' | 'imported' | undefined {
	if (isBuiltinTheme(id)) return 'builtin';
	if (isUserCreatedTheme(id)) return 'created';
	if (isImportedTheme(id)) return 'imported';
	return undefined;
}

export function importTheme(jsonString: string): {
	success: boolean;
	theme?: ThemeConfig;
	error?: string;
} {
	try {
		const parsed = JSON.parse(jsonString);
		const result = ThemeConfigSchema.safeParse(parsed);
		if (!result.success) {
			const zodError = result.error;
			return { success: false, error: zodError.issues[0]?.message || 'Invalid theme format' };
		}
		const theme = result.data;
		if (isBuiltinTheme(theme.id)) {
			return { success: false, error: `Theme '${theme.id}' conflicts with a built-in theme` };
		}
		addImportedTheme(theme);
		return { success: true, theme };
	} catch (e) {
		return { success: false, error: 'Invalid JSON format' };
	}
}

export function exportTheme(themeId: string): string | null {
	const theme = getThemeById(themeId);
	if (!theme) return null;
	const { ...exportData } = theme;
	return JSON.stringify(exportData, null, 2);
}

export function deleteImportedTheme(themeId: string): boolean {
	if (!isImportedTheme(themeId)) return false;
	removeImportedTheme(themeId);
	return true;
}
