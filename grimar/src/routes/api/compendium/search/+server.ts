import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { compendiumService } from '$lib/server/services/compendium';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumSearchAPI');

interface SearchResult {
	key: string;
	type: string;
	name: string;
	description: string | null;
	source: string;
	documentName: string | null;
}

/**
 * GET /api/compendium/search?q=fire&type=spells
 * GET /api/compendium/search?q=fire&section=spells
 */
export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const typeFilter = url.searchParams.get('type');
	const section = url.searchParams.get('section');
	const limitParam = parseInt(url.searchParams.get('limit') || '10');

	const effectiveType = section || typeFilter;

	const isWildcard = query.trim() === '*';

	if (!isWildcard && query.trim().length < 2) {
		return json({ results: [] });
	}

	try {
		let results: SearchResult[];

		if (isWildcard && effectiveType) {
			const items = await compendiumService.getByType(effectiveType, { limit: limitParam });
			results = items.map((item) => ({
				key: item.key,
				type: item.type,
				name: item.name,
				description: item.description,
				source: item.source,
				documentName: item.documentName
			}));
		} else if (isWildcard) {
			const items = await compendiumService.getByType('spells', { limit: limitParam });
			results = items.map((item) => ({
				key: item.key,
				type: item.type,
				name: item.name,
				description: item.description,
				source: item.source,
				documentName: item.documentName
			}));
		} else {
			const items = await compendiumService.search(query, effectiveType || undefined, limitParam);
			results = items.map((item) => ({
				key: item.key,
				type: item.type,
				name: item.name,
				description: item.description,
				source: item.source,
				documentName: item.documentName
			}));
		}

		return json({ results, section: section || null });
	} catch (error) {
		log.error({ error, query, type: effectiveType }, 'Search failed');
		return json({ error: 'Search failed' }, { status: 500 });
	}
};
