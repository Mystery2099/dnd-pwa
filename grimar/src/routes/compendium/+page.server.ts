import type { PageServerLoad } from './$types';
import { getTypeCounts } from '$lib/server/repositories/compendium';

export const load: PageServerLoad = async () => {
	const counts = await getTypeCounts();
	return { counts };
};
