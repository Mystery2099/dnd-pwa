import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { syncAllProviders } from '$lib/server/services/sync/orchestrator';
import { invalidateAllCompendiumCache } from '$lib/server/db/repositories/compendium';

export const POST = async () => {
	const db = await getDb();

	try {
		const results = await syncAllProviders(db);

		// Invalidate cache after sync
		invalidateAllCompendiumCache();

		// Also clear the repository's in-memory cache
		const { compendiumRepository } = await import('$lib/server/db/repositories/compendium');
		compendiumRepository.invalidateAllCache();

		// Aggregate results for response
		const totalSpells = results.reduce((sum, r) => sum + r.spells, 0);
		const totalMonsters = results.reduce((sum, r) => sum + r.monsters, 0);
		const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

		console.info('[compendium-sync] Results:', {
			spells: totalSpells,
			monsters: totalMonsters,
			providers: results.map((r) => ({
				id: r.providerId,
				spells: r.spells,
				monsters: r.monsters,
				errors: r.errors
			}))
		});

		return json({
			ok: totalErrors === 0,
			summary: {
				spells: totalSpells,
				monsters: totalMonsters
			},
			errors: totalErrors > 0 ? results.flatMap((r) => r.errors) : undefined
		});
	} catch (error) {
		console.error('[compendium-sync] Error:', error);
		return json(
			{
				ok: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
