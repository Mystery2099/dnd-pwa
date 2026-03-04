/**
 * Cache Cleanup
 *
 * Periodic cleanup monitoring for memory cache.
 */

import { MemoryCache } from './memory-cache';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CacheCleanup');
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start periodic cache cleanup monitoring
 */
export function startCacheCleanup(intervalMs: number = 60000) {
	if (cleanupInterval) {
		return false;
	}

	cleanupInterval = setInterval(() => {
		const cache = MemoryCache.getInstance();
		const stats = cache.getCacheStats();

		// If cache is over 80% full, log cleanup suggestion
		if (stats.percentage > 80) {
			log.info(
				{ percentage: stats.percentage.toFixed(1) },
				'Cache usage high, automatic cleanup will trigger'
			);
			// The MemoryCache class handles automatic cleanup when adding new items
			// This is just for monitoring
		}
	}, intervalMs);

	if (
		typeof cleanupInterval === 'object' &&
		cleanupInterval !== null &&
		'unref' in cleanupInterval
	) {
		cleanupInterval.unref();
	}

	return true;
}

/**
 * Stop periodic cache cleanup monitoring.
 */
export function stopCacheCleanup() {
	if (!cleanupInterval) {
		return false;
	}

	clearInterval(cleanupInterval);
	cleanupInterval = null;
	return true;
}

/**
 * Check whether cleanup interval is currently active.
 */
export function isCacheCleanupRunning() {
	return cleanupInterval !== null;
}
