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
	private maxSize: number;
	private maxMemory: number;
	private usedBytes = 0;

	constructor(options: { maxSize?: number; maxMemory?: number } = {}) {
		this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
		this.maxMemory = options.maxMemory ?? DEFAULT_MAX_MEMORY;
	}

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
			this.delete(key);
			log.debug({ key }, 'Cache entry expired');
			return null;
		}

		// Map insertion order tracks least recently used entries.
		this.cache.delete(key);
		this.cache.set(key, entry);
		log.debug({ key }, 'Cache hit');
		return entry.data as T;
	}

	set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
		// Account for serialized UTF-8 payload size once, not on every stats read.
		// This bounds cached payload bytes; it is not an exact V8 heap measurement.
		const bytes = Buffer.byteLength(key) + Buffer.byteLength(JSON.stringify(data) ?? '');
		this.delete(key);
		if (ttl <= 0 || bytes > this.maxMemory || this.maxSize <= 0) return;

		while (this.cache.size >= this.maxSize || this.usedBytes + bytes > this.maxMemory) {
			const oldestKey = this.cache.keys().next().value;
			if (oldestKey === undefined) break;
			this.delete(oldestKey);
		}

		const expires = Date.now() + ttl;
		this.cache.set(key, { data, expires, ttl, bytes });
		this.usedBytes += bytes;
		log.debug({ key, ttl }, 'Cache entry set');
	}

	delete(key: string): boolean {
		const entry = this.cache.get(key);
		if (entry) this.usedBytes -= entry.bytes;
		const deleted = this.cache.delete(key);
		log.debug({ key, deleted }, 'Cache entry deleted');
		return deleted;
	}

	clear(): void {
		const count = this.cache.size;
		this.cache.clear();
		this.usedBytes = 0;
		log.info({ count }, 'Cache cleared');
	}

	invalidatePattern(pattern: string): void {
		const regex = new RegExp(pattern.replace(/\*/g, '.*'));
		let invalidatedCount = 0;
		for (const key of this.cache.keys()) {
			if (regex.test(key)) {
				this.delete(key);
				invalidatedCount++;
			}
		}
		log.info({ pattern, invalidatedCount }, 'Cache entries invalidated by pattern');
	}

	getCacheStats(): CacheStats {
		return {
			used: this.usedBytes,
			max: this.maxMemory,
			percentage: (this.usedBytes / this.maxMemory) * 100
		};
	}

	pruneExpired(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (entry.expires < now) this.delete(key);
		}
	}
}

// Export singleton instance
export const memoryCache = MemoryCache.getInstance();
