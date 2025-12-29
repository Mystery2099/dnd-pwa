/**
 * Sync Orchestrator
 *
 * Orchestrates multi-provider sync operations.
 * Uses retry and metrics modules for reliability and monitoring.
 */

import { providerRegistry } from '$lib/server/providers';
import { compendiumCache, compendiumItems } from '$lib/server/db/schema';
import type { Db } from '$lib/server/db';
import type { CompendiumTypeName } from '$lib/types/compendium';
import type {
	CompendiumProvider,
	ProviderSyncResult,
	TransformResult
} from '$lib/server/providers/types';
import { withRetry } from './retry';
import { createSyncMetrics, recordItemProcessed, recordError, getSyncSummary } from './metrics';
import {
	logSync,
	logSyncStart,
	logSyncEnd,
	logItemStart,
	logTransformSuccess,
	logTransformFailed,
	logInserting,
	logInsertSuccess,
	logInsertFailed
} from './debug-sync';

interface SyncOptions {
	/** Types to sync (defaults to all) */
	types?: CompendiumTypeName[];
	/** Force full sync even if provider supports incremental */
	forceFull?: boolean;
	/** Provider IDs to sync (defaults to all enabled) */
	providerIds?: string[];
	/** Number of retry attempts for failed operations */
	maxRetries?: number;
	/** Delay between retries in ms (exponential backoff applied) */
	retryDelayMs?: number;
}

// Default retry configuration
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;
// Batch size for transaction processing
const BATCH_SIZE = 100;

/**
 * Sync compendium data from all enabled providers
 *
 * @param db - Database instance
 * @param options - Sync options
 * @returns Array of sync results, one per provider
 */
export async function syncAllProviders(
	db: Db,
	options?: SyncOptions
): Promise<ProviderSyncResult[]> {
	const metrics = createSyncMetrics();

	const registry = providerRegistry;
	const enabledProviders = registry.getEnabledProviders();
	const typesToSync = options?.types || ['spell', 'monster', 'item'];
	const providerIds = options?.providerIds;
	const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
	const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

	console.info(`[sync-orchestrator] Starting sync with ${enabledProviders.length} providers`, {
		maxRetries,
		retryDelayMs,
		types: typesToSync,
		providerFilter: providerIds || 'all'
	});

	const results: ProviderSyncResult[] = [];

	console.info(`[sync-orchestrator] Types to sync:`, typesToSync);

	for (const provider of enabledProviders) {
		// Filter by provider IDs if specified
		if (providerIds && !providerIds.includes(provider.id)) {
			console.debug(`[sync-orchestrator] Skipping provider: ${provider.id}`);
			continue;
		}

		// Use retry logic for provider sync
		const providerResult = await withRetry(
			async () => syncSingleProvider(db, provider.id, typesToSync, metrics),
			{ maxRetries, retryDelayMs, operationName: provider.name }
		);
		results.push(providerResult);
	}

	// Log final metrics
	const summary = getSyncSummary(metrics);
	console.info(`[sync-orchestrator] Sync completed in ${summary.duration}ms`, summary);

	return results;
}

/**
 * Sync data from a single provider
 */
