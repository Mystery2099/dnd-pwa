import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTypeCounts } from '$lib/server/repositories/compendium';

export const GET: RequestHandler = async () => {
	const counts = await getTypeCounts();
	return json(counts);
};
