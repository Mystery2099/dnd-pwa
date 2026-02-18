import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { getAllHomebrewItems } from '$lib/server/repositories/compendium';
import type { CompendiumItem } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	const items = await getAllHomebrewItems();

	const itemsByType: Record<string, CompendiumItem[]> = {};
	for (const item of items) {
		if (!itemsByType[item.type]) {
			itemsByType[item.type] = [];
		}
		itemsByType[item.type].push(item);
	}

	return {
		items,
		itemsByType,
		user: {
			username: user.username,
			role: user.role
		}
	};
};
