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
			sortOrder
		}
	});

	let items = result.items;

	if (creatureType && type === 'creatures') {
		items = items.filter((item) => {
			const creatureData = item.data as { type?: string };
			return creatureData.type?.toLowerCase() === creatureType.toLowerCase();
		});
	}

	if (spellLevel !== undefined && type === 'spells') {
		const level = parseInt(spellLevel, 10);
		if (!isNaN(level)) {
			items = items.filter((item) => {
				const spellData = item.data as { level?: number };
				return spellData.level === level;
			});
		}
	}

	if (spellSchool && type === 'spells') {
		items = items.filter((item) => {
			const spellData = item.data as { school?: string };
			return spellData.school?.toLowerCase() === spellSchool.toLowerCase();
		});
	}

	if (challengeRating && type === 'creatures') {
		const cr = parseFloat(challengeRating);
		if (!isNaN(cr)) {
			items = items.filter((item) => {
				const creatureData = item.data as { challenge_rating_decimal?: number };
				return creatureData.challenge_rating_decimal === cr;
			});
		}
	}

	return json({
		...result,
		items,
		total: items.length
	});
};
