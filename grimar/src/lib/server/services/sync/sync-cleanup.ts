/**
 * Sync Cleanup Module
 *
 * Removes data from disabled providers after sync completes.
 * Ensures the database matches the enabled provider configuration.
 */

import { providerRegistry } from '$lib/server/providers';
import { compendiumCache, compendiumItems } from '$lib/server/db/schema';
import { eq, like } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SyncCleanup');

interface CleanupResult {
	disabledSources: string[];
	itemsRemoved: number;
	cacheRemoved: number;
}

/**
 * Get enabled provider IDs as a Set
 */
function getEnabledProviderIds(): Set<string> {
	return new Set(providerRegistry.getEnabledProviders().map((p) => p.id));
}

/**
 * Get all unique source IDs from compendium_items
 */
async function getAllSourceIds(db: Db): Promise<string[]> {
	const allItems = await db.select().from(compendiumItems);
	return [...new Set(allItems.map((r) => r.source).filter((s): s is string => s !== null))];
}

/**
 * Remove all data from providers that are not enabled in configuration.
 *
 * This function:
 * 1. Gets the list of enabled provider IDs from the registry
 * 2. Finds all unique sources currently in the database
 * 3. Identifies sources that are NOT enabled
 * 4. Deletes items and cache for those disabled sources
 *
 * @param db - Database instance
 * @returns Cleanup result with sources removed and counts
 */
export async function cleanupDisabledSources(db: Db): Promise<CleanupResult> {
	const result: CleanupResult = {
		disabledSources: [],
		itemsRemoved: 0,
		cacheRemoved: 0
	};

	// Get enabled provider IDs
	const enabledIds = getEnabledProviderIds();

	// Get all unique source IDs from compendium_items
	const allSources = await getAllSourceIds(db);

	// Find sources that are NOT in the enabled list
	const disabledSources = allSources.filter((source) => !enabledIds.has(source));

	if (disabledSources.length === 0) {
		log.info('No disabled sources found - nothing to clean');
		return result;
	}

	log.info({ disabledSources }, 'Found disabled sources to remove');

	// Delete items and cache for each disabled source
	for (const source of disabledSources) {
		// Count items before deletion using $count
		const itemsCount = await db.$count(compendiumItems, eq(compendiumItems.source, source));

		// Delete items from compendium_items
		await db.delete(compendiumItems).where(eq(compendiumItems.source, source)).execute();
		result.itemsRemoved += itemsCount;
		result.disabledSources.push(source);

		log.info({ source, itemsCount }, 'Removed items from disabled source');

		// Count cache entries for this source (filter in memory)
		const allCache = await db.select().from(compendiumCache);
		const sourceCache = allCache.filter((c) => c.id.startsWith(`${source}:`));
		const cacheCount = sourceCache.length;

		// Delete cache entries (format: "${source}:${type}:${externalId}")
		await db
			.delete(compendiumCache)
			.where(like(compendiumCache.id, `${source}:%`))
			.execute();
		result.cacheRemoved += cacheCount;

		log.info({ source, cacheCount }, 'Removed cache entries from disabled source');
	}

	log.info(
		{ itemsRemoved: result.itemsRemoved, cacheRemoved: result.cacheRemoved },
		'Cleanup complete'
	);

	return result;
}

/**
 * Check if any providers have been disabled since last sync.
 *
 * @param db - Database instance
 * @returns List of disabled sources that have data in the database
 */
export async function getDisabledSourcesWithData(db: Db): Promise<string[]> {
	const enabledIds = getEnabledProviderIds();
	const allSources = await getAllSourceIds(db);

	return allSources.filter((source) => !enabledIds.has(source));
}
