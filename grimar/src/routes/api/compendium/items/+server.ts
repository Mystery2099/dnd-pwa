import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPaginatedItems } from '$lib/server/repositories/compendium';
import { COMPENDIUM_TYPES } from '$lib/server/db/schema';
import type { CompendiumType } from '$lib/server/db/schema';

type SortByParam = 'name' | 'created_at' | 'updated_at';

function normalizeSortBy(value: string | null): SortByParam {
	if (value === 'createdAt' || value === 'created_at') return 'created_at';
	if (value === 'updatedAt' || value === 'updated_at') return 'updated_at';
	return 'name';
}

function formatTimingHeaders(durationMs: number): HeadersInit {
	const roundedMs = Number(durationMs.toFixed(2));
	const bucket = durationMs < 50 ? 'fast' : durationMs < 150 ? 'moderate' : durationMs < 400 ? 'slow' : 'very-slow';
	return {
		'Server-Timing': `compendium-items;dur=${roundedMs}`,
		'X-Query-Time-Ms': String(roundedMs),
		'X-Query-Bucket': bucket
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const start = performance.now();
	const type = url.searchParams.get('type');
	const search = url.searchParams.get('search') || undefined;
	const gamesystem = url.searchParams.get('gamesystem') || undefined;
	const document = url.searchParams.get('document') || undefined;
	const source = url.searchParams.get('source') || undefined;
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = parseInt(url.searchParams.get('limit') || '50', 10);
	const sortBy = normalizeSortBy(url.searchParams.get('sortBy'));
	const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
	const getAll = url.searchParams.get('all') === 'true';
	const effectivePage = getAll ? 1 : page;
	const effectiveLimit = getAll ? 5000 : limit;
	const effectiveMaxPageSize = getAll ? 5000 : 100;

	const creatureType = url.searchParams.get('creatureType') || undefined;
	const spellLevel = url.searchParams.get('spellLevel') || undefined;
	const spellSchool = url.searchParams.get('spellSchool') || undefined;
	const challengeRating = url.searchParams.get('challengeRating') || undefined;
	const includeSubclasses = url.searchParams.get('includeSubclasses');
	const includeSubclassesFilter =
		includeSubclasses === null ? undefined : includeSubclasses.toLowerCase() === 'true';
	const onlySubclasses = url.searchParams.get('onlySubclasses');
	const onlySubclassesFilter =
		onlySubclasses === null ? undefined : onlySubclasses.toLowerCase() === 'true';

	if (type && !COMPENDIUM_TYPES.includes(type as CompendiumType)) {
		return json(
			{ error: 'Invalid compendium type' },
			{ status: 400, headers: formatTimingHeaders(performance.now() - start) }
		);
	}

	if (!type) {
		return json(
			{ error: 'Type parameter is required' },
			{ status: 400, headers: formatTimingHeaders(performance.now() - start) }
		);
	}

	const result = await getPaginatedItems(type as CompendiumType, {
		page: effectivePage,
		pageSize: effectiveLimit,
		maxPageSize: effectiveMaxPageSize,
		filters: {
			search,
			gamesystem,
			document,
			source,
			sortBy,
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
						: undefined,
				includeSubclasses: type === 'classes' ? includeSubclassesFilter : undefined,
				onlySubclasses: type === 'classes' ? onlySubclassesFilter : undefined
			}
		});

	return json(result, { headers: formatTimingHeaders(performance.now() - start) });
};
