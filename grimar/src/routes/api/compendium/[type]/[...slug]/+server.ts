import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendium } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getDbTypeFromPath } from '$lib/core/constants/compendium';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumDetailAPI');

/**
 * GET /api/compendium/{type}/{key}
 * Fetches a single compendium item by type and key.
 * Example: /api/compendium/spells/srd-2014_fireball
 */
export const GET: RequestHandler = async ({ params }) => {
	const { type, slug } = params;

	log.info({ type, slug }, 'Compendium detail request');

	try {
		const dbType = getDbTypeFromPath(type);
		
		// slug is the key (e.g., 'srd-2014_fireball')
		const key = Array.isArray(slug) ? slug.join('/') : slug;

		const db = await getDb();

		const item = await db
			.select()
			.from(compendium)
			.where(and(eq(compendium.key, key), eq(compendium.type, dbType)))
			.limit(1);

		if (item.length === 0) {
			log.warn({ type, key, dbType }, 'Compendium item not found');
			return json({ error: 'Item not found' }, { status: 404 });
		}

		return json(item[0]);
	} catch (error) {
		log.error({ error, type, slug }, 'Error fetching compendium item');
		return json({ error: 'Failed to fetch compendium item' }, { status: 500 });
	}
};
