import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import { getItemByKey } from '$lib/server/repositories/compendium';

export const load: PageServerLoad = async ({ params }) => {
	const type = params.type as CompendiumTypeName;
	const key = params.key;

	const config = COMPENDIUM_TYPE_CONFIGS[type];
	if (!config) {
		throw error(404, `Unknown compendium type: ${type}`);
	}

	const item = await getItemByKey(key);
	if (!item) {
		throw error(404, `${config.label} not found: ${key}`);
	}

	return {
		type,
		key,
		config,
		item
	};
};
