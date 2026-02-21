import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendium } from '$lib/server/db/schema';
import { eq, like, and, or, desc, asc, inArray, sql, type SQL } from 'drizzle-orm';
import { getDbTypeFromPath, DB_TYPES } from '$lib/core/constants/compendium';
import { searchFtsRanked } from '$lib/server/db/db-fts';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumItemsAPI');

/**
 * GET /api/compendium/items?type=spells&page=1&limit=20&search=&sortBy=name&sortOrder=asc
 * Fetches a paginated list of compendium items by type with filtering and sorting.
 */
export const GET: RequestHandler = async ({ url }) => {
	const pathType = url.searchParams.get('type');

	try {
		const all = url.searchParams.get('all') === 'true';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = all ? 10000 : Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
		const search = url.searchParams.get('search') || '';
		const sortBy = url.searchParams.get('sortBy') || 'name';
		const sortOrder = url.searchParams.get('sortOrder') || 'asc';
		const spellLevel = url.searchParams.get('level');
		const spellSchool = url.searchParams.get('school');
		const challengeRating = url.searchParams.get('cr');
		const creatureType = url.searchParams.get('creatureType');
		const gamesystem = url.searchParams.get('gamesystem');

		if (!pathType) {
			return json({ error: 'Missing type parameter' }, { status: 400 });
		}

		const db = await getDb();
		const dbType = getDbTypeFromPath(pathType);

		const conditions: (SQL | undefined)[] = [];

		// Handle items/magicitems as a combined type
		if (dbType === DB_TYPES.ITEMS || dbType === DB_TYPES.MAGIC_ITEMS) {
			conditions.push(or(
				eq(compendium.type, DB_TYPES.ITEMS),
				eq(compendium.type, DB_TYPES.MAGIC_ITEMS)
			));
		} else {
			conditions.push(eq(compendium.type, dbType));
		}

		// Search with FTS + LIKE fallback
		if (search) {
			try {
				const ftsResults = await searchFtsRanked(search, 100);
				if (ftsResults.length > 0) {
					const keys = ftsResults.map((r) => r.key);
					conditions.push(inArray(compendium.key, keys));
				} else {
					const searchPattern = `%${search}%`;
					conditions.push(or(
						like(compendium.name, searchPattern),
						like(compendium.description, searchPattern)
					));
				}
			} catch {
				// FTS not available, fallback to LIKE
				const searchPattern = `%${search}%`;
				conditions.push(or(
					like(compendium.name, searchPattern),
					like(compendium.description, searchPattern)
				));
			}
		}

		// Game system filter
		if (gamesystem) {
			conditions.push(eq(compendium.gamesystemKey, gamesystem));
		}

		// Spell filters using JSON extraction
		if (spellLevel != null && spellLevel !== '') {
			conditions.push(eq(sql`json_extract(${compendium.data}, '$.level')`, parseInt(spellLevel)));
		}

		if (spellSchool) {
			conditions.push(sql`lower(json_extract(${compendium.data}, '$.school.key')) = ${spellSchool.toLowerCase()}`);
		}

		// Creature filters using JSON extraction
		if (challengeRating != null && challengeRating !== '') {
			conditions.push(eq(sql`json_extract(${compendium.data}, '$.challenge_rating_decimal')`, parseFloat(challengeRating)));
		}

		if (creatureType) {
			conditions.push(sql`lower(json_extract(${compendium.data}, '$.type.key')) = ${creatureType.toLowerCase()}`);
		}

		// Filter out undefined values and build where clause
		const validConditions = conditions.filter((c): c is SQL => c !== undefined);
		const whereClause = and(...validConditions);

		// Get total count
		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(compendium)
			.where(whereClause);
		const totalCount = countResult[0]?.count || 0;

		// Calculate offset
		const offset = (page - 1) * limit;

		// Determine sort column and direction
		const sortColumn = compendium[sortBy as keyof typeof compendium] || compendium.name;
		const orderFn = sortOrder === 'asc' ? asc : desc;

		// Fetch items
		const items = await db
			.select()
			.from(compendium)
			.where(whereClause)
			.orderBy(orderFn(sortColumn as any))
			.limit(limit)
			.offset(offset);

		return json({
			items,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages: Math.ceil(totalCount / limit)
			},
			hasAnyItems: totalCount > 0
		});
	} catch (error) {
		log.error({ error, pathType }, 'Error fetching compendium items');
		return json({ error: 'Failed to fetch compendium items' }, { status: 500 });
	}
};
