import type { PageServerLoad } from './$types';
import { loadCompendiumItem } from '$lib/server/services/compendium/loader';

export const load: PageServerLoad = async ({ params }) => {
	const result = await loadCompendiumItem({
		slug: params.slug,
		type: 'spell',
		typeLabel: 'Spell'
	});

	return {
		spell: result.item,
		navigation: result.navigation
	};
};
