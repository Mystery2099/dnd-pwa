/**
 * TanStack Query Client Configuration
 *
 * Server-first architecture with offline support.
 * - Server is single source of truth
 * - IndexedDB persistence for offline access
 * - Hybrid sync (SSE + pull on reconnect)
 */

import { QueryClient } from '@tanstack/svelte-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { browser } from '$app/environment';
import { getCachedVersion, setCachedVersion } from './cache-version';
import type { CacheVersion } from './cache-version';
import { settingsStore } from './settingsStore.svelte';

// Cache configuration
const CACHE_KEY = 'grimar-query-cache';
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const BUSIER = 'v1'; // Change to invalidate all cached data

/**
 * Query client instance (set during initialization).
 */
export let queryClient: QueryClient | null = null;

/**
 * Set the query client instance (for use with cache-sync).
 */
export function setQueryClient(client: QueryClient) {
	queryClient = client;
}

/**
 * Create a new QueryClient with server-first configuration.
 */
export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Persistence settings
				gcTime: CACHE_MAX_AGE, // Keep in cache for 7 days

				// Network-first strategy: try network, fall back to cache
				staleTime: 5 * 60 * 1000, // 5 minutes - consider fresh after 5 min

				// Retry configuration
				retry: 3,
				retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

				// Don't refetch on window focus in offline mode
				refetchOnWindowFocus: browser ? () => navigator.onLine : false,

				// Don't refetch on reconnect automatically (let SSE handle it)
				refetchOnReconnect: false
			},
			mutations: {
				retry: 1
			}
		}
	});
}

/**
 * Create an async storage persister for IndexedDB.
 */
function createPersister() {
	if (!browser) return null;

	return createAsyncStoragePersister({
		storage: window.localStorage,
		key: CACHE_KEY,
		throttleTime: 1000
	});
}

/**
 * Initialize persistence and cache version validation.
 * This is called asynchronously after initial render.
 */
export async function initializePersistence(client: QueryClient): Promise<void> {
	if (!browser) return;

	// Check if offline data is enabled
	if (!settingsStore.settings.offlineEnabled) {
		console.log('[QueryClient] Offline data disabled');
		return;
	}

	const persister = createPersister();
	if (!persister) return;

	// Setup persistence
	persistQueryClient({
		queryClient: client,
		persister,
		maxAge: CACHE_MAX_AGE,
		buster: BUSIER
	});

	console.log('[QueryClient] Persistence enabled');

	// Validate cache version on startup
	try {
		const response = await fetch('/api/cache/version');
		if (response.ok) {
			const serverVersion: CacheVersion = await response.json();
			const cachedVersion = await getCachedVersion();

			// If version mismatch, invalidate cache
			if (cachedVersion.version !== serverVersion.version) {
				console.log('[QueryClient] Cache version mismatch, invalidating...');
				await setCachedVersion(serverVersion.version, serverVersion.timestamp);
				await client.invalidateQueries();
			}
		}
	} catch (error) {
		console.error('[QueryClient] Version check failed:', error);
		// Continue with cached data
	}
}
