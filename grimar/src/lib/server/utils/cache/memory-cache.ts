/**
 * Memory Cache
 *
 * In-memory cache for server-side data with TTL expiration and LRU eviction.
 */

import type { CacheEntry, CacheStats } from './cache-types';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('MemoryCache');

// Configuration constants
const DEFAULT_MAX_SIZE = 1000;
const DEFAULT_MAX_MEMORY = 50 * 1024 * 1024; // 50MB
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export class MemoryCache {
	private static instance: MemoryCache;
	private cache = new Map<string, CacheEntry>();
	private maxSize = DEFAULT_MAX_SIZE;
	private maxMemory = DEFAULT_MAX_MEMORY;

	private constructor() {}

	static getInstance(): MemoryCache {
		if (!MemoryCache.instance) {
			MemoryCache.instance = new MemoryCache();
		}
		return MemoryCache.instance;
	}

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) {
			log.debug({ key }, 'Cache miss');
			return null;
		}

		// Check if expired
		if (Date.now() > entry.expires) {
			this.cache.delete(key);
			log.debug({ key }, 'Cache entry expired');
			return null;
		}

		log.debug({ key }, 'Cache hit');
		return entry.data as T;
	}

	set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
		const expires = Date.now() + ttl;

		// Check if we need to make space
		if (this.cache.size >= this.maxSize) {
			log.debug(
				{ key, currentSize: this.cache.size, maxSize: this.maxSize },
				'Cache full, evicting oldest'
			);
			this.evictOldest();
		}

		this.cache.set(key, { data, expires, ttl });
		log.debug({ key, ttl }, 'Cache entry set');
	}

	delete(key: string): boolean {
		const deleted = this.cache.delete(key);
		log.debug({ key, deleted }, 'Cache entry deleted');
		return deleted;
	}

	clear(): void {
		const count = this.cache.size;
		this.cache.clear();
		log.info({ count }, 'Cache cleared');
	}

	invalidatePattern(pattern: string): void {
		const regex = new RegExp(pattern.replace(/\*/g, '.*'));
		let invalidatedCount = 0;
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
				invalidatedCount++;
			}
		}
		log.info({ pattern, invalidatedCount }, 'Cache entries invalidated by pattern');
	}

	getCacheStats(): CacheStats {
		let used = 0;
		for (const entry of this.cache.values()) {
			used += JSON.stringify(entry).length;
		}

		return {
			used,
			max: this.maxMemory,
			percentage: (used / this.maxMemory) * 100
		};
	}

	private evictOldest(): void {
		let oldestKey = '';
		let oldestTime = Date.now();

		for (const [key, entry] of this.cache.entries()) {
			if (entry.expires < oldestTime) {
				oldestTime = entry.expires;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
			log.debug({ evictedKey: oldestKey }, 'Evicted oldest cache entry');
		}
	}
}

// Export singleton instance
export const memoryCache = MemoryCache.getInstance();
