/**
 * User Settings Store (Server-Backed)
 *
 * User preferences stored on the server (single source of truth).
 * Uses TanStack Query for fetching with localStorage caching.
 *
 * IMPORTANT: This module must not call createQuery at import time.
 * Query creation is deferred and only happens in browser context.
 */

import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import type { ServerSettings } from './settings';
import { DEFAULT_SERVER_SETTINGS } from './settings';

const QUERY_KEY = ['user-settings'];
const STORAGE_KEY = 'grimar-user-settings-cache';

// LocalStorage cache for offline/first load
function getCachedSettings(): ServerSettings | null {
	if (!browser) return null;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && typeof parsed === 'object' && 'syncOnLoad' in parsed) {
				return { ...DEFAULT_SERVER_SETTINGS, ...parsed };
			}
		}
	} catch {
		console.error('[UserSettingsStore] Failed to load cached settings');
	}
	return null;
}

function cacheSettings(settings: ServerSettings): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		console.error('[UserSettingsStore] Failed to cache settings');
	}
}

// Simple fetch wrapper
async function fetchSettings(): Promise<ServerSettings> {
	const response = await fetch('/api/user/settings');
	if (!response.ok) {
		throw new Error('Failed to fetch settings');
	}
	return response.json() as Promise<ServerSettings>;
}

// Svelte store implementation (no TanStack Query context needed)
function createUserSettingsStore() {
	// Start with cached or default values
	const cached = getCachedSettings();
	const settingsStore$ = writable<ServerSettings>(cached ?? DEFAULT_SERVER_SETTINGS);

	let loading = false;
	let error = false;

	return {
		get data(): ServerSettings {
			return get(settingsStore$);
		},
		get isLoading(): boolean {
			return loading;
		},
		get isError(): boolean {
			return error;
		},

		/**
		 * Initialize by fetching from server
		 */
		async init(): Promise<void> {
			if (!browser) return;
			if (loading) return;

			loading = true;
			error = false;

			try {
				const serverSettings = await fetchSettings();
				settingsStore$.set(serverSettings);
				cacheSettings(serverSettings);
			} catch (err) {
				console.error('[UserSettingsStore] Failed to fetch settings:', err);
				error = true;
				// Keep using cached/default values on error
			} finally {
				loading = false;
			}
		},

		/**
		 * Update a setting (optimistic update + server sync)
		 */
		async updateSetting<K extends keyof ServerSettings>(
			key: K,
			value: ServerSettings[K]
		): Promise<void> {
			// Optimistic update (immediate feedback)
			const current = get(settingsStore$);
			const newData = { ...current, [key]: value };
			settingsStore$.set(newData);
			cacheSettings(newData);

			// Server sync
			try {
				const response = await fetch('/api/user/settings', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ [key]: value })
				});

				if (!response.ok) {
					throw new Error('Failed to update');
				}

				const serverSettings = await response.json();
				settingsStore$.set(serverSettings);
				cacheSettings(serverSettings);
			} catch (err) {
				console.error('[UserSettingsStore] Failed to update setting:', err);
				// Refetch to get actual server state
				await this.init();
			}
		},

		/**
		 * Refetch settings from server
		 */
		async refetch(): Promise<void> {
			await this.init();
		}
	};
}

export const userSettingsStore = createUserSettingsStore();

// Auto-initialize on import (in browser)
if (browser) {
	userSettingsStore.init();
}

// Export individual setters for convenience
export function createSettingUpdater<K extends keyof ServerSettings>(key: K) {
	return (value: ServerSettings[K]) => userSettingsStore.updateSetting(key, value);
}

// Re-export types
export type { ServerSettings } from './settings';
export { DEFAULT_SERVER_SETTINGS } from './settings';
