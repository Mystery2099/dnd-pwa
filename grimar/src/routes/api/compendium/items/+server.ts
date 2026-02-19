import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq, like, and, or, desc, asc, inArray, type SQL } from 'drizzle-orm';
import { getDbTypeFromPath, DB_TYPES } from '$lib/core/constants/compendium';
import {
	JSON_PATHS,
	FILTER_PARAMS,
	jsonExtract,
	jsonExtractLower,
	normalizeDbType
} from '$lib/server/db/compendium-filters';
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
		const search = url.searchParams.get(FILTER_PARAMS.SEARCH) || '';
		const sortBy = url.searchParams.get(FILTER_PARAMS.SORT_BY) || 'name';
		const sortOrder = url.searchParams.get(FILTER_PARAMS.SORT_ORDER) || 'asc';
		const spellLevel = url.searchParams.get(FILTER_PARAMS.SPELL_LEVEL);
		const spellSchool = url.searchParams.get(FILTER_PARAMS.SPELL_SCHOOL);
		const challengeRating = url.searchParams.get(FILTER_PARAMS.CHALLENGE_RATING);
		const creatureType = url.searchParams.get(FILTER_PARAMS.CREATURE_TYPE);

		if (!pathType) {
			return json({ error: 'Missing type parameter' }, { status: 400 });
		}

		const db = await getDb();
		const dbType = getDbTypeFromPath(pathType);
		const normalizedType = normalizeDbType(dbType);

		const conditions: (SQL | undefined)[] = [];

		// Handle items/magicitems as a combined type
		if (normalizedType === DB_TYPES.ITEMS || normalizedType === DB_TYPES.MAGIC_ITEMS) {
			conditions.push(or(
				eq(compendiumItems.type, DB_TYPES.ITEMS),
				eq(compendiumItems.type, DB_TYPES.MAGIC_ITEMS)
			));
		} else {
			conditions.push(eq(compendiumItems.type, normalizedType));
		}

		// Search with FTS + LIKE fallback
		if (search) {
			try {
				const ftsResults = await searchFtsRanked(search, 100);
				if (ftsResults.length > 0) {
					const rowids = ftsResults.map((r) => r.rowid);
					conditions.push(inArray(compendiumItems.id, rowids));
				} else {
					const searchPattern = `%${search}%`;
					conditions.push(or(
						like(compendiumItems.name, searchPattern),
						like(compendiumItems.summary, searchPattern)
					));
				}
			} catch {
				// FTS not available, fallback to LIKE
				const searchPattern = `%${search}%`;
				conditions.push(or(
					like(compendiumItems.name, searchPattern),
					like(compendiumItems.summary, searchPattern)
				));
			}
		}

		// Spell filters using shared constants
		if (spellLevel != null && spellLevel !== '') {
			conditions.push(eq(jsonExtract(JSON_PATHS.SPELL_LEVEL), parseInt(spellLevel)));
		}

		if (spellSchool) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.SPELL_SCHOOL), spellSchool.toLowerCase()));
		}

		// Creature filters using shared constants
		if (challengeRating != null && challengeRating !== '') {
			conditions.push(eq(jsonExtract(JSON_PATHS.CREATURE_CR), challengeRating));
		}

		if (creatureType) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.CREATURE_TYPE), creatureType.toLowerCase()));
		}

		// Filter out undefined values and build where clause
		const validConditions = conditions.filter((c): c is SQL => c !== undefined);
		const whereClause = and(...validConditions);

		// Get total count
		const totalCount = await db.$count(compendiumItems, whereClause);

		// Calculate offset
		const offset = (page - 1) * limit;

		// Determine sort column and direction
		const sortColumn =
			compendiumItems[sortBy as keyof typeof compendiumItems] || compendiumItems.name;
		const orderFn = sortOrder === 'asc' ? asc : desc;

		// Fetch items
		const items = await db
			.select()
			.from(compendiumItems)
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
