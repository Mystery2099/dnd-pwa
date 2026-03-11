/**
 * Cache Sync Module
 *
 * Handles SSE connections for cache invalidation and hybrid sync.
 * Connects to server to receive push notifications when cache is updated.
 */

import { browser, dev } from '$app/environment';
import { queryClient } from './query-client';
import { setCachedVersion, getCachedVersion, type CacheVersion } from './cache-version';
import { queryKeys } from './queries';
import { offlineStore } from './offline-store';

const SSE_ENDPOINT = '/api/cache/events';
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

interface CacheEvent {
	type: 'version_update' | 'invalidate' | 'heartbeat';
	version?: string;
	timestamp?: number;
}

class CacheSync {
	private eventSource: EventSource | null = null;
	private reconnectAttempts = 0;
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	private isConnected = false;
	private listeners: Set<(event: CacheEvent) => void> = new Set();

	private logDebug(...args: unknown[]): void {
		if (dev) console.log(...args);
	}

	/**
	 * Start the SSE connection for cache sync.
	 */
	connect(): void {
		if (!browser) return;
		if (dev) {
			this.logDebug('[CacheSync] Disabled in dev mode');
			return;
		}
		if (this.eventSource) return; // Already connected

		this.logDebug('[CacheSync] Connecting to SSE...');
		this.createConnection();
	}

	private createConnection(): void {
		try {
			this.eventSource = new EventSource(SSE_ENDPOINT);

			this.eventSource.onopen = () => {
				this.isConnected = true;
				this.reconnectAttempts = 0;
				this.logDebug('[CacheSync] SSE connected');
				offlineStore.resetReconnectAttempts();
			};

			this.eventSource.onmessage = (event) => {
				try {
					const data: CacheEvent = JSON.parse(event.data);
					this.handleEvent(data);
				} catch (error) {
					console.error('[CacheSync] Error parsing SSE message:', error);
				}
			};

			this.eventSource.onerror = () => {
				if (this.eventSource) {
					this.eventSource.close();
					this.eventSource = null;
				}
				this.isConnected = false;
				this.scheduleReconnect();
			};
		} catch (error) {
			console.error('[CacheSync] Failed to create SSE connection:', error);
			this.scheduleReconnect();
		}
	}

	private handleEvent(event: CacheEvent): void {
		this.logDebug('[CacheSync] Received event:', event.type, event.version);

		switch (event.type) {
			case 'version_update':
				if (event.version) {
					this.handleVersionUpdate(event.version, event.timestamp);
				}
				break;
			case 'invalidate':
				this.handleInvalidate();
				break;
			case 'heartbeat':
				// Just acknowledge, no action needed
				break;
		}

		// Notify listeners
		for (const listener of this.listeners) {
			listener(event);
		}
	}

	private async handleVersionUpdate(version: string, timestamp?: number): Promise<void> {
		const currentVersion = await getCachedVersion();

		if (currentVersion.version === version) {
			this.logDebug('[CacheSync] Version unchanged, skipping invalidation:', version);
			return;
		}

		// Update cached version
		await setCachedVersion(version, timestamp);

		await this.invalidateQueryScopes(['compendium', 'cache']);

		this.logDebug('[CacheSync] Cache invalidated, version:', version);
	}

	private async handleInvalidate(): Promise<void> {
		await this.invalidateQueryScopes(['compendium', 'cache']);
		this.logDebug('[CacheSync] Cache invalidated');
	}

	private async invalidateQueryScopes(scopes: Array<'compendium' | 'characters' | 'cache'>): Promise<void> {
		if (!queryClient) return;

		const invalidations: Promise<unknown>[] = [];
		for (const scope of scopes) {
			if (scope === 'compendium') {
				invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.compendium.all }));
			} else if (scope === 'characters') {
				invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.characters.all }));
			} else if (scope === 'cache') {
				invalidations.push(queryClient.invalidateQueries({ queryKey: queryKeys.cache.version }));
			}
		}

		await Promise.all(invalidations);
	}

	private scheduleReconnect(): void {
		if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
			console.warn('[CacheSync] Max reconnect attempts reached, stopping...');
			return;
		}

		this.reconnectAttempts++;
		offlineStore.incrementReconnectAttempts();

		const delay = RECONNECT_DELAY * Math.pow(1.5, this.reconnectAttempts - 1);
		this.logDebug(`[CacheSync] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

		this.reconnectTimeout = setTimeout(() => {
			this.createConnection();
		}, delay);
	}

	/**
	 * Disconnect the SSE connection.
	 */
	disconnect(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}

		this.isConnected = false;
		this.logDebug('[CacheSync] Disconnected');
	}

	/**
	 * Check if currently connected.
	 */
	get connected() {
		return this.isConnected;
	}

	/**
	 * Subscribe to cache events.
	 */
	subscribe(listener: (event: CacheEvent) => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/**
	 * Force an immediate sync by fetching the latest version.
	 */
	async forceSync(): Promise<void> {
		if (!browser) return;

		try {
			const response = await fetch('/api/cache/version');
			if (response.ok) {
				const data: CacheVersion = await response.json();
				const currentVersion = await getCachedVersion();

				// Only invalidate if versions differ
				if (currentVersion.version !== data.version) {
					await setCachedVersion(data.version, data.timestamp);
					await this.invalidateQueryScopes(['compendium', 'cache']);
				}
			}
		} catch (error) {
			console.error('[CacheSync] Force sync failed:', error);
		}
	}
}

/**
 * Singleton instance of cache sync.
 */
export const cacheSync = new CacheSync();

/**
 * Start cache sync when online.
 */
export function startCacheSync(): () => void {
	if (!browser) {
		return () => {};
	}

	// Start SSE connection
	cacheSync.connect();

	// Listen for online events to force sync on reconnect
	const unsubscribe = offlineStore.subscribe((state) => {
		if (state.isOnline && !cacheSync.connected) {
			cacheSync.forceSync();
		}
	});

	// Return cleanup function
	return () => {
		unsubscribe();
		cacheSync.disconnect();
	};
}
