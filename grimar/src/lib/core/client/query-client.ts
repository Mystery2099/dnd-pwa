/**
 * TanStack Query Client Configuration
 *
 * Server-first architecture with offline support.
 * - Server is single source of truth
 * - IndexedDB persistence via idb-keyval for offline access
 * - Hybrid sync (SSE + pull on reconnect)
 */

import { QueryClient } from '@tanstack/svelte-query';
import { persistQueryClient } from '@tanstack/svelte-query-persist-client';
import type { Persister, PersistedClient } from '@tanstack/query-persist-client-core';
import { browser } from '$app/environment';
import { get, set, del, clear } from 'idb-keyval';
import { getCachedVersion, setCachedVersion } from './cache-version';
import type { CacheVersion } from './cache-version';
import { settingsStore } from './settingsStore.svelte';
import { userSettingsStore } from './userSettingsStore.svelte';

// Cache configuration
const CACHE_KEY = 'grimar-query-cache';
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const BUSIER = 'v2'; // Change to invalidate all cached data

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
 * Create an async storage persister using idb-keyval.
 * This provides better performance than localStorage (async, larger storage).
 */
function createIdbPersister(): Persister | null {
	if (!browser) return null;

	return {
		persistClient: async (client: PersistedClient) => {
			await set(CACHE_KEY, JSON.stringify(client));
		},
		restoreClient: async () => {
			const data = await get<string>(CACHE_KEY);
			if (!data) return undefined;
			try {
				return JSON.parse(data);
			} catch {
				return undefined;
			}
		},
		removeClient: async () => {
			await del(CACHE_KEY);
		}
	};
}

/**
 * Clear all query cache from IndexedDB.
 */
export async function clearQueryCache(): Promise<void> {
	if (!browser) return;
	await clear();
	console.log('[QueryClient] Cache cleared');
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
				refetchOnReconnect: false,

				// Network mode for offline-first behavior
				networkMode: 'offlineFirst'
			},
			mutations: {
				retry: 1,
				networkMode: 'offlineFirst'
			}
		}
	});
}

/**
 * Initialize persistence and cache version validation.
 * This is called asynchronously after initial render.
 */
export async function initializePersistence(client: QueryClient): Promise<void> {
	if (!browser) return;

	// Check if offline data is enabled (from server settings)
	if (!userSettingsStore.data.offlineEnabled) {
		console.log('[QueryClient] Offline data disabled');
		return;
	}

	const persister = createIdbPersister();
	if (!persister) return;

	// Setup persistence
	persistQueryClient({
		queryClient: client,
		persister,
		maxAge: CACHE_MAX_AGE,
		buster: BUSIER
	});

	console.log('[QueryClient] Persistence enabled with idb-keyval');

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
