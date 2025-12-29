/**
 * Client Cache Manager
 *
 * Manages browser-side cache storage with LRU eviction.
 */

import { browser } from '$app/environment';
import type { CacheStats } from './cache-types';

const CACHE_BUDGET = 50 * 1024 * 1024; // 50MB budget
const EVICTION_THRESHOLD = 0.85; // Evict when 85% full
const BATCH_DELETE_SIZE = 20; // Delete 20 items at a time

interface CacheEntry {
	key: string;
	size: number;
	timestamp: number;
}

export class ClientCacheManager {
	private static instance: ClientCacheManager;
	private listeners: ((stats: CacheStats) => void)[] = [];
	private accessOrder: CacheEntry[] = [];

	static getInstance(): ClientCacheManager {
		if (!ClientCacheManager.instance) {
			ClientCacheManager.instance = new ClientCacheManager();
		}
		return ClientCacheManager.instance;
	}

	/** Get estimated cache stats from localStorage */
	getCacheStats(): CacheStats {
		if (!browser) {
			return {
				total: CACHE_BUDGET,
				used: 0,
				available: CACHE_BUDGET,
				percentage: 0,
				compressionRatio: 1.0
			};
		}

		const cacheKeys = Object.keys(localStorage).filter((k) => k.startsWith('grimar-cache-'));
		let used = 0;

		for (const key of cacheKeys) {
			const value = localStorage.getItem(key);
			if (value) {
				used += new Blob([value]).size;
				// Track for LRU
				const timestamp = this.getTimestamp(key);
				this.accessOrder.push({ key, size: new Blob([value]).size, timestamp });
			}
		}

		// Check if we need to evict
		const percentage = (used / CACHE_BUDGET) * 100;
		if (percentage > EVICTION_THRESHOLD * 100) {
			this.evictOldest();
		}

		const clampedUsed = Math.min(CACHE_BUDGET, used);
		return {
			total: CACHE_BUDGET,
			used: clampedUsed,
			available: Math.max(0, CACHE_BUDGET - clampedUsed),
			percentage,
			compressionRatio: 1.0
		};
	}

	/** Get item with LRU tracking */
	getItem<T>(key: string): T | null {
		if (!browser) return null;

		try {
			const prefixedKey = `grimar-cache-${key}`;
			const value = localStorage.getItem(prefixedKey);

			if (value) {
				// Update access order for LRU
				this.updateAccessOrder(prefixedKey, new Blob([value]).size);
				return JSON.parse(value) as T;
			}
		} catch (error) {
			console.warn('[CLIENT_CACHE] Could not get item:', error);
		}
		return null;
	}

	/** Set item with LRU eviction if needed */
	setItem<T>(key: string, value: T): boolean {
		if (!browser) return false;

		try {
			const prefixedKey = `grimar-cache-${key}`;
			const serialized = JSON.stringify(value);
			const size = new Blob([serialized]).size;

			// Check if we need to make space
			const stats = this.getCacheStats();
			if (stats.used + size > CACHE_BUDGET * EVICTION_THRESHOLD) {
				this.evictOldest();
			}

			localStorage.setItem(prefixedKey, serialized);
			this.updateAccessOrder(prefixedKey, size);
			return true;
		} catch (error) {
			console.warn('[CLIENT_CACHE] Could not set item:', error);
			// Try to evict and retry
			this.evictOldest();
			try {
				const prefixedKey = `grimar-cache-${key}`;
				localStorage.setItem(prefixedKey, JSON.stringify(value));
				return true;
			} catch {
				console.error('[CLIENT_CACHE] Cache full, cannot store:', key);
				return false;
			}
		}
	}

	/** Remove a specific item */
	removeItem(key: string): void {
		if (!browser) return;

		const prefixedKey = `grimar-cache-${key}`;
		localStorage.removeItem(prefixedKey);
		this.accessOrder = this.accessOrder.filter((e) => e.key !== prefixedKey);
	}

	/** Clear all cache items */
	clear(): void {
		if (!browser) return;

		const keys = Object.keys(localStorage).filter((k) => k.startsWith('grimar-cache-'));
		for (const key of keys) {
			localStorage.removeItem(key);
		}
		this.accessOrder = [];
		this.triggerCleanup('manual clear');
	}

	/** Evict oldest/least-used items */
	private evictOldest(): void {
		if (!browser || this.accessOrder.length === 0) return;

		// Sort by timestamp (oldest first)
		const sorted = [...this.accessOrder].sort((a, b) => a.timestamp - b.timestamp);

		// Remove oldest items
		const toRemove = sorted.slice(0, BATCH_DELETE_SIZE);
		let freed = 0;

		for (const entry of toRemove) {
			localStorage.removeItem(entry.key);
			freed += entry.size;
		}

		// Rebuild access order
		this.accessOrder = this.accessOrder.filter((e) => !toRemove.find((r) => r.key === e.key));

		if (freed > 0) {
			this.triggerCleanup(`evicted ${toRemove.length} items, freed ${freed} bytes`);
		}
	}

	/** Update access order when item is accessed */
	private updateAccessOrder(key: string, size: number): void {
		const existing = this.accessOrder.findIndex((e) => e.key === key);
		const timestamp = Date.now();

		if (existing >= 0) {
			this.accessOrder[existing] = { key, size, timestamp };
		} else {
			this.accessOrder.push({ key, size, timestamp });
		}
	}

	/** Get timestamp from storage or default to now */
	private getTimestamp(key: string): number {
		try {
			const metaKey = `${key}:meta`;
			const meta = localStorage.getItem(metaKey);
			if (meta) {
				const parsed = JSON.parse(meta);
				return parsed.timestamp || Date.now();
			}
		} catch {
			// Ignore
		}
		return Date.now();
	}

	/** Register for cache cleanup notifications */
	onCleanup(callback: (reason: string) => void): () => void {
		if (!browser) return () => {};

		const handleCleanup = (event: Event) => {
			const customEvent = event as CustomEvent;
			callback(customEvent.detail.reason);
		};

		window.addEventListener('cache-cleanup', handleCleanup);

		return () => {
			window.removeEventListener('cache-cleanup', handleCleanup);
		};
	}

	/** Trigger cleanup notification */
	private triggerCleanup(reason: string): void {
		if (!browser) return;

		const event = new CustomEvent('cache-cleanup', {
			detail: { reason }
		});
		window.dispatchEvent(event);
	}
}

// Export singleton instance
export const clientCache = ClientCacheManager.getInstance();
