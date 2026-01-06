/**
 * Single Character API Endpoint
 *
 * GET /api/characters/[id]
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth/auth-service';
import { characterRepository } from '$lib/server/repositories/characters';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CharacterAPI');

/**
 * GET /api/characters/[id]
 * Returns a single character by ID, scoped to the authenticated user.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const user = requireUser(locals);
		const id = parseInt(params.id);

		if (isNaN(id)) {
			log.warn({ characterId: params.id, reason: 'Invalid ID format' }, 'Invalid character ID');
			throw error(400, 'Invalid character ID');
		}

		log.debug({ username: user.username, characterId: id }, 'Fetching character');
		const db = await import('$lib/server/db').then((m) => m.getDb());
		const character = await characterRepository.getCharacter(db, id, user.username);

		if (!character) {
			log.warn({ username: user.username, characterId: id }, 'Character not found');
			throw error(404, 'Character not found');
		}

		log.info(
			{ username: user.username, characterId: id, name: character.name },
			'Character retrieved'
		);
		return json(character);
	} catch (err) {
		if ((err as { status?: number }).status) throw err;
		log.error({ error: err, characterId: params.id }, 'Error fetching character');
		return json({ error: 'Failed to fetch character' }, { status: 500 });
	}
};
