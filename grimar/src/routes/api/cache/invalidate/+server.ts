/**
 * Cache Invalidation API Endpoint
 *
 * POST /api/cache/invalidate
 * Admin endpoint to trigger cache invalidation across all clients.
 * This is called after sync operations complete.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setCacheVersion } from '$lib/server/cache-version';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CacheInvalidateAPI');

/**
 * POST /api/cache/invalidate
 * Body: { version: string } (optional, auto-generates if not provided)
 *
 * Triggers cache invalidation by updating the server's cache version.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));

		// Optional: require sync token for production
		const authHeader = request.headers.get('authorization');
		const syncToken = process.env.ADMIN_SYNC_TOKEN;

		if (syncToken && authHeader !== `Bearer ${syncToken}`) {
			throw error(401, 'Unauthorized');
		}

		// Generate version if not provided
		const version = body.version || `v${Date.now()}`;
		const newVersion = setCacheVersion(version);

		return json({
			success: true,
			version: newVersion.version,
			timestamp: newVersion.timestamp
		});
	} catch (err) {
		if ((err as { status?: number }).status) throw err;
		log.error({ error: err }, 'Failed to invalidate cache');
		return json({ error: 'Failed to invalidate cache' }, { status: 500 });
	}
};
