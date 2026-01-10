import type { PageServerLoad } from './$types';
import { compendiumService } from '$lib/server/services/compendium';
import { getCompendiumConfig, getTypeFromPath } from '$lib/core/constants/compendium';
import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumItemPage');

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication
	requireUser(locals);

	const { type: pathType, provider, sourceBook, slug } = params;

	try {
		const config = getCompendiumConfig(pathType);
		const dbType = getTypeFromPath(pathType);

		// Get the item by provider, sourceBook, and slug
		const item = await compendiumService.getBySourceAndId(provider, dbType, parseInt(slug) || slug);

		if (!item) {
			throw error(404, `${config.ui.displayName} not found`);
		}

		// Get navigation for prev/next (only if item has an id)
		const navigation = item.id ? await compendiumService.getNavigation(dbType, item.id) : null;

		// Cast to legacy type for compatibility with existing components
		return {
			item,
			navigation:
				(navigation as {
					prev: typeof item | null;
					next: typeof item | null;
					currentIndex: number;
					total: number;
				}) || null,
			dbType,
			pathType,
			provider,
			sourceBook
		};
	} catch (e) {
		if (e instanceof Response) throw e; // Re-throw SvelteKit errors
		log.error({ error: e, pathType, provider, sourceBook, slug }, 'Failed to load compendium item');
		throw error(404, `Item not found`);
	}
};
