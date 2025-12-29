/**
 * Memory Cache
 *
 * In-memory cache for server-side data with TTL expiration and LRU eviction.
 */

import type { CacheEntry, CacheStats } from './cache-types';

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
			return null;
		}

		// Check if expired
		if (Date.now() > entry.expires) {
			this.cache.delete(key);
			return null;
		}

		return entry.data as T;
	}

	set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
		const expires = Date.now() + ttl;

		// Check if we need to make space
		if (this.cache.size >= this.maxSize) {
			this.evictOldest();
		}

		this.cache.set(key, { data, expires, ttl });
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	invalidatePattern(pattern: string): void {
		const regex = new RegExp(pattern.replace(/\*/g, '.*'));
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.cache.delete(key);
			}
		}
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
		}
	}
}

// Export singleton instance
export const memoryCache = MemoryCache.getInstance();
