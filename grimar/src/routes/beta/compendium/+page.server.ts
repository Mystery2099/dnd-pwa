import type { PageServerLoad } from './$types';
import { parseAtlasState } from '$lib/features/compendium/atlas';
import { getAtlasPagePayload } from '$lib/server/services/compendium/atlas';

export const load: PageServerLoad = async ({ url }) => {
	const state = parseAtlasState(url.searchParams);
	return getAtlasPagePayload(state);
};
