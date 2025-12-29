/**
 * Scheduling service for compendium sync operations
 */
import { syncAllProviders } from '../multiProviderSync';
import { getDb } from '$lib/server/db';

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

			console.log(`[sync-scheduler] Next daily sync scheduled for ${tomorrow.toISOString()}`);

			setTimeout(async () => {
				try {
					const db = await getDb();
					await syncAllProviders(db);
					console.info('[sync-scheduler] Daily sync completed successfully');
				} catch (error) {
					console.error('[sync-scheduler] Daily sync failed:', error);
				}

				// Schedule next sync
				scheduleSync();
			}, msUntilSync);
		};

		scheduleSync();
	}
}

export const syncScheduler = SyncScheduler.getInstance();
