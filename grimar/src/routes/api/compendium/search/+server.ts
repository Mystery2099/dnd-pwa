import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { like, or, desc, eq, and } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';
import { getCompendiumConfig, getTypeFromPath } from '$lib/core/constants/compendium';

const log = createModuleLogger('CompendiumSearchAPI');

// Reverse map: db type -> URL path
const TYPE_TO_PATH: Record<string, string> = {
	spell: 'spells',
	monster: 'monsters',
	feat: 'feats',
	background: 'backgrounds',
	race: 'races',
	class: 'classes',
	item: 'items',
	weapon: 'weapons',
	armor: 'armor',
	condition: 'conditions',
	plane: 'planes',
	section: 'sections'
};

interface SearchResult {
	type: string;
	typePath: string;
	name: string;
	slug: string;
	summary: string | null;
	source: string;
}

/**
 * GET /api/compendium/search?q=fire&type=spell (optional type filter)
 * Global search across all compendium types or filtered by type.
 */
export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const typeFilter = url.searchParams.get('type'); // Optional: filter by type
	const limitParam = parseInt(url.searchParams.get('limit') || '10');

	if (!query.trim() || query.trim().length < 2) {
		return json({ results: [] });
	}

	try {
		const db = await getDb();
		const searchPattern = `%${query}%`;

		// Build conditions
		const nameCondition = like(compendiumItems.name, searchPattern);
		const summaryCondition = like(compendiumItems.summary, searchPattern);
		const searchConditions = or(nameCondition, summaryCondition);

		// Build query with optional type filter
		let items;
		if (typeFilter) {
			// Convert path type (e.g., 'spells') to db type (e.g., 'spell')
			const dbType = getTypeFromPath(typeFilter);
			items = await db
				.select()
				.from(compendiumItems)
				.where(and(searchConditions, eq(compendiumItems.type, dbType)))
				.orderBy(desc(compendiumItems.name))
				.limit(limitParam);
		} else {
			items = await db
				.select()
				.from(compendiumItems)
				.where(searchConditions)
				.orderBy(desc(compendiumItems.name))
				.limit(limitParam);
		}

		// Transform to search results
		const results: SearchResult[] = items.map((item) => {
			const config = getCompendiumConfig(item.type);
			const typePath = TYPE_TO_PATH[item.type] || item.type;
			const slug = item.externalId || item.name.toLowerCase().replace(/\s+/g, '-');

			return {
				type: config.ui.displayName,
				typePath: typePath,
				name: item.name,
				slug,
				summary: item.summary,
				source: item.source
			};
		});

		return json({ results });
	} catch (error) {
		log.error({ error, query }, 'Search failed');
		return json({ error: 'Search failed' }, { status: 500 });
	}
};
