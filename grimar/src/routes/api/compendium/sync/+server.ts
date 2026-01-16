import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { syncAllProviders } from '$lib/server/services/sync/orchestrator';
import { invalidateAllCompendiumCache } from '$lib/server/repositories/compendium';
import { setCacheVersion } from '$lib/server/cache-version';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumSyncAPI');

export const POST = async () => {
	const db = await getDb();

	try {
		const results = await syncAllProviders(db);

		// Invalidate cache after sync
		invalidateAllCompendiumCache();

		// Also clear the repository's in-memory cache
		const { compendiumRepository } = await import('$lib/server/repositories/compendium');
		compendiumRepository.invalidateAllCache();

		// Update cache version to trigger client invalidation
		setCacheVersion(`sync-${Date.now()}`);

		// Aggregate results for response
		const totalSpells = results.reduce((sum, r) => sum + r.spells, 0);
		const totalCreatures = results.reduce((sum, r) => sum + r.creatures, 0);
		const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

		log.info(
			{
				spells: totalSpells,
				creatures: totalCreatures,
				providers: results.map((r) => ({
					id: r.providerId,
					spells: r.spells,
					creatures: r.creatures,
					errors: r.errors
				}))
			},
			'Sync completed'
		);

		return json({
			ok: totalErrors === 0,
			summary: {
				spells: totalSpells,
				creatures: totalCreatures
			},
			errors: totalErrors > 0 ? results.flatMap((r) => r.errors) : undefined
		});
	} catch (error) {
		log.error({ error }, 'Sync failed');
		return json(
			{
				ok: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
