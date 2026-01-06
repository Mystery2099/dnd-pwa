import type { PageServerLoad } from './$types';
import { loadCompendiumItem } from '$lib/server/services/compendium/loader';
import { getCompendiumConfig, getTypeFromPath } from '$lib/core/constants/compendium';
import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumItemPage');

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication
	requireUser(locals);

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
			dbType,
			pathType
		};
	} catch (e) {
		log.error({ error: e, pathType, slug }, 'Failed to load compendium item');
		throw error(404, `Item not found`);
	}
};
