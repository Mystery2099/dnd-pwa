/**
 * Sync Time Storage
 *
 * Persists last sync timestamp to localStorage.
 */

import { browser } from '$app/environment';

const SYNC_TIME_KEY = 'grimar-last-sync';

/** Store last sync time */
export function updateLastSyncTime(): void {
	if (!browser) return;

	try {
		localStorage.setItem(SYNC_TIME_KEY, new Date().toISOString());
	} catch (error) {
		console.warn('[CLIENT_CACHE] Could not save sync time:', error);
	}
}

/** Get last sync time */
export function getLastSyncTime(): Date | null {
	if (!browser) return null;

	try {
		const stored = localStorage.getItem(SYNC_TIME_KEY);
		return stored ? new Date(stored) : null;
	} catch (error) {
		console.warn('[CLIENT_CACHE] Could not get sync time:', error);
		return null;
	}
}
