import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import { syncAllProviders } from '$lib/server/services/multiProviderSync';
import { invalidateAllCompendiumCache } from '$lib/server/repositories/compendium';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('AdminSyncAPI');

function assertAuthorized(request: Request) {
	const token = env.ADMIN_SYNC_TOKEN;
	if (!token) {
		log.warn('No ADMIN_SYNC_TOKEN configured - sync endpoint is unprotected');
		return;
	}

	const header = request.headers.get('authorization');
	if (!header || header !== `Bearer ${token}`) {
		log.warn({ hasHeader: !!header }, 'Unauthorized sync attempt');
		throw error(401, 'Unauthorized');
	}
}

export const POST = async ({ request }: { request: Request }) => {
	log.info('Admin sync request received');
	assertAuthorized(request);

	const db = await getDb();
	log.debug('Starting provider sync');
	const startTime = Date.now();

	const results = await syncAllProviders(db);

	const duration = Date.now() - startTime;
	log.info({ providerCount: results.length, duration }, 'Sync completed');

	// Invalidate cache after sync
	log.debug('Invalidating compendium cache');
	invalidateAllCompendiumCache();

	// Aggregate results for response
	const totalSpells = results.reduce((sum, r) => sum + r.spells, 0);
	const totalMonsters = results.reduce((sum, r) => sum + r.monsters, 0);
	const totalItems = results.reduce((sum, r) => sum + r.items, 0);
	const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
	const providersWithErrors = results.filter((r) => r.errors.length > 0).length;

	log.info(
		{
			duration,
			summary: {
				spells: totalSpells,
				monsters: totalMonsters,
				items: totalItems,
				totalItems: totalSpells + totalMonsters + totalItems,
				providersSynced: results.length,
				providersWithErrors,
				totalErrors
			}
		},
		'Sync summary'
	);

	if (totalErrors > 0) {
		log.warn({ totalErrors, providersWithErrors }, 'Sync completed with errors');
	}

	return json({
		ok: true,
		providers: results,
		summary: {
			spells: totalSpells,
			monsters: totalMonsters,
			items: totalItems,
			totalItems: totalSpells + totalMonsters + totalItems,
			providersSynced: results.length,
			providersWithErrors,
			totalErrors
		}
	});
};