async function syncSingleProvider(
	db: Db,
	providerId: string,
	types: CompendiumTypeName[],
	metrics: ReturnType<typeof createSyncMetrics>
): Promise<ProviderSyncResult> {
	const registry = providerRegistry;
	const provider = registry.getProvider(providerId);

	if (!provider) {
		return {
			providerId,
			spells: 0,
			monsters: 0,
			items: 0,
			feats: 0,
			backgrounds: 0,
			races: 0,
			classes: 0,
			totalItems: 0,
			errors: [`Provider not found: ${providerId}`]
		};
	}

	const result: ProviderSyncResult = {
		providerId,
		spells: 0,
		monsters: 0,
		items: 0,
		feats: 0,
		backgrounds: 0,
		races: 0,
		classes: 0,
		totalItems: 0,
		errors: []
	};

	console.info(`[sync-orchestrator] Syncing provider: ${provider.name}`);

	for (const type of types) {
		// Check if provider supports this type
		if (!provider.supportedTypes.includes(type)) {
			console.debug(`[sync-orchestrator] Provider ${provider.id} does not support type: ${type}`);
			continue;
		}

		try {
			// Use retry logic for type sync
			const itemCount = await withRetry(
				async () => syncTypeFromProvider(db, provider.id, type, provider, metrics),
				{
					maxRetries: DEFAULT_MAX_RETRIES,
					retryDelayMs: DEFAULT_RETRY_DELAY_MS,
					operationName: `${provider.name}/${type}`
				}
			);
			result.totalItems += itemCount;

			switch (type) {
				case 'spell':
					result.spells = itemCount;
					break;
				case 'monster':
					result.monsters = itemCount;
					break;
				case 'item':
					result.items = itemCount;
					break;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			result.errors.push(`Failed to sync ${type}: ${errorMessage}`);
			recordError(metrics, provider.id, errorMessage);
			console.error(`[sync-orchestrator] Error syncing ${type} from ${provider.id}:`, error);
		}
	}

	console.info(
		`[sync-orchestrator] Completed sync for ${provider.id}: ${result.totalItems} items, ${result.errors.length} errors`
	);
	return result;
}

/**
 * Sync a specific type from a provider
 */
async function syncTypeFromProvider(
	db: Db,
	providerId: string,
	type: CompendiumTypeName,
	provider: CompendiumProvider,
	metrics: ReturnType<typeof createSyncMetrics>
): Promise<number> {
	// Fetch all items from provider
	if (!provider.fetchAllPages) {
		throw new Error(`Provider ${provider.id} does not support bulk fetch`);
	}

	// Fetch with retry logic
	const rawItems = await withRetry(async () => provider.fetchAllPages!(type), {
		maxRetries: DEFAULT_MAX_RETRIES,
		retryDelayMs: DEFAULT_RETRY_DELAY_MS,
		operationName: `${provider.id}/${type}/fetch`
	});

	logSyncStart(type, providerId, rawItems.length);

	let count = 0;
	let failedCount = 0;

	// Transform all items first (outside transaction)
	const transformedItems: Array<{ raw: unknown; transformed: TransformResult }> = [];
	for (let index = 0; index < rawItems.length; index++) {
		const rawItem = rawItems[index];
		logItemStart(index, rawItems.length);

		try {
			const transformed = await provider.transformItem(rawItem, type);
			logTransformSuccess(type, transformed.externalId, transformed.name);
			transformedItems.push({ raw: rawItem, transformed });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logTransformFailed(type, 'unknown', errorMessage, { index });
			failedCount++;
		}
	}

	// Process in batches
	for (let batchIndex = 0; batchIndex < transformedItems.length; batchIndex += BATCH_SIZE) {
		const batch = transformedItems.slice(batchIndex, batchIndex + BATCH_SIZE);

		try {
			await db.transaction((tx) => {
				for (const { transformed } of batch) {
					// Store raw cache data
					const cacheId = `${providerId}:${type}:${transformed.externalId}`;
					tx.insert(compendiumCache)
						.values({
							id: cacheId,
							type,
							data: transformed.details
						})
						.onConflictDoUpdate({
							target: compendiumCache.id,
							set: { data: transformed.details }
						})
						.execute();

					// Store processed item
					tx.insert(compendiumItems)
						.values({
							source: providerId,
							type,
							externalId: transformed.externalId,
							name: transformed.name,
							summary: transformed.summary,
							details: transformed.details,
							spellLevel: transformed.spellLevel,
							spellSchool: transformed.spellSchool,
							challengeRating: transformed.challengeRating,
							monsterSize: transformed.monsterSize,
							monsterType: transformed.monsterType
						})
						.onConflictDoUpdate({
							target: [compendiumItems.type, compendiumItems.externalId],
							set: {
								name: transformed.name,
								summary: transformed.summary,
								details: transformed.details,
								spellLevel: transformed.spellLevel,
								spellSchool: transformed.spellSchool,
								challengeRating: transformed.challengeRating,
								monsterSize: transformed.monsterSize,
								monsterType: transformed.monsterType
							}
						})
						.execute();
				}
			});

			count += batch.length;
			recordItemProcessed(metrics, { batchSize: batch.length });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logInsertFailed(type, 'batch', errorMessage);
			recordError(metrics, providerId, errorMessage);
			// Continue with next batch
			failedCount += batch.length;
		}
	}

	logSyncEnd(type, count, rawItems.length);
	return count;
}

/**
 * Check health of all providers
 */
export async function checkAllProviders(): Promise<{
	healthy: string[];
	unhealthy: string[];
}> {
	const registry = providerRegistry;
	const enabledProviders = registry.getEnabledProviders();

	const results = await Promise.all(
		enabledProviders.map(async (provider) => {
			const healthy = await provider.healthCheck();
			return { id: provider.id, healthy };
		})
	);

	return {
		healthy: results.filter((r) => r.healthy).map((r) => r.id),
		unhealthy: results.filter((r) => !r.healthy).map((r) => r.id)
	};
}

/**
 * Sync a specific provider by ID
 */
export async function syncProviderById(
	db: Db,
	providerId: string,
	options?: SyncOptions
): Promise<ProviderSyncResult> {
	const types = options?.types || ['spell', 'monster', 'item'];
	const metrics = createSyncMetrics();

	return syncSingleProvider(db, providerId, types, metrics);
}
