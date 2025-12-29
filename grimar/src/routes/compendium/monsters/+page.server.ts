import type { PageServerLoad } from './$types';
import {
	getPaginatedCompendiumItems,
	parsePaginationQuery
} from '$lib/server/db/repositories/compendium';

export const load: PageServerLoad = async ({ url }) => {
	const options = parsePaginationQuery(url);

	const loadMonsters = async () => {
		const result = await getPaginatedCompendiumItems('monster', options);

		const monsters = result.items.map((row: any) => ({
			...(row.details as any),
			externalId: row.externalId,
			__rowId: row.id
		}));

		return {
			monsters,
			pagination: {
				total: result.total,
				limit: result.limit,
				offset: result.offset,
				hasMore: result.hasMore,
				hasPrevious: result.hasPrevious,
				totalPages: result.totalPages,
				currentPage: result.currentPage
			}
		};
	};

	return {
		streamed: {
			monsters: loadMonsters()
		}
	};
};
