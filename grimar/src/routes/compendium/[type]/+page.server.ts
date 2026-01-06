import type { PageServerLoad } from './$types';
import { getTypeFromPath } from '$lib/core/constants/compendium';
import { error, redirect } from '@sveltejs/kit';
import { requireUser } from '$lib/server/services/auth';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumTypePage');

export const load: PageServerLoad = async ({ locals, params }) => {
	// Require authentication
	requireUser(locals);

	const { type: pathType } = params;

	try {
		// Only return serializable data from SSR
		// Config with Svelte components/functions is loaded client-side
		const dbType = getTypeFromPath(pathType);

		return {
			dbType,
			pathType
		};
	} catch (e) {
		log.error({ error: e, pathType }, 'Failed to load compendium type');
		throw error(404, `Compendium type "${pathType}" not found`);
	}
};
