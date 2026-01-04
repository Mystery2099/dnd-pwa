/**
 * Cache Version API Endpoint
 *
 * GET /api/cache/version
 * Returns the current cache version for invalidation checks.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCacheVersion } from '$lib/server/cache-version';

/**
 * GET /api/cache/version
 * Returns the current cache version and timestamp.
 */
export const GET: RequestHandler = async () => {
	try {
		const version = getCacheVersion();

		return json({
			version: version.version,
			timestamp: version.timestamp
		});
	} catch (error) {
		console.error('[API/cache/version] Error:', error);
		return json({ error: 'Failed to get cache version' }, { status: 500 });
	}
};
