import type { PageServerLoad } from './$types';
import { compendiumService } from '$lib/server/services/compendium';
import { getCompendiumConfig, getTypeFromPath } from '$lib/core/constants/compendium';
import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumItemPage');

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication - redirects to / if not authenticated
	requireUser(locals);

	const { type: pathType, provider, sourceBook, slug } = params;

	try {
		const config = getCompendiumConfig(pathType);
		const dbType = getTypeFromPath(pathType);

		log.info({ pathType, provider, sourceBook, slug }, 'Loading compendium item');

		// Get the item by provider, sourceBook, and slug
		const item = await compendiumService.getBySourceAndId(provider, dbType, slug);

		if (!item) {
			log.warn({ provider, sourceBook, slug }, 'Item not found');
			throw error(404, `${config.ui.displayName} not found`);
		}

		// Get navigation for prev/next (only if item has an id)
		let navigation = null;
		if (item.id) {
			try {
				navigation = await compendiumService.getNavigation(dbType, item.id);
			} catch (navError) {
				log.warn({ error: navError, itemId: item.id }, 'Failed to load navigation');
				navigation = null;
			}
		}

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
		// Re-throw SvelteKit errors (they have 'status' property)
		if (typeof e === 'object' && e !== null && 'status' in e) {
			throw e;
		}
		// Log the actual error message and stack trace
		const errorMessage = e instanceof Error ? e.message : String(e);
		const errorStack = e instanceof Error ? e.stack : '';
		log.error({ error: errorMessage, stack: errorStack, params }, 'Failed to load compendium item');
		throw error(500, 'Internal server error');
	}
};
