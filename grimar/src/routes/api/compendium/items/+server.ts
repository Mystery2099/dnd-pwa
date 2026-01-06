import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getTypeFromPath } from '$lib/core/constants/compendium';
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
		const spellLevel = url.searchParams.get('spellLevel');
		const spellSchool = url.searchParams.get('spellSchool');
		const challengeRating = url.searchParams.get('challengeRating');
		const monsterType = url.searchParams.get('monsterType');

		if (!pathType) {
			return json({ error: 'Missing type parameter' }, { status: 400 });
		}

		const db = await getDb();
		// Convert URL path type (e.g., 'monsters') to database type (e.g., 'monster')
		const dbType = getTypeFromPath(pathType);

		// Build where clause
		const conditions = [eq(compendiumItems.type, dbType)];

		if (search) {
			const searchPattern = `%${search}%`;
			conditions.push(like(compendiumItems.name, searchPattern));
			conditions.push(like(compendiumItems.summary, searchPattern));
		}

		if (spellLevel != null && spellLevel !== '') {
			conditions.push(eq(compendiumItems.spellLevel, parseInt(spellLevel)));
		}

		if (spellSchool) {
			conditions.push(eq(compendiumItems.spellSchool, spellSchool));
		}

		if (challengeRating != null && challengeRating !== '') {
			conditions.push(eq(compendiumItems.challengeRating, challengeRating));
		}

		if (monsterType) {
			conditions.push(eq(compendiumItems.monsterType, monsterType));
		}

		// Use and() for combining conditions
		const whereClause = and(...conditions);

		// Get total count
		const totalCount = await db.$count(compendiumItems, whereClause);

		// Calculate offset
		const offset = (page - 1) * limit;

		// Determine sort column and direction
		const sortColumn =
			compendiumItems[sortBy as keyof typeof compendiumItems] || compendiumItems.name;
		const orderFn = sortOrder === 'asc' ? asc : desc;

		// Fetch items using correct Drizzle pattern
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
