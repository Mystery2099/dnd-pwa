/**
 * Sync Cleanup Module
 *
 * Removes data from disabled providers after sync completes.
 * Ensures the database matches the enabled provider configuration.
 */

import { providerRegistry } from '$lib/server/providers';
import { compendium } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { removeItemFromFts } from '$lib/server/db/db-fts';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SyncCleanup');

interface CleanupResult {
	disabledSources: string[];
	itemsRemoved: number;
}

/**
 * Get enabled provider IDs as a Set
 */
function getEnabledProviderIds(): Set<string> {
	return new Set(providerRegistry.getEnabledProviders().map((p) => p.id));
}

/**
 * Get all unique source IDs from compendium
 */
async function getAllSourceIds(db: Db): Promise<string[]> {
	const allItems = await db.select().from(compendium);
	return [...new Set(allItems.map((r) => r.source).filter((s): s is string => s !== null))];
}

/**
 * Remove all data from providers that are not enabled in configuration.
 *
 * @param db - Database instance
 * @returns Cleanup result with sources removed and counts
 */
export async function cleanupDisabledSources(db: Db): Promise<CleanupResult> {
	const result: CleanupResult = {
		disabledSources: [],
		itemsRemoved: 0
	};

	const enabledIds = getEnabledProviderIds();
	const allSources = await getAllSourceIds(db);
	const disabledSources = allSources.filter((source) => !enabledIds.has(source));

	if (disabledSources.length === 0) {
		log.info('No disabled sources found - nothing to clean');
		return result;
	}

	log.info({ disabledSources }, 'Found disabled sources to remove');

	for (const source of disabledSources) {
		const itemsToDelete = await db
			.select({ key: compendium.key })
			.from(compendium)
			.where(eq(compendium.source, source));

		const itemsCount = await db.$count(compendium, eq(compendium.source, source));

		await db.delete(compendium).where(eq(compendium.source, source)).execute();
		result.itemsRemoved += itemsCount;
		result.disabledSources.push(source);

		for (const item of itemsToDelete) {
			try {
				await removeItemFromFts(item.key, db);
			} catch (ftsError) {
				log.warn({ itemKey: item.key, error: ftsError }, 'Failed to remove item from FTS');
			}
		}

		log.info({ source, itemsCount }, 'Removed items from disabled source');
	}

	log.info({ itemsRemoved: result.itemsRemoved }, 'Cleanup complete');

	return result;
}

/**
 * Check if any providers have been disabled since last sync.
 */
export async function getDisabledSourcesWithData(db: Db): Promise<string[]> {
	const enabledIds = getEnabledProviderIds();
	const allSources = await getAllSourceIds(db);

	return allSources.filter((source) => !enabledIds.has(source));
}
