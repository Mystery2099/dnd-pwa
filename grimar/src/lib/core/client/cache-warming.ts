/**
 * Cache Warming Module
 *
 * Proactively loads commonly accessed data to improve perceived performance.
 * Warm cache on app start for default compendium types.
 */

import { browser } from '$app/environment';
import { queryClient } from './query-client';
import { fetchCompendiumList } from './queries';

/**
 * Compendium types to preload, ordered by likely usage frequency.
 */
const WARM_COMENDIUM_TYPES = [
	'spells',
	'monsters',
	'items',
	'backgrounds',
	'classes',
	'races',
	'subclasses'
] as const;

type CompendiumType = (typeof WARM_COMENDIUM_TYPES)[number];

/**
 * Prefetch a compendium list if not already cached.
 */
async function warmCompendiumCache(type: CompendiumType): Promise<void> {
	if (!browser || !queryClient) return;

	const queryKey = ['compendium', 'list', type];

	// Check if already cached
	const data = queryClient.getQueryData(queryKey);
	if (data) return;

	// Prefetch with short staleTime (we just want to populate cache)
	try {
		await queryClient.prefetchQuery({
			queryKey,
			queryFn: () => fetchCompendiumList(type),
			staleTime: 10 * 60 * 1000 // 10 minutes once loaded
		});
	} catch {
		// Silently fail - warming is best-effort
	}
}

/**
 * Warm all default caches on app start.
 * Runs in parallel, completes as fast as possible.
 */
export async function warmDefaultCaches(): Promise<void> {
	if (!browser) return;

	const start = performance.now();

	// Prefetch all compendium types in parallel
	await Promise.all(WARM_COMENDIUM_TYPES.map((type) => warmCompendiumCache(type)));

	const duration = performance.now() - start;
	console.log(`[cache-warming] Warmed caches in ${duration.toFixed(0)}ms`);
}

/**
 * Prefetch a specific compendium type on demand.
 */
export async function warmCompendium(type: string): Promise<void> {
	if (!browser) return;

	if (WARM_COMENDIUM_TYPES.includes(type as CompendiumType)) {
		await warmCompendiumCache(type as CompendiumType);
	}
}

/**
 * Initialize cache warming on app mount.
 * Call this from layout onMount.
 */
export function initCacheWarming(): void {
	if (!browser) return;

	// Warm caches after a short delay to prioritize initial render
	setTimeout(warmDefaultCaches, 100);
}
