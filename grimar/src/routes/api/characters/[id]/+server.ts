/**
 * Single Character API Endpoint
 *
 * GET /api/characters/[id]
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth/auth-service';
import { getCharacter } from '$lib/server/repositories/characters';

/**
 * GET /api/characters/[id]
 * Returns a single character by ID, scoped to the authenticated user.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const user = requireUser(locals);
		const id = parseInt(params.id);

		if (isNaN(id)) {
			throw error(400, 'Invalid character ID');
		}

		const db = await import('$lib/server/db').then((m) => m.getDb());
		const character = await getCharacter(db, id, user.username);

		if (!character) {
			throw error(404, 'Character not found');
		}

		return json(character, {
			headers: {
				'Cache-Control': 'private, max-age=120' // 2 minutes
			}
		});
	} catch (err) {
		if ((err as { status?: number }).status) throw err;
		console.error('[API/characters/[id]] Error fetching character:', err);
		return json({ error: 'Failed to fetch character' }, { status: 500 });
	}
};
