/**
 * Sync metadata management for tracking sync operations
 */
import type { Db } from '$lib/server/db';
import { syncMetadata as syncMetadataTable } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SyncMetadata');

type SyncMetadataRow = typeof syncMetadataTable.$inferSelect;

export interface SyncMetadata {
	lastSyncTime: string | null;
	syncCount: number;
	lastSyncDuration: number;
}

export interface ProviderSyncMetadata extends SyncMetadata {
	providerId: string;
}

export class SyncMetadataManager {
	async getLastSyncTime(db: Db, providerId: string): Promise<number | null> {
		try {
			const result = await db
				.select()
				.from(syncMetadataTable)
				.where(eq(syncMetadataTable.providerId, providerId))
				.limit(1);
			const ts = result[0]?.lastSyncAt;
			return ts ? ts.getTime() : null;
		} catch (error) {
			log.warn({ providerId, error }, 'Could not get last sync time');
			return null;
		}
	}

	async updateSyncMetadata(
		db: Db,
		providerId: string,
		timestamp: Date,
		itemCount: number
	): Promise<void> {
		try {
			await db
				.insert(syncMetadataTable)
				.values({
					providerId,
					lastSyncAt: timestamp,
					itemCount
				})
				.onConflictDoUpdate({
					target: syncMetadataTable.providerId,
					set: {
						lastSyncAt: timestamp,
						itemCount
					}
				});
			log.info(
				{ providerId, itemCount, timestamp: timestamp.toISOString() },
				'Updated metadata'
			);
		} catch (error) {
			log.warn({ providerId, error }, 'Could not update metadata');
		}
	}

	async getSyncMetadata(db: Db): Promise<ProviderSyncMetadata[]> {
		try {
			const results = await db
				.select()
				.from(syncMetadataTable)
				.orderBy(desc(syncMetadataTable.lastSyncAt));
			return results.map((r: SyncMetadataRow) => ({
				providerId: r.providerId,
				lastSyncTime: r.lastSyncAt ? r.lastSyncAt.toISOString() : null,
				syncCount: r.itemCount ?? 0,
				lastSyncDuration: 0
			}));
		} catch (error) {
			log.warn({ error }, 'Could not get sync metadata');
			return [];
		}
	}

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
				lastSyncTime: r.lastSyncAt ? r.lastSyncAt.toISOString() : null,
				syncCount: r.itemCount ?? 0,
				lastSyncDuration: 0
			};
		} catch (error) {
			log.warn({ providerId, error }, 'Could not get metadata');
			return null;
		}
	}
}

export const syncMetadataManager = new SyncMetadataManager();
