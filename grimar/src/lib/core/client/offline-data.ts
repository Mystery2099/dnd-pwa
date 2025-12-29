/**
 * Offline Data Loader
 *
 * Client-side module for seeding and managing offline compendium data.
 */

import { browser } from '$app/environment';
import {
	getItemsByType,
	getItemStats,
	seedItems,
	getLastSync,
	setLastSync,
	getStorageUsage,
	type DbItem
} from './offline-db';

let seedingPromise: Promise<{ success: boolean; itemsSeeded: number }> | null = null;

export interface CompendiumExport {
	version: number;
	checksum: string;
	counts: Record<string, number>;
	total: number;
	items: Array<{
		type: string;
		source: string;
		externalId: string;
		name: string;
		summary: string;
		details: Record<string, unknown>;
		spellLevel?: number;
		spellSchool?: string;
		challengeRating?: string;
		monsterSize?: string;
		monsterType?: string;
	}>;
}

/**
 * Check if offline data is available and up-to-date
 */
export async function hasOfflineData(): Promise<boolean> {
	if (!browser) return false;

	try {
		const stats = await getItemStats();
		return stats.spells > 0 || stats.monsters > 0 || stats.items > 0;
	} catch {
		return false;
	}
}

/**
 * Get offline stats
 */
export async function getOfflineStats(): Promise<{
	spells: number;
	monsters: number;
	items: number;
}> {
	if (!browser) return { spells: 0, monsters: 0, items: 0 };

	try {
		return await getItemStats();
	} catch {
		return { spells: 0, monsters: 0, items: 0 };
	}
}

/**
 * Seed offline data from server
 */
export async function seedFromServer(
	force = false
): Promise<{ success: boolean; itemsSeeded: number }> {
	if (!browser) return { success: false, itemsSeeded: 0 };

	// Prevent concurrent seeding
	if (seedingPromise) {
		await seedingPromise;
		return { success: true, itemsSeeded: 0 };
	}

	seedingPromise = (async (): Promise<{ success: boolean; itemsSeeded: number }> => {
		try {
			// Check if we need to sync
			const response = await fetch('/api/compendium/export?full=true');
			if (!response.ok) {
				throw new Error('Failed to fetch compendium export');
			}

			const data: CompendiumExport = await response.json();
			const lastSync = await getLastSync();

			// Skip if data hasn't changed and not forcing
			if (!force && lastSync && lastSync >= data.version) {
				console.info('[offline] Data is current, no seed needed');
				return { success: true, itemsSeeded: 0 };
			}

			// Transform items for offline storage
			const offlineItems = data.items.map((item) => ({
				type: item.type as 'spell' | 'monster' | 'item',
				source: item.source,
				externalId: item.externalId,
				name: item.name,
				summary: item.summary,
				details: item.details,
				spellLevel: item.spellLevel,
				spellSchool: item.spellSchool,
				challengeRating: item.challengeRating,
				monsterSize: item.monsterSize,
				monsterType: item.monsterType,
				syncStatus: 'synced' as const,
				updatedAt: data.version
			}));

			// Seed the database
			await seedItems(offlineItems);

			// Update sync state
			await setLastSync(data.version, data.checksum, data.total);

			console.info(`[offline] Seeded ${offlineItems.length} items`);
			return { success: true, itemsSeeded: offlineItems.length };
		} catch (error) {
			console.error('[offline] Seed failed:', error);
			return { success: false, itemsSeeded: 0 };
		}
	})();

	const result = await seedingPromise;
	seedingPromise = null;
	return result;
}

/**
 * Get spells from offline store
 */
export async function getOfflineSpells(): Promise<Array<Record<string, unknown>>> {
	if (!browser) return [];
	const items = await getItemsByType('spell');
	return items as unknown as Array<Record<string, unknown>>;
}

/**
 * Get monsters from offline store
 */
export async function getOfflineMonsters(): Promise<Array<Record<string, unknown>>> {
	if (!browser) return [];
	const items = await getItemsByType('monster');
	return items as unknown as Array<Record<string, unknown>>;
}

/**
 * Get items from offline store
 */
export async function getOfflineItems(): Promise<Array<Record<string, unknown>>> {
	if (!browser) return [];
	const items = await getItemsByType('item');
	return items as unknown as Array<Record<string, unknown>>;
}

/**
 * Search offline compendium
 */
export async function searchOffline(
	query: string,
	type?: string
): Promise<Array<Record<string, unknown>>> {
	if (!browser) return [];
	const { searchItems } = await import('./offline-db');
	const results = await searchItems(query, type);
	return results as unknown as Array<Record<string, unknown>>;
}

/**
 * Get storage estimate
 */
export async function getOfflineStorageInfo(): Promise<{
	usage: number;
	quota: number;
	percent: number;
} | null> {
	if (!browser) return null;
	const estimate = await getStorageUsage();
	if (!estimate) return null;

	return {
		usage: estimate.usage,
		quota: estimate.quota,
		percent: estimate.quota > 0 ? (estimate.usage / estimate.quota) * 100 : 0
	};
}

/**
 * Initialize offline data on app load
 */
export async function initializeOffline(): Promise<void> {
	if (!browser) return;

	// Check if we have data, seed if needed
	const hasData = await hasOfflineData();
	if (!hasData) {
		console.info('[offline] No offline data found, seeding...');
		await seedFromServer();
	}
}
