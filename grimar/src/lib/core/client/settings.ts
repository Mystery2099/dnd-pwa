import type { ThemeConfig } from '$lib/core/types/theme';

/**
 * Server-Side User Settings
 *
 * These settings are stored in the database and synced across devices.
 * Server is the single source of truth - no local sync logic.
 */

export interface ServerSettings {
	/** User-created themes (synced to server) */
	userThemes: ThemeConfig[];
	/** Whether to sync compendium on page load */
	syncOnLoad: boolean;
	/** Enable offline mode with local cache */
	offlineEnabled: boolean;
	/** How often to auto-sync: never | 15min | 30min | 1h */
	autoSyncInterval: 'never' | '15min' | '30min' | '1h';
}

export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
	userThemes: [],
	syncOnLoad: false,
	offlineEnabled: true,
	autoSyncInterval: 'never'
};
