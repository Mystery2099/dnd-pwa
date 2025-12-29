/**
 * Sync metadata management for tracking sync operations
 */
import type { Db } from '$lib/server/db';
import { syncMetadata as syncMetadataTable } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

// Define the table row type inline (avoid naming conflict with interface)
type SyncMetadataRow = typeof syncMetadataTable.$inferSelect;

export interface SyncMetadata {
	lastSyncTime: string | null;
	syncCount: number;
	lastSyncDuration: number;
	lastSyncType: 'full' | 'incremental';
}

export interface ProviderSyncMetadata extends SyncMetadata {
	providerId: string;
}

export class SyncMetadataManager {
	/**
	 * Get last sync timestamp for a provider
	 */
	async getLastSyncTime(db: Db, providerId: string): Promise<number | null> {
		try {
			const result = await db
				.select()
				.from(syncMetadataTable)
				.where(eq(syncMetadataTable.providerId, providerId))
				.limit(1);
			return result[0]?.lastSyncAt ?? null;
		} catch (error) {
			console.warn(`[sync-metadata] Could not get last sync time for ${providerId}:`, error);
			return null;
		}
	}

	/**
	 * Update sync metadata after completion
	 */
	async updateSyncMetadata(
		db: Db,
		providerId: string,
		timestamp: number,
		itemsSynced: number,
		syncType: 'full' | 'incremental' = 'full'
	): Promise<void> {
		try {
			await db
				.insert(syncMetadataTable)
				.values({
					providerId,
					lastSyncAt: timestamp,
					lastSyncType: syncType,
					itemsSynced
				})
				.onConflictDoUpdate({
					target: syncMetadataTable.providerId,
					set: {
						lastSyncAt: timestamp,
						lastSyncType: syncType,
						itemsSynced
					}
				});
			console.log(
				`[sync-metadata] Updated metadata for ${providerId}: ${itemsSynced} items at ${new Date(timestamp).toISOString()}`
			);
		} catch (error) {
			console.warn(`[sync-metadata] Could not update metadata for ${providerId}:`, error);
		}
	}

	/**
	 * Get comprehensive sync metadata for all providers
	 */
	async getSyncMetadata(db: Db): Promise<ProviderSyncMetadata[]> {
		try {
			const results = await db
				.select()
				.from(syncMetadataTable)
				.orderBy(desc(syncMetadataTable.lastSyncAt));
			return results.map((r: SyncMetadataRow) => ({
				providerId: r.providerId,
				lastSyncTime: r.lastSyncAt ? new Date(r.lastSyncAt).toISOString() : null,
				syncCount: r.itemsSynced ?? 0,
				lastSyncDuration: 0, // Not tracked
				lastSyncType: (r.lastSyncType as 'full' | 'incremental') ?? 'full'
			}));
		} catch (error) {
			console.warn('[sync-metadata] Could not get sync metadata:', error);
			return [];
		}
	}

	/**
	 * Get metadata for a specific provider
	 */
	async getProviderMetadata(db: Db, providerId: string): Promise<ProviderSyncMetadata | null> {
		try {
			const result = await db
				.select()
				.from(syncMetadataTable)
				.where(eq(syncMetadataTable.providerId, providerId))
				.limit(1);
			if (!result[0]) return null;
			const r = result[0] as SyncMetadataRow;
			return {
				providerId: r.providerId,
				lastSyncTime: r.lastSyncAt ? new Date(r.lastSyncAt).toISOString() : null,
				syncCount: r.itemsSynced ?? 0,
				lastSyncDuration: 0,
				lastSyncType: (r.lastSyncType as 'full' | 'incremental') ?? 'full'
			};
		} catch (error) {
			console.warn(`[sync-metadata] Could not get metadata for ${providerId}:`, error);
			return null;
		}
	}
}

export const syncMetadataManager = new SyncMetadataManager();
