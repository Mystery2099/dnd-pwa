import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { COMPENDIUM_TYPE_CONFIGS } from '$lib/core/constants/compendium';

export const load: PageServerLoad = async ({ params }) => {
	const type = params.type as keyof typeof COMPENDIUM_TYPE_CONFIGS;
	const config = COMPENDIUM_TYPE_CONFIGS[type];

	if (!config) {
		throw error(404, `Unknown compendium type: ${type}`);
	}

	return {
		type: type as keyof typeof COMPENDIUM_TYPE_CONFIGS,
		config
	};
};
