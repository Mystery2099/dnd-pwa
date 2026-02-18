/**
 * Homebrew API Endpoint
 *
 * GET /api/homebrew - List all homebrew items (visible to all users)
 * POST /api/homebrew - Create a new homebrew item
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { createHomebrewItem, getAllHomebrewItems, invalidateCompendiumCache } from '$lib/server/repositories/compendium';
import { createModuleLogger } from '$lib/server/logger';
import { homebrewItemSchema, type HomebrewItemInput } from '$lib/server/validators/homebrew';
import { HOMEBREW_TYPE_TO_DB_TYPE } from '$lib/core/constants/compendium';

const log = createModuleLogger('HomebrewAPI');

/**
 * GET /api/homebrew
 * Returns all homebrew items (visible to all authenticated users).
 * Includes ownership info for UI to show edit/delete buttons appropriately.
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const user = requireUser(locals);
		log.debug({ username: user.username }, 'Fetching all homebrew items');

		const items = await getAllHomebrewItems();

		// Group by type for easier UI consumption
		const groupedByType = items.reduce(
			(acc, item) => {
				if (!acc[item.type]) {
					acc[item.type] = [];
				}
				acc[item.type].push(item);
				return acc;
			},
			{} as Record<string, typeof items>
		);

		log.info({ username: user.username, count: items.length }, 'Homebrew items retrieved');

		return json({
			items,
			groupedByType,
			total: items.length,
			currentUser: user.username,
			isAdmin: user.role === 'admin'
		});
	} catch (error) {
		log.error({ error }, 'Error fetching homebrew items');
		return json({ error: 'Failed to fetch homebrew items' }, { status: 500 });
	}
};

/**
 * POST /api/homebrew
 * Creates a new homebrew item for the authenticated user.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const user = requireUser(locals);
		log.debug({ username: user.username }, 'Creating homebrew item');

		const body = await request.json();

		// Validate the input
		const validationResult = homebrewItemSchema.safeParse(body);
		if (!validationResult.success) {
			log.warn({ errors: validationResult.error.issues }, 'Validation failed');
			return json({ error: 'Validation failed', details: validationResult.error.issues }, { status: 400 });
		}

		const itemData: HomebrewItemInput = validationResult.data;

		// Convert plural form (spells) to singular DB type (spell) for compendium queries
		const normalizedType = HOMEBREW_TYPE_TO_DB_TYPE[itemData.type] || itemData.type;
		const normalizedItemData = { ...itemData, type: normalizedType };

		const itemId = await createHomebrewItem(normalizedItemData, user.username);

		// Invalidate cache for the item type
		invalidateCompendiumCache(normalizedType);

		log.info({ itemId, username: user.username, type: itemData.type }, 'Homebrew item created');

		return json({ success: true, id: itemId }, { status: 201 });
	} catch (error) {
		log.error({ error }, 'Error creating homebrew item');
		return json({ error: 'Failed to create homebrew item' }, { status: 500 });
	}
};
