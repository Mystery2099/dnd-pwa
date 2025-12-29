import type { PageServerLoad } from './$types';
import { loadCompendiumItem } from '$lib/server/services/compendium/loader';

export const load: PageServerLoad = async ({ params }) => {
	const result = await loadCompendiumItem({
		slug: params.slug,
		type: 'monster',
		typeLabel: 'Monster'
	});

	return {
		monster: result.item,
		navigation: result.navigation
	};
};
