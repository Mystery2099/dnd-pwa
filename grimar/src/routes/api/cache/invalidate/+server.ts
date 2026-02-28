/**
 * Cache Invalidation API Endpoint
 *
 * POST /api/cache/invalidate
 * Admin endpoint to trigger cache invalidation across all clients.
 * This is called after sync operations complete.
 */

import crypto from 'node:crypto';
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

		// Always require a valid sync token
		const authHeader = request.headers.get('authorization');
		const syncToken = process.env.ADMIN_SYNC_TOKEN;

		if (!syncToken) {
			throw error(500, 'ADMIN_SYNC_TOKEN is not configured');
		}

		const expectedHeader = `Bearer ${syncToken}`;
		if (
			!authHeader ||
			authHeader.length !== expectedHeader.length ||
			!crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedHeader))
		) {
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
