import type { SyncProgressCallback, SyncResult } from '$lib/server/providers/types';
import { getAllProviders } from '$lib/server/providers';

export async function syncAllProviders(
	progressCallback?: SyncProgressCallback
): Promise<Map<string, SyncResult>> {
	const results = new Map<string, SyncResult>();
	const providers = getAllProviders();

	for (const provider of providers) {
		if (progressCallback) {
			progressCallback({
				provider: provider.name,
				type: 'all',
				status: 'starting',
				itemsProcessed: 0,
				message: `Starting sync for ${provider.displayName}`
			});
		}

		try {
			const result = await provider.sync();
			results.set(provider.name, result);

			if (progressCallback) {
				progressCallback({
					provider: provider.name,
					type: 'all',
					status: result.success ? 'complete' : 'error',
					itemsProcessed: result.itemsSynced,
					message: result.success
						? `Synced ${result.itemsSynced} items from ${provider.displayName}`
						: `Sync failed for ${provider.displayName}`
				});
			}
		} catch (error) {
			const errorResult: SyncResult = {
				success: false,
				itemsSynced: 0,
				errors: [error instanceof Error ? error.message : 'Unknown error'],
				duration: 0
			};
			results.set(provider.name, errorResult);

			if (progressCallback) {
				progressCallback({
					provider: provider.name,
					type: 'all',
					status: 'error',
					itemsProcessed: 0,
					message: `Sync failed for ${provider.displayName}`,
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		}
	}

	return results;
}

export async function syncProvider(
	providerName: string,
	progressCallback?: SyncProgressCallback
): Promise<SyncResult | null> {
	const providers = getAllProviders();
	const provider = providers.find((p) => p.name === providerName);

	if (!provider) {
		return null;
	}

	return provider.sync();
}

export type { SyncProgressCallback, SyncResult };
