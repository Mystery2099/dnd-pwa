/**
 * Cache Version Store
 *
 * Manages cache versioning for server-first architecture.
 * Stores and retrieves cache version in IndexedDB, compares with server version.
 */

import { get, set } from 'idb-keyval';
import { browser } from '$app/environment';

const CACHE_VERSION_KEY = 'grimar-cache-version';

export interface CacheVersion {
	version: string;
	timestamp: number;
}

const DEFAULT_VERSION: CacheVersion = {
	version: 'initial',
	timestamp: Date.now()
};

/**
 * Get the current cached version from IndexedDB.
 */
export async function getCachedVersion(): Promise<CacheVersion> {
	if (!browser) return DEFAULT_VERSION;

	try {
		const stored = await get<string>(CACHE_VERSION_KEY);
		if (stored) {
			return JSON.parse(stored) as CacheVersion;
		}
	} catch (error) {
		console.error('[CacheVersion] Error reading version:', error);
	}
	return DEFAULT_VERSION;
}

/**
 * Set the cache version in IndexedDB.
 */
export async function setCachedVersion(version: string, timestamp?: number): Promise<void> {
	if (!browser) return;

	try {
		const value: CacheVersion = {
			version,
			timestamp: timestamp ?? Date.now()
		};
		await set(CACHE_VERSION_KEY, JSON.stringify(value));
		console.log('[CacheVersion] Version updated:', version);
	} catch (error) {
		console.error('[CacheVersion] Error saving version:', error);
	}
}

/**
 * Check if the cached version matches the server version.
 */
export async function isCacheValid(serverVersion: string): Promise<boolean> {
	const cached = await getCachedVersion();
	return cached.version === serverVersion;
}

/**
 * Invalidate the cache by clearing the version.
 */
export async function invalidateCache(): Promise<void> {
	await setCachedVersion('invalidated', Date.now());
}

/**
 * Get the version string only.
 */
export async function getVersionString(): Promise<string> {
	const cached = await getCachedVersion();
	return cached.version;
}
