/**
 * Offline State Store
 *
 * Svelte store for managing offline state and sync status.
 * Provides reactive updates for UI components.
 */

import { browser } from '$app/environment';
import { writable, derived, type Readable } from 'svelte/store';
import {
	getOfflineStats,
	getOfflineStorageInfo,
	seedFromServer,
	hasOfflineData
} from './offline-data';
import { getLastSync } from './offline-db';

export interface OfflineState {
	available: boolean;
	seeding: boolean;
	lastSync: number | null;
	stats: {
		spells: number;
		monsters: number;
		items: number;
	};
	storage: {
		usage: number;
		quota: number;
		percent: number;
	} | null;
	online: boolean;
}

function createOfflineStore() {
	const { subscribe, set, update } = writable<OfflineState>({
		available: false,
		seeding: false,
		lastSync: null,
		stats: { spells: 0, monsters: 0, items: 0 },
		storage: null,
		online: navigator.onLine
	});

	let refreshInterval: ReturnType<typeof setInterval> | null = null;

	async function refresh() {
		if (!browser) return;

		const available = await hasOfflineData();
		const stats = await getOfflineStats();
		const storage = await getOfflineStorageInfo();
		const lastSync = await getLastSync();

		update((state) => ({
			...state,
			available,
			stats,
			storage,
			lastSync,
			online: navigator.onLine
		}));
	}

	return {
		subscribe,
		init: async () => {
			if (!browser) return;

			// Initial refresh
			await refresh();

			// Listen for online/offline events
			window.addEventListener('online', refresh);
			window.addEventListener('offline', refresh);

			// Periodic refresh (every 30 seconds)
			refreshInterval = setInterval(refresh, 30000);

			// Also refresh when page becomes visible
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') {
					refresh();
				}
			});
		},
		seed: async (force = false) => {
			update((s) => ({ ...s, seeding: true }));

			try {
				const result = await seedFromServer(force);
				if (result.success) {
					await refresh();
				}
				return result;
			} finally {
				update((s) => ({ ...s, seeding: false }));
			}
		},
		refresh,
		destroy: () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		}
	};
}

export const offlineStore = createOfflineStore();

// Derived stores for convenience
export const isOfflineAvailable: Readable<boolean> = derived(
	offlineStore,
	($store) => $store.available
);

export const offlineStats: Readable<{ spells: number; monsters: number; items: number }> = derived(
	offlineStore,
	($store) => $store.stats
);

export const isSeeding: Readable<boolean> = derived(offlineStore, ($store) => $store.seeding);

export const lastSyncTime: Readable<number | null> = derived(
	offlineStore,
	($store) => $store.lastSync
);

// Format bytes for display
export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
