import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPaginatedItems, searchItems } from '$lib/server/repositories/compendium';
import { COMPENDIUM_TYPES } from '$lib/server/db/schema';
import type { CompendiumType } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type');
	const search = url.searchParams.get('search') || undefined;
	const gamesystem = url.searchParams.get('gamesystem') || undefined;
	const document = url.searchParams.get('document') || undefined;
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = parseInt(url.searchParams.get('limit') || '50', 10);
	const sortBy = url.searchParams.get('sortBy') || 'name';
	const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
	const getAll = url.searchParams.get('all') === 'true';

	const creatureType = url.searchParams.get('creatureType') || undefined;
	const spellLevel = url.searchParams.get('spellLevel') || undefined;
	const spellSchool = url.searchParams.get('spellSchool') || undefined;
	const challengeRating = url.searchParams.get('challengeRating') || undefined;

	if (type && !COMPENDIUM_TYPES.includes(type as CompendiumType)) {
		return json({ error: 'Invalid compendium type' }, { status: 400 });
	}

	if (!type) {
		return json({ error: 'Type parameter is required' }, { status: 400 });
	}

	if (search) {
		const results = await searchItems(type as CompendiumType, search);
		return json({
			items: results,
			total: results.length,
			page: 1,
			pageSize: getAll ? results.length : limit,
			totalPages: 1,
			hasMore: false
		});
	}

	const result = await getPaginatedItems(type as CompendiumType, {
		page,
		pageSize: limit,
		filters: {
			gamesystem,
			document,
			sortBy: sortBy as 'name' | 'created_at' | 'updated_at',
			sortOrder,
			creatureType: type === 'creatures' ? creatureType : undefined,
			spellLevel:
				type === 'spells' && spellLevel && !isNaN(parseInt(spellLevel, 10))
					? parseInt(spellLevel, 10)
					: undefined,
			spellSchool: type === 'spells' ? spellSchool : undefined,
			challengeRating:
				type === 'creatures' && challengeRating && !isNaN(parseFloat(challengeRating))
					? parseFloat(challengeRating)
					: undefined
		}
	});

	return json(result);
};
