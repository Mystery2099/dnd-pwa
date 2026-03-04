import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { COMPENDIUM_TYPE_CONFIGS, type CompendiumTypeName } from '$lib/core/constants/compendium';
import { getItem } from '$lib/server/repositories/compendium';
import type { CompendiumType } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const type = params.type as CompendiumTypeName;
	const key = params.key;

	const config = COMPENDIUM_TYPE_CONFIGS[type];
	if (!config) {
		throw error(404, `Unknown compendium type: ${type}`);
	}

	const itemType = (config.endpoint === 'classes' ? 'classes' : type) as CompendiumType;
	const item = await getItem(itemType, key);
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
