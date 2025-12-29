import type { PageServerLoad } from './$types';
import {
	getPaginatedCompendiumItems,
	parsePaginationQuery
} from '$lib/server/db/repositories/compendium';
import { measureAsync, logPagePerformance } from '$lib/server/monitoring';
import { getCompendiumConfig, getTypeFromPath } from '$lib/constants/compendium';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const { type: pathType } = params;

	try {
		const config = getCompendiumConfig(pathType);
		const dbType = getTypeFromPath(pathType);

		// Parse pagination options synchronously (fast)
		const options = parsePaginationQuery(url);

		// Create a promise for the heavy data (slow)
		const loadItems = async () => {
			const startTime = performance.now();

			// Get paginated items with filters
			const result = await measureAsync(`compendium_${dbType}_load`, () =>
				getPaginatedCompendiumItems(dbType, options)
			);

			console.info(`[compendium-${dbType}] Loaded items:`, {
				total: result.total,
				items: result.items.length
			});

			// Map items for the UI
			const items = result.items.map((row: any) => {
				return {
					...(row.details as any),
					name: row.name,
					externalId: row.externalId,
					__rowId: row.id,
					source: row.source,
					// Include filterable columns
					spellLevel: row.spellLevel,
					spellSchool: row.spellSchool,
					challengeRating: row.challengeRating,
					monsterSize: row.monsterSize,
					monsterType: row.monsterType,
					classHitDie: row.classHitDie,
					raceSize: row.raceSize,
					backgroundFeature: row.backgroundFeature,
					featPrerequisites: row.featPrerequisites
				};
			});

			const loadTime = performance.now() - startTime;
			logPagePerformance(`/compendium/${pathType}`, loadTime);

			const hasFilters =
				Object.values(options.filters || {}).some((f) => f && f.length > 0) || !!options.search;
			const hasAnyItems = result.total > 0 || hasFilters;

			return {
				items,
				pagination: {
					...result,
					items
				},
				hasAnyItems
			};
		};

		return {
			config,
			dbType,
			pathType,
			streamed: {
				items: loadItems()
			}
		};
	} catch (e) {
		console.error(`Failed to load compendium type: ${pathType}`, e);
		throw error(404, `Compendium type "${pathType}" not found`);
	}
};
