/**
 * Offline Data Initialization
 *
 * Automatically seeds offline data on app load and manages seamless offline/online experience.
 * Import this in your root layout to enable offline-first functionality.
 */

import { browser } from '$app/environment';
import { seedFromServer, hasOfflineData, initializeOffline } from './offline-data';
import { offlineStore } from './offline-store-ui';

let initialized = false;

/**
 * Initialize offline data with user-friendly progress
 */
export async function initializeOfflineExperience(): Promise<void> {
	if (!browser || initialized) return;

	initialized = true;

	// Initialize the store (sets up listeners)
	offlineStore.init();

	// Check if we have data, seed if needed
	const hasData = await hasOfflineData();

	if (!hasData) {
		console.info('[offline] First visit - seeding data...');
		const result = await seedFromServer();
		if (result.success) {
			console.info(`[offline] Seeded ${result.itemsSeeded} items for offline use`);
		}
	}
}

/**
 * Get current offline status for UI
 * Returns plain values, not store subscriptions
 */
export function useOfflineStatus() {
	if (!browser) {
		return {
			available: false,
			online: true,
			seeding: false,
			lastSync: null,
			stats: { spells: 0, monsters: 0, items: 0 },
			refresh: async () => {},
			sync: async () => ({ success: false, itemsSeeded: 0 })
		};
	}

	// Get snapshot of current state
	let state: {
		available: boolean;
		online: boolean;
		seeding: boolean;
		lastSync: number | null;
		stats: { spells: number; monsters: number; items: number };
		storage: { usage: number; quota: number; percent: number } | null;
	} = {
		available: false,
		online: true,
		seeding: false,
		lastSync: null,
		stats: { spells: 0, monsters: 0, items: 0 },
		storage: null
	};
	const unsubscribe = offlineStore.subscribe((s) => {
		state = s;
	});
	unsubscribe();

	return {
		get available() {
			return state.available;
		},
		get online() {
			return state.online;
		},
		get seeding() {
			return state.seeding;
		},
		get lastSync() {
			return state.lastSync;
		},
		get stats() {
			return state.stats;
		},
		refresh: () => offlineStore.refresh(),
		sync: (force = false) => offlineStore.seed(force)
	};
}

/**
 * Check if we're currently offline
 */
export function isOffline(): boolean {
	if (!browser) return false;
	return !navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onOnline(callback: () => void): () => void {
	if (!browser) return () => {};

	window.addEventListener('online', callback);
	return () => window.removeEventListener('online', callback);
}

export function onOffline(callback: () => void): () => void {
	if (!browser) return () => {};

	window.addEventListener('offline', callback);
	return () => window.removeEventListener('offline', callback);
}
