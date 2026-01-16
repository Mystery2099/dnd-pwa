/**
 * Characters API Endpoint
 *
 * GET /api/characters - List all characters for the current user
 * GET /api/characters/[id] - Get a single character
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { characterRepository } from '$lib/server/repositories/characters';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CharactersAPI');

/**
 * GET /api/characters
 * Returns all characters for the authenticated user.
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = requireUser(locals);
		log.debug({ username: user.username }, 'Fetching characters list');
		const db = await import('$lib/server/db').then((m) => m.getDb());

		const characters = await characterRepository.listByOwner(db, user.username);
		log.info({ username: user.username, count: characters.length }, 'Characters list retrieved');

		return json(characters);
	} catch (error) {
		log.error({ error }, 'Error fetching characters');
		return json({ error: 'Failed to fetch characters' }, { status: 500 });
	}
};
