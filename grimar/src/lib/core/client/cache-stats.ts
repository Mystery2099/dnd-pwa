/**
 * Cache Statistics Module
 *
 * Tracks cache performance metrics and storage usage.
 * Provides visibility into cache hit/miss rates and storage consumption.
 */

import { browser } from '$app/environment';
import { get, keys } from 'idb-keyval';

// Stats state using Svelte 5 runes
class CacheStatsState {
	hits = $state(0);
	misses = $state(0);
	storageEstimate = $state<number | null>(null);
	lastUpdated = $state<Date | null>(null);

	get hitRate(): number {
		const total = this.hits + this.misses;
		return total > 0 ? (this.hits / total) * 100 : 0;
	}
}

export const cacheStats = new CacheStatsState();

/**
 * Record a cache hit.
 */
export function recordCacheHit(): void {
	cacheStats.hits++;
}

/**
 * Record a cache miss.
 */
export function recordCacheMiss(): void {
	cacheStats.misses++;
}

/**
 * Get a human-readable storage size string.
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Update storage estimate from IndexedDB.
 */
export async function updateStorageEstimate(): Promise<void> {
	if (!browser) return;

	try {
		const estimate = await navigator.storage.estimate();
		cacheStats.storageEstimate = estimate.usage || null;
		cacheStats.lastUpdated = new Date();
	} catch {
		// Storage API not available
		cacheStats.storageEstimate = null;
	}
}

/**
 * Get detailed cache info for debugging.
 */
export async function getCacheInfo(): Promise<{
	hits: number;
	misses: number;
	hitRate: number;
	storageUsage: string;
	cacheKeys: string[];
}> {
	const storageUsage = cacheStats.storageEstimate
		? formatBytes(cacheStats.storageEstimate)
		: 'Unknown';

	const cacheKeys = browser ? await keys() : [];

	return {
		hits: cacheStats.hits,
		misses: cacheStats.misses,
		hitRate: cacheStats.hitRate,
		storageUsage,
		cacheKeys: cacheKeys as string[]
	};
}

/**
 * Reset all statistics.
 */
export function resetStats(): void {
	cacheStats.hits = 0;
	cacheStats.misses = 0;
	cacheStats.lastUpdated = new Date();
}

/**
 * Initialize storage estimation (call on app start).
 */
export function initCacheStats(): void {
	if (!browser) return;

	// Initial estimate
	updateStorageEstimate();

	// Periodic updates every 30 seconds
	const interval = setInterval(updateStorageEstimate, 30_000);

	// Cleanup on page unload
	if (typeof window !== 'undefined') {
		window.addEventListener('beforeunload', () => clearInterval(interval));
	}
}
