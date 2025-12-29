/**
 * Cache Cleanup
 *
 * Periodic cleanup monitoring for memory cache.
 */

import { MemoryCache } from './memory-cache';

/**
 * Start periodic cache cleanup monitoring
 */
export function startCacheCleanup(intervalMs: number = 60000) {
	setInterval(() => {
		const cache = MemoryCache.getInstance();
		const stats = cache.getCacheStats();

		// If cache is over 80% full, log cleanup suggestion
		if (stats.percentage > 80) {
			console.log(`[CACHE] Cache usage at ${stats.percentage.toFixed(1)}%, triggering cleanup`);
			// The MemoryCache class handles automatic cleanup when adding new items
			// This is just for monitoring
		}
	}, intervalMs);
}
