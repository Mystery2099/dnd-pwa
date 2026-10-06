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
import { browser } from '$app/environment';
import { clear } from 'idb-keyval';
import { createIdbPersister } from './idb-persister';
import { getCachedVersion, setCachedVersion } from './cache-version';
import type { CacheVersion } from './cache-version';
import { userSettingsStore } from './userSettingsStore.svelte';
import { queryKeys } from './queries';

// Cache configuration
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
let activePersister: ReturnType<typeof createIdbPersister> | null = null;

/**
 * Clear all query cache from IndexedDB.
 */
export async function clearQueryCache(): Promise<void> {
	if (!browser) return;
	await activePersister?.removeClient();
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
export async function initializePersistence(client: QueryClient): Promise<() => void> {
	if (!browser) return () => {};

	// Check if offline data is enabled (from server settings)
	if (!userSettingsStore.data.offlineEnabled) {
		console.log('[QueryClient] Offline data disabled');
		return () => {};
	}

	const persister = createIdbPersister();
	activePersister = persister;

	// Setup persistence
	const [unsubscribe, restored] = persistQueryClient({
		queryClient: client,
		persister,
		maxAge: CACHE_MAX_AGE,
		buster: BUSIER
	});
	await restored;
	const flushWhenHidden = () => {
		if (document.visibilityState === 'hidden') void persister.flush();
	};
	document.addEventListener('visibilitychange', flushWhenHidden);

	console.log('[QueryClient] Persistence enabled with idb-keyval');

	// Validate cache version on startup
	try {
		const response = await fetch('/api/cache/version', { signal: AbortSignal.timeout(5000) });
		if (response.ok) {
			const serverVersion: CacheVersion = await response.json();
			const cachedVersion = await getCachedVersion();

			// If version mismatch, invalidate cache
			if (cachedVersion.version !== serverVersion.version) {
				console.log('[QueryClient] Cache version mismatch, invalidating...');
				await setCachedVersion(serverVersion.version, serverVersion.timestamp);
				await Promise.all([
					client.invalidateQueries({ queryKey: queryKeys.compendium.all }),
					client.invalidateQueries({ queryKey: queryKeys.cache.version })
				]);
			}
		}
	} catch (error) {
		console.error('[QueryClient] Version check failed:', error);
		// Continue with cached data
	}
	return () => {
		unsubscribe();
		document.removeEventListener('visibilitychange', flushWhenHidden);
		void persister.flush();
		if (activePersister === persister) activePersister = null;
	};
}
