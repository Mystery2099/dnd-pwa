/**
 * Scheduling service for compendium sync operations
 */
import { syncAllProviders } from '../sync/orchestrator';
import { getDb } from '$lib/server/db';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SyncScheduler');

export class SyncScheduler {
	private static instance: SyncScheduler;

	private constructor() {}

	static getInstance(): SyncScheduler {
		if (!SyncScheduler.instance) {
			SyncScheduler.instance = new SyncScheduler();
		}
		return SyncScheduler.instance;
	}

	/**
	 * Schedule daily sync at 2 AM local time
	 */
	scheduleDailySync(): void {
		const scheduleSync = () => {
			const now = new Date();
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(2, 0, 0, 0); // 2:00 AM

			const msUntilSync = tomorrow.getTime() - now.getTime();

			log.info({ nextSync: tomorrow.toISOString() }, 'Next daily sync scheduled');

			setTimeout(async () => {
				try {
					const db = await getDb();
					await syncAllProviders(db);
					log.info('Daily sync completed successfully');
				} catch (error) {
					log.error({ error }, 'Daily sync failed');
				}

				// Schedule next sync
				scheduleSync();
			}, msUntilSync);
		};

		scheduleSync();
	}
}

export const syncScheduler = SyncScheduler.getInstance();
