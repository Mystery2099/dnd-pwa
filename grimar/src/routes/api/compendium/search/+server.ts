import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { like, or, desc, eq, and, gte, lte, inArray, sql, type SQL } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';
import {
	getCompendiumConfig,
	getDbTypeFromPath,
	getUrlPathFromDbType,
	DB_TYPES
} from '$lib/core/constants/compendium';
import {
	JSON_PATHS,
	normalizeDbType,
	jsonExtract,
	jsonExtractLower,
	SECTION_TO_TYPE_FILTER
} from '$lib/server/db/compendium-filters';
import { searchFtsRanked } from '$lib/server/db/db-fts';
import { stripSlugPrefix } from '$lib/core/utils/slug';

const log = createModuleLogger('CompendiumSearchAPI');

interface SearchResult {
	type: string;
	typePath: string;
	name: string;
	slug: string;
	summary: string | null;
	source: string;
	provider: string;
	sourceBook: string;
}

interface FilterParams {
	type?: string;
	school?: string;
	level?: string;
	cr?: string;
	size?: string;
	creatureType?: string;
	source?: string;
}

/**
 * Parse range string like "5-10" into {min, max}
 */
function parseRange(range: string): { min?: number; max?: number } | null {
	const match = range.match(/^(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?$/);
	if (!match) return null;
	return {
		min: parseFloat(match[1]),
		max: match[2] ? parseFloat(match[2]) : undefined
	};
}

/**
 * Parse filter string from query (e.g., "type:spell school:evocation")
 */
function parseFilters(filterStr: string): FilterParams {
	const filters: FilterParams = {};
	const regex = /(\w+):(\S+)/g;
	let match;

	while ((match = regex.exec(filterStr)) !== null) {
		const key = match[1] as keyof FilterParams;
		const value = match[2];
		filters[key] = value;
	}

	return filters;
}

/**
 * GET /api/compendium/search?q=fire&type=spell (optional type filter)
 * GET /api/compendium/search?q=fire&section=spells (section-specific search)
 * Supports filter syntax: ?q=fire&filters=type:spell,school:evocation
 */
export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const typeFilter = url.searchParams.get('type');
	const section = url.searchParams.get('section');
	const filtersParam = url.searchParams.get('filters') || '';
	const limitParam = parseInt(url.searchParams.get('limit') || '10');

	// Handle section param - convert to type filter using shared mapping
	const effectiveType = section || typeFilter;

	// If query is just "*", return all items of the section/type
	const isWildcard = query.trim() === '*';

	if (!isWildcard && query.trim().length < 2) {
		return json({ results: [] });
	}

	// Parse inline filters
	const inlineFilters = parseFilters(filtersParam);

	// Merge inline filters with typeFilter
	const filters: FilterParams = {
		...inlineFilters,
		...(effectiveType && !inlineFilters.type ? { type: effectiveType } : {})
	};

	try {
		const db = await getDb();

		const conditions: (SQL | undefined)[] = [];

		// Search with FTS + LIKE fallback
		if (!isWildcard) {
			try {
				const ftsResults = await searchFtsRanked(query, 50);
				if (ftsResults.length > 0) {
					const rowids = ftsResults.map((r) => r.rowid);
					conditions.push(inArray(compendiumItems.id, rowids));
				} else {
					const searchPattern = `%${query}%`;
					conditions.push(or(
						like(compendiumItems.name, searchPattern),
						like(compendiumItems.summary, searchPattern)
					));
				}
			} catch {
				// FTS not available, fallback to LIKE
				const searchPattern = `%${query}%`;
				conditions.push(or(
					like(compendiumItems.name, searchPattern),
					like(compendiumItems.summary, searchPattern)
				));
			}
		}

		// Apply type filter using shared normalization
		if (filters.type) {
			const dbType = getDbTypeFromPath(filters.type);
			const normalizedType = normalizeDbType(dbType);

			// Handle items/magicitems as combined type
			if (normalizedType === DB_TYPES.ITEMS || normalizedType === DB_TYPES.MAGIC_ITEMS) {
				conditions.push(or(
					eq(compendiumItems.type, DB_TYPES.ITEMS),
					eq(compendiumItems.type, DB_TYPES.MAGIC_ITEMS)
				));
			} else {
				conditions.push(eq(compendiumItems.type, normalizedType));
			}
		}

		// Apply spell filters using shared constants
		if (filters.school) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.SPELL_SCHOOL), filters.school.toLowerCase()));
		}

		if (filters.level) {
			const level = parseInt(filters.level);
			if (!isNaN(level)) {
				conditions.push(eq(jsonExtract(JSON_PATHS.SPELL_LEVEL), level));
			}
		}

		// Apply creature filters using shared constants
		if (filters.cr) {
			const range = parseRange(filters.cr);
			if (range) {
				if (range.min !== undefined && range.max !== undefined) {
					conditions.push(
						and(
							gte(jsonExtract(JSON_PATHS.CREATURE_CR), range.min.toString()),
							lte(jsonExtract(JSON_PATHS.CREATURE_CR), range.max.toString())
						)
					);
				} else if (range.min !== undefined) {
					conditions.push(eq(jsonExtract(JSON_PATHS.CREATURE_CR), range.min.toString()));
				}
			}
		}

		if (filters.size) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.CREATURE_SIZE), filters.size.toLowerCase()));
		}

		if (filters.creatureType) {
			conditions.push(eq(jsonExtractLower(JSON_PATHS.CREATURE_TYPE), filters.creatureType.toLowerCase()));
		}

		// Apply source filter
		if (filters.source) {
			conditions.push(eq(compendiumItems.source, filters.source.toLowerCase()));
		}

		// Filter out undefined values and build where clause
		const validConditions = conditions.filter((c): c is SQL => c !== undefined);
		const whereClause = validConditions.length > 0 ? and(...validConditions) : undefined;

		// Execute query
		const items = await db
			.select()
			.from(compendiumItems)
			.where(whereClause)
			.orderBy(desc(compendiumItems.name))
			.limit(limitParam);

		// Transform to search results using shared URL path mapping
		const results: SearchResult[] = items.map((item) => {
			const config = getCompendiumConfig(item.type);
			const typePath = getUrlPathFromDbType(item.type);
			const sourceBook = item.sourceBook || 'Unknown';
			const rawSlug = item.externalId || item.name.toLowerCase().replace(/\s+/g, '-');
			const slug = stripSlugPrefix(rawSlug, sourceBook) ?? rawSlug;

			return {
				type: config.ui.displayName,
				typePath,
				name: item.name,
				slug,
				summary: item.summary,
				source: item.source,
				provider: item.source,
				sourceBook
			};
		});

		return json({ results, section: section || null });
	} catch (error) {
		log.error({ error, query, filters, section }, 'Search failed');
		return json({ error: 'Search failed' }, { status: 500 });
	}
};
