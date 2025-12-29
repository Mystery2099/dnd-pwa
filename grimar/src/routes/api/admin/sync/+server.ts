import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import { syncAllProviders } from '$lib/server/services/multiProviderSync';
import { invalidateAllCompendiumCache } from '$lib/server/repositories/compendium';

function assertAuthorized(request: Request) {
	const token = env.ADMIN_SYNC_TOKEN;
	if (!token) return;

	const header = request.headers.get('authorization');
	if (!header || header !== `Bearer ${token}`) {
		throw error(401, 'Unauthorized');
	}
}

export const POST = async ({ request }: { request: Request }) => {
	assertAuthorized(request);

	const db = await getDb();
	const results = await syncAllProviders(db);

	// Invalidate cache after sync
	invalidateAllCompendiumCache();

	// Aggregate results for response
	const totalSpells = results.reduce((sum, r) => sum + r.spells, 0);
	const totalMonsters = results.reduce((sum, r) => sum + r.monsters, 0);
	const totalItems = results.reduce((sum, r) => sum + r.items, 0);
	const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

	return json({
		ok: true,
		providers: results,
		summary: {
			spells: totalSpells,
			monsters: totalMonsters,
			items: totalItems,
			totalItems: totalSpells + totalMonsters + totalItems,
			providersSynced: results.length,
			providersWithErrors: results.filter((r) => r.errors.length > 0).length,
			totalErrors
		}
	});
};
