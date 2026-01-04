/**
 * Server-Side Cache Version Store
 *
 * Manages cache versioning for invalidation. Uses in-memory storage
 * since this is a single-instance deployment.
 */

let currentVersion = {
	version: 'v1',
	timestamp: Date.now()
};

/**
 * Get the current cache version.
 */
export function getCacheVersion() {
	return currentVersion;
}

/**
 * Set a new cache version (triggers client invalidation).
 */
export function setCacheVersion(version: string): { version: string; timestamp: number } {
	currentVersion = {
		version,
		timestamp: Date.now()
	};
	console.log('[CacheVersion] Version updated:', version);
	return currentVersion;
}

/**
 * Get version as JSON string for SSE events.
 */
export function getVersionJson(): string {
	return JSON.stringify({
		type: 'version_update',
		version: currentVersion.version,
		timestamp: currentVersion.timestamp
	});
}

/**
 * Get invalidation event for SSE.
 */
export function getInvalidateEvent(): string {
	return JSON.stringify({
		type: 'invalidate',
		timestamp: Date.now()
	});
}

/**
 * Get heartbeat event for SSE.
 */
export function getHeartbeatEvent(): string {
	return JSON.stringify({
		type: 'heartbeat',
		timestamp: Date.now()
	});
}
