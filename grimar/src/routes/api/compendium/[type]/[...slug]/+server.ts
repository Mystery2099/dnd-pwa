import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getDbTypeFromPath } from '$lib/core/constants/compendium';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumDetailAPI');

/**
 * GET /api/compendium/{type}/providers/{source}/{id}
 * Fetches a single compendium item by type and slug.
 *
 * The slug format is: providers/source/id (captured as [...slug] catch-all)
 * Example: /api/compendium/spells/providers/srd-2024/acid-arrow
 *
 * The API reconstructs externalId as: {source}_{id}
 */
export const GET: RequestHandler = async ({ params }) => {
	const { type, slug } = params;

	log.info({ type, slug, slugType: typeof slug }, 'Compendium detail request');

	try {
		// slug is an array with [...slug] catch-all parameter
		const slugArray = Array.isArray(slug) ? slug : [slug];
		log.info({ slugArray }, 'Parsed slug array');

		if (slugArray.length !== 3 || slugArray[0] !== 'providers') {
			log.warn({ slugArray }, 'Invalid slug format');
			return json({ error: 'Invalid slug format' }, { status: 400 });
		}

		const [_providers, source, id] = slugArray;

		// Reconstruct the full externalId
		const externalId = `${source}_${id}`;

		// Convert URL path type to database type
		const dbType = getDbTypeFromPath(type);
		log.info(
			{ type, dbType, source, id, externalId },
			'Converted type and reconstructed externalId'
		);

		const db = await getDb();

		log.info({ externalId }, 'Searching for item by externalId');

		const item = await db
			.select()
			.from(compendiumItems)
			.where(eq(compendiumItems.externalId, externalId))
			.limit(1);

		log.info(
			{
				found: item.length > 0,
				dbType,
				externalId,
				item: item[0]
					? {
							id: item[0].id,
							name: item[0].name,
							type: item[0].type,
							externalId: item[0].externalId
						}
					: null
			},
			'Database query result'
		);

		if (item.length === 0) {
			log.warn({ type, slug, source, id, externalId, dbType }, 'Compendium item not found');
			return json({ error: 'Item not found' }, { status: 404 });
		}

		return json(item[0]);
	} catch (error) {
		log.error({ error, type, slug }, 'Error fetching compendium item');
		return json({ error: 'Failed to fetch compendium item' }, { status: 500 });
	}
};
