import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { like, or, desc, eq, and, gte, lte } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';
import { getCompendiumConfig, getTypeFromPath } from '$lib/core/constants/compendium';
import { COMPENDIUM_TYPES } from '$lib/core/types/compendium';

const log = createModuleLogger('CompendiumSearchAPI');

// Reverse map: db type -> URL path
const TYPE_TO_PATH: Record<string, string> = {
	spell: 'spells',
	creature: 'creatures',
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

// Section to compendium type mapping (singular to plural path)
const SECTION_TO_TYPE: Record<string, string> = {
	spells: 'spell',
	creatures: 'creature',
	feats: 'feat',
	backgrounds: 'background',
	races: 'race',
	classes: 'class',
	items: 'item',
	weapons: 'weapon',
	armor: 'armor',
	conditions: 'condition',
	planes: 'plane',
	sections: 'section',
	characters: 'character'
};

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
	const typeFilter = url.searchParams.get('type'); // Optional: filter by type (singular)
	const section = url.searchParams.get('section'); // Optional: filter by section (plural)
	const filtersParam = url.searchParams.get('filters') || ''; // Comma-separated key:value
	const limitParam = parseInt(url.searchParams.get('limit') || '10');

	// Handle section param - convert to type filter
	const effectiveType = section ? SECTION_TO_TYPE[section] || section : typeFilter;

	// If query is just "*", return all items of the section/type
	const isWildcard = query.trim() === '*';

	if (!isWildcard && query.trim().length < 2) {
		return json({ results: [] });
	}

	// Parse inline filters (e.g., "type:spell school:evocation")
	const inlineFilters = parseFilters(filtersParam);

	// Merge inline filters with typeFilter (inline filters take precedence)
	const filters: FilterParams = {
		...inlineFilters,
		...(effectiveType && !inlineFilters.type ? { type: effectiveType } : {})
	};

	try {
		const db = await getDb();

		// Build conditions array
		const conditions = [];

		// For wildcard queries, just filter by type without name/summary search
		if (!isWildcard) {
			const searchPattern = `%${query}%`;
			const nameCondition = like(compendiumItems.name, searchPattern);
			const summaryCondition = like(compendiumItems.summary, searchPattern);
			conditions.push(or(nameCondition, summaryCondition));
		}

		// Apply type filter
		if (filters.type) {
			// Skip getTypeFromPath if already a valid compendium type (singular form)
			const dbType = COMPENDIUM_TYPES.includes(filters.type as any)
				? (filters.type as any)
				: getTypeFromPath(filters.type);
			conditions.push(eq(compendiumItems.type, dbType));
		}

		// Apply spell filters
		if (filters.school) {
			conditions.push(eq(compendiumItems.spellSchool, filters.school.toLowerCase()));
		}

		if (filters.level) {
			const level = parseInt(filters.level);
			if (!isNaN(level)) {
				conditions.push(eq(compendiumItems.spellLevel, level));
			}
		}

		// Apply creature filters
		if (filters.cr) {
			const range = parseRange(filters.cr);
			if (range) {
				if (range.min !== undefined && range.max !== undefined) {
					conditions.push(
						and(
							gte(compendiumItems.challengeRating, range.min.toString()),
							lte(compendiumItems.challengeRating, range.max.toString())
						)
					);
				} else if (range.min !== undefined) {
					conditions.push(eq(compendiumItems.challengeRating, range.min.toString()));
				}
			}
		}

		if (filters.size) {
			conditions.push(eq(compendiumItems.creatureSize, filters.size.toLowerCase()));
		}

		if (filters.creatureType) {
			conditions.push(eq(compendiumItems.creatureType, filters.creatureType.toLowerCase()));
		}

		// Apply source filter
		if (filters.source) {
			conditions.push(eq(compendiumItems.source, filters.source.toLowerCase()));
		}

		// Execute query
		const items = await db
			.select()
			.from(compendiumItems)
			.where(and(...conditions))
			.orderBy(desc(compendiumItems.name))
			.limit(limitParam);

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
				source: item.source,
				provider: item.source,
				sourceBook: item.sourceBook || 'Unknown'
			};
		});

		return json({ results, section: section || null });
	} catch (error) {
		log.error({ error, query, filters, section }, 'Search failed');
		return json({ error: 'Search failed' }, { status: 500 });
	}
};
