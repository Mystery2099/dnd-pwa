/**
 * Characters API Endpoint
 *
 * GET /api/characters - List all characters for the current user
 * GET /api/characters/[id] - Get a single character
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth/auth-service';
import { listByOwner } from '$lib/server/repositories/characters';

/**
 * GET /api/characters
 * Returns all characters for the authenticated user.
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = requireUser(locals);
		const db = await import('$lib/server/db').then((m) => m.getDb());

		const characters = await listByOwner(db, user.username);

		return json(characters, {
			headers: {
				'Cache-Control': 'private, max-age=120' // 2 minutes
			}
		});
	} catch (error) {
		console.error('[API/characters] Error fetching characters:', error);
		return json({ error: 'Failed to fetch characters' }, { status: 500 });
	}
};
