/**
 * Sync Orchestrator
 *
 * Orchestrates multi-provider sync operations.
 * Uses retry and metrics modules for reliability and monitoring.
 */

import { providerRegistry } from '$lib/server/providers';
import { compendiumCache, compendiumItems } from '$lib/server/db/schema';
import type { Db } from '$lib/server/db';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import type {
	CompendiumProvider,
	ProviderSyncResult,
	TransformResult
} from '$lib/server/providers/types';
import { withRetry } from './retry';
import {
	createSyncMetrics,
	recordItemProcessed,
	recordError,
	getSyncSummary
} from './sync-metrics';
import { cleanupDisabledSources } from './sync-cleanup';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
	logSyncStart,
	logSyncEnd,
	logItemStart,
	logTransformSuccess,
	logTransformFailed,
	logInsertFailed
} from './debug-sync';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SyncOrchestrator');

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

// Type canonicalization mapping (handles singular/plural variations from different APIs)
const TYPE_CANONICAL: Record<string, CompendiumTypeName> = {
	spell: 'spell',
	spells: 'spell',
	monster: 'monster',
	monsters: 'monster',
	item: 'item',
	items: 'item',
	feat: 'feat',
	feats: 'feat',
	background: 'background',
	backgrounds: 'background',
	race: 'race',
	races: 'race',
	class: 'class',
	classes: 'class'
};

