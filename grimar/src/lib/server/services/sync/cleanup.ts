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

interface CleanupResult {
	disabledSources: string[];
	itemsRemoved: number;
	cacheRemoved: number;
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
	const enabledIds = new Set(providerRegistry.getEnabledProviders().map((p) => p.id));

	// Get all unique source IDs from compendium_items
	const allItems = await db.select().from(compendiumItems);
	const allSources = [
		...new Set(allItems.map((r) => r.source).filter((s): s is string => s !== null))
	];

	// Find sources that are NOT in the enabled list
	const disabledSources = allSources.filter((source) => !enabledIds.has(source));

	if (disabledSources.length === 0) {
		console.info('[cleanup] No disabled sources found - nothing to clean');
		return result;
	}

	console.info(
		`[cleanup] Found ${disabledSources.length} disabled sources to remove: ${disabledSources.join(', ')}`
	);

	// Delete items and cache for each disabled source
	for (const source of disabledSources) {
		// Count items before deletion using $count
		const itemsCount = await db.$count(compendiumItems, eq(compendiumItems.source, source));

		// Delete items from compendium_items
		await db.delete(compendiumItems).where(eq(compendiumItems.source, source)).execute();
		result.itemsRemoved += itemsCount;
		result.disabledSources.push(source);

		console.info(`[cleanup] Removed ${itemsCount} items from disabled source: ${source}`);

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

		console.info(`[cleanup] Removed ${cacheCount} cache entries from disabled source: ${source}`);
	}

	console.info(
		`[cleanup] Complete: ${result.itemsRemoved} items, ${result.cacheRemoved} cache entries removed`
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
	const enabledIds = new Set(providerRegistry.getEnabledProviders().map((p) => p.id));

	const allItems = await db.select().from(compendiumItems);
	const allSources = [
		...new Set(allItems.map((r) => r.source).filter((s): s is string => s !== null))
	];

	return allSources.filter((source) => !enabledIds.has(source));
}
