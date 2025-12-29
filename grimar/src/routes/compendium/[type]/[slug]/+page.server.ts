import type { PageServerLoad } from './$types';
import { loadCompendiumItem } from '$lib/server/services/compendium/loader';
import { getCompendiumConfig, getTypeFromPath } from '$lib/constants/compendium';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { type: pathType, slug } = params;

	try {
		const config = getCompendiumConfig(pathType);
		const dbType = getTypeFromPath(pathType);

		const result = await loadCompendiumItem({
			slug,
			type: dbType,
			typeLabel: config.ui.displayName
		});

		return {
			item: result.item,
			navigation: result.navigation,
			config,
			dbType,
			pathType
		};
	} catch (e) {
		console.error(`Failed to load compendium item: ${pathType}/${slug}`, e);
		throw error(404, `Item not found`);
	}
};