function normalizeType(type: string): CompendiumTypeName | null {
	return TYPE_CANONICAL[type.toLowerCase()] || null;
}

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

	// Build set of types to sync based on enabled providers' supportedTypes
	const allProviderTypes = new Set<CompendiumTypeName>();
	for (const provider of enabledProviders) {
		for (const t of provider.supportedTypes) {
			const normalized = normalizeType(t);
			if (normalized) allProviderTypes.add(normalized);
		}
	}

	// Use only types that at least one provider supports
	const typesToSync = options?.types?.length
		? options.types.filter((t) => allProviderTypes.has(t))
		: Array.from(allProviderTypes);

	const providerIds = options?.providerIds;
	const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
	const retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

	log.info(
		{
			providerCount: enabledProviders.length,
			maxRetries,
			retryDelayMs,
			types: typesToSync,
			providerFilter: providerIds || 'all'
		},
		'Starting sync'
	);

	const results: ProviderSyncResult[] = [];

	log.info({ types: typesToSync }, 'Types to sync');

	for (const provider of enabledProviders) {
		// Filter by provider IDs if specified
		if (providerIds && !providerIds.includes(provider.id)) {
			log.debug({ providerId: provider.id }, 'Skipping provider');
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
	log.info({ ...summary }, 'Sync completed');

	// Cleanup disabled sources
	log.info('Running cleanup for disabled sources...');
	const cleanupResult = await cleanupDisabledSources(db);
	if (cleanupResult.disabledSources.length > 0) {
		log.info(
			{
				itemsRemoved: cleanupResult.itemsRemoved,
				cacheRemoved: cleanupResult.cacheRemoved,
				disabledSources: cleanupResult.disabledSources
			},
			'Cleanup completed'
		);
	}

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

	log.info({ providerName: provider.name }, 'Syncing provider');

	for (const type of types) {
		// Check if provider supports this type
		if (!provider.supportedTypes.includes(type)) {
			log.debug({ providerId: provider.id, type }, 'Provider does not support type');
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
				case 'feat':
					result.feats = itemCount;
					break;
				case 'background':
					result.backgrounds = itemCount;
					break;
				case 'race':
					result.races = itemCount;
					break;
				case 'class':
					result.classes = itemCount;
					break;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			result.errors.push(`Failed to sync ${type}: ${errorMessage}`);
			recordError(metrics, provider.id, errorMessage);
			log.error({ providerId: provider.id, type, error }, 'Error syncing type');
		}
	}

	log.info(
		{ providerId: provider.id, totalItems: result.totalItems, errorCount: result.errors.length },
		'Completed sync for provider'
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

	// Transform all items first (outside transaction)
	const transformedItems: Array<{ raw: unknown; transformed: TransformResult }> = [];
	const seenExternalIds = new Map<string, number>(); // externalId -> index (to keep first occurrence)

	for (let index = 0; index < rawItems.length; index++) {
		const rawItem = rawItems[index];
		logItemStart(index, rawItems.length);

		try {
			const transformed = await provider.transformItem(rawItem, type);

			// Deduplicate: keep only the first occurrence of each (type, source, externalId)
			const key = `${type}:${providerId}:${transformed.externalId}`;
			if (seenExternalIds.has(key)) {
				logTransformFailed(type, transformed.externalId, 'Duplicate item skipped', { index });
				continue;
			}
			seenExternalIds.set(key, index);

			logTransformSuccess(type, transformed.externalId, transformed.name);
			transformedItems.push({ raw: rawItem, transformed });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logTransformFailed(type, 'unknown', errorMessage, { index });
		}
	}

	if (seenExternalIds.size < rawItems.length) {
		log.info(
			{ duplicatesRemoved: rawItems.length - seenExternalIds.size },
			'Deduplication completed'
		);
	}

	// Process in batches
	const DATA_ROOT = 'data/compendium';
	const typeDir = join(process.cwd(), DATA_ROOT, type);
	if (!existsSync(typeDir)) {
		mkdirSync(typeDir, { recursive: true });
	}

	for (let batchIndex = 0; batchIndex < transformedItems.length; batchIndex += BATCH_SIZE) {
		const batch = transformedItems.slice(batchIndex, batchIndex + BATCH_SIZE);

		try {
			await db.transaction(async (tx) => {
				for (const { transformed } of batch) {
					// Save to external JSON file
					const fileName = `${transformed.externalId}.json`;
					const relativePath = join(DATA_ROOT, type, fileName);
					const fullPath = join(process.cwd(), relativePath);

					try {
						writeFileSync(fullPath, JSON.stringify(transformed.details, null, 2));
					} catch (fsError) {
						log.error({ filePath: fullPath, error: fsError }, 'Failed to write file');
						// We continue with DB insert anyway, but jsonPath might be broken
					}

					// Store raw cache data
					const cacheId = `${providerId}:${type}:${transformed.externalId}`;
					await tx
						.insert(compendiumCache)
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
					await tx
						.insert(compendiumItems)
						.values({
							source: providerId,
							type,
							externalId: transformed.externalId,
							name: transformed.name,
							summary: transformed.summary,
							details: transformed.details,
							jsonPath: relativePath,
							spellLevel: transformed.spellLevel,
							spellSchool: transformed.spellSchool,
							challengeRating: transformed.challengeRating,
							monsterSize: transformed.monsterSize,
							monsterType: transformed.monsterType,
							classHitDie: transformed.classHitDie,
							raceSize: transformed.raceSize,
							raceSpeed: transformed.raceSpeed,
							backgroundFeature: transformed.backgroundFeature,
							backgroundSkillProficiencies: transformed.backgroundSkillProficiencies,
							featPrerequisites: transformed.featPrerequisites
						})
						.onConflictDoUpdate({
							target: [compendiumItems.type, compendiumItems.source, compendiumItems.externalId],
							set: {
								name: transformed.name,
								summary: transformed.summary,
								details: transformed.details,
								jsonPath: relativePath,
								spellLevel: transformed.spellLevel,
								spellSchool: transformed.spellSchool,
								challengeRating: transformed.challengeRating,
								monsterSize: transformed.monsterSize,
								monsterType: transformed.monsterType,
								classHitDie: transformed.classHitDie,
								raceSize: transformed.raceSize,
								raceSpeed: transformed.raceSpeed,
								backgroundFeature: transformed.backgroundFeature,
								backgroundSkillProficiencies: transformed.backgroundSkillProficiencies,
								featPrerequisites: transformed.featPrerequisites
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
	const types = options?.types || [
		'spell',
		'monster',
		'item',
		'feat',
		'background',
		'race',
		'class'
	];
	const metrics = createSyncMetrics();

	return syncSingleProvider(db, providerId, types, metrics);
}
