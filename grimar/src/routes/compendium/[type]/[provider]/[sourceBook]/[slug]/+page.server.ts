import type { PageServerLoad } from './$types';
import { compendiumService } from '$lib/server/services/compendium';
import { getCompendiumTypeConfig, getDbTypeFromPath } from '$lib/core/constants/compendium';
import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumItemPage');

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication - redirects to / if not authenticated
	requireUser(locals);

	const { type: pathType, provider, sourceBook, slug } = params;

	try {
		const config = getCompendiumTypeConfig(pathType);
		const dbType = getDbTypeFromPath(pathType);

		log.info({ pathType, provider, sourceBook, slug }, 'Loading compendium item');

		// Get the item by provider, sourceBook, and slug
		const item = await compendiumService.getBySourceAndId(provider, dbType, slug, sourceBook);

		if (!item) {
			log.warn({ provider, sourceBook, slug }, 'Item not found');
			throw error(404, `${config.displayName} not found`);
		}

		// Get navigation for prev/next (only if item has a key)
		let navigation = null;
		if (item.key) {
			try {
				navigation = await compendiumService.getNavigation(dbType, item.key);
			} catch (navError) {
				log.warn({ error: navError, itemKey: item.key }, 'Failed to load navigation');
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
