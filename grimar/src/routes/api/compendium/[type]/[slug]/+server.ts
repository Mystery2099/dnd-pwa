import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { COMPENDIUM_TYPES } from '$lib/server/db/schema';
import type { CompendiumType } from '$lib/server/db/schema';
import { getCompendiumQuickDetail } from '$lib/server/services/compendium/quick-detail';

export const GET: RequestHandler = async ({ params }) => {
	const { type, slug } = params;

	if (!COMPENDIUM_TYPES.includes(type as CompendiumType)) {
		throw error(400, 'Invalid compendium type');
	}

	try {
		const detail = await getCompendiumQuickDetail(type as CompendiumType, slug);
		if (!detail) {
			throw error(404, 'Item not found');
		}

		return json(detail);
	} catch (requestError) {
		if (
			requestError &&
			typeof requestError === 'object' &&
			'status' in requestError &&
			typeof requestError.status === 'number'
		) {
			throw requestError;
		}

		console.error('GET /api/compendium/[type]/[slug] failed to build payload', {
			type,
			slug,
			error: requestError
		});
		return json({ error: 'Failed to build compendium payload' }, { status: 500 });
	}
};
