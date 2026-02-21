import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getItem } from '$lib/server/repositories/compendium';
import { COMPENDIUM_TYPES } from '$lib/server/db/schema';
import type { CompendiumType } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ params }) => {
	const { type, slug } = params;

	if (!COMPENDIUM_TYPES.includes(type as CompendiumType)) {
		throw error(400, 'Invalid compendium type');
	}

	const item = await getItem(type as CompendiumType, slug);

	if (!item) {
		throw error(404, 'Item not found');
	}

	return json(item);
};
