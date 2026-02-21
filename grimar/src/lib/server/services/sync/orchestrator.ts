/**
 * Sync Orchestrator
 *
 * Simplified for new schema aligned with Open5e API v2.
 * Uses key-based storage instead of auto-increment IDs.
 */

import { providerRegistry, SYNC_CONFIG } from '$lib/server/providers';
import { compendium, type CompendiumType } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { withTransaction } from '$lib/server/db';
import type { CompendiumProvider, ProviderSyncResult, TransformResult } from '$lib/server/providers/types';
import type { SyncProgressCallback } from './progress';
import { withRetry } from './retry';
import { cleanupDisabledSources } from './sync-cleanup';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SyncOrchestrator');

interface SyncOptions {
	types?: CompendiumType[];
	forceFull?: boolean;
	providerIds?: string[];
	maxRetries?: number;
	retryDelayMs?: number;
	onProgress?: SyncProgressCallback;
}

const MAX_RETRIES = SYNC_CONFIG.retryAttempts;
const RETRY_DELAY_MS = SYNC_CONFIG.retryDelayMs;
const BATCH_SIZE = 100;

function emitProgress(onProgress: SyncProgressCallback | undefined, event: Parameters<SyncProgressCallback>[0]): void {
	try {
		onProgress?.(event);
	} catch (error) {
		log.warn({ error }, 'Progress callback error');
	}
}

export async function syncAllProviders(db: Db, options?: SyncOptions): Promise<ProviderSyncResult[]> {
	const registry = providerRegistry;
	const enabledProviders = registry.getEnabledProviders();

	const allProviderTypes = new Set<CompendiumType>();
	for (const provider of enabledProviders) {
		for (const t of provider.supportedTypes) {
			allProviderTypes.add(t as CompendiumType);
		}
	}

	log.info({ enabledProviders: enabledProviders.length, totalTypes: allProviderTypes.size }, 'Starting sync');

	const typesToSync = options?.types?.length ? options.types.filter((t) => allProviderTypes.has(t)) : Array.from(allProviderTypes);
	const providerIds = options?.providerIds;
	const onProgress = options?.onProgress;

	const results: ProviderSyncResult[] = [];

	for (const provider of enabledProviders) {
		if (providerIds && !providerIds.includes(provider.id)) {
			continue;
		}

		emitProgress(onProgress, {
			phase: 'provider:start',
			providerId: provider.id,
			providerName: provider.name,
			timestamp: new Date()
		});

		const providerResult = await withRetry(
			() => syncSingleProvider(db, provider, typesToSync, onProgress),
			{ maxRetries: MAX_RETRIES, retryDelayMs: RETRY_DELAY_MS, operationName: provider.name }
		);

		emitProgress(onProgress, {
			phase: 'provider:complete',
			providerId: provider.id,
			providerName: provider.name,
			total: providerResult.totalItems,
			timestamp: new Date()
		});

		results.push(providerResult);
	}

	log.info('Running cleanup for disabled sources...');
	await cleanupDisabledSources(db);

	return results;
}

async function syncSingleProvider(
	db: Db,
	provider: CompendiumProvider,
	types: CompendiumType[],
	onProgress?: SyncProgressCallback
): Promise<ProviderSyncResult> {
	const result: ProviderSyncResult = {
		providerId: provider.id,
		counts: {},
		totalItems: 0,
		skipped: 0,
		errors: []
	};

	for (const type of types) {
		if (!provider.supportedTypes.includes(type)) {
			continue;
		}

		try {
			const itemCount = await withRetry(
				() => syncTypeFromProvider(db, provider, type, onProgress),
				{ maxRetries: MAX_RETRIES, retryDelayMs: RETRY_DELAY_MS, operationName: `${provider.id}/${type}` }
			);

			result.counts[type] = itemCount;
			result.totalItems += itemCount;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			result.errors.push(`Failed to sync ${type}: ${errorMessage}`);
			log.error({ providerId: provider.id, type, error }, 'Error syncing type');

			emitProgress(onProgress, {
				phase: 'error',
				providerId: provider.id,
				providerName: provider.name,
				type,
				error: errorMessage,
				timestamp: new Date()
			});
		}
	}

	log.info({ providerId: provider.id, totalItems: result.totalItems }, 'Completed provider sync');
	return result;
}

async function syncTypeFromProvider(
	db: Db,
	provider: CompendiumProvider,
	type: CompendiumType,
	onProgress?: SyncProgressCallback
): Promise<number> {
	if (!provider.fetchAllPages) {
		throw new Error(`Provider ${provider.id} does not support bulk fetch`);
	}

	emitProgress(onProgress, {
		phase: 'fetch:start',
		providerId: provider.id,
		providerName: provider.name,
		type,
		timestamp: new Date()
	});

	const rawItems = await provider.fetchAllPages(type);

	emitProgress(onProgress, {
		phase: 'fetch:complete',
		providerId: provider.id,
		providerName: provider.name,
		type,
		current: rawItems.length,
		total: rawItems.length,
		timestamp: new Date()
	});

	log.info({ type, providerId: provider.id, itemCount: rawItems.length }, 'Fetched items');

	const transformedItems: TransformResult[] = [];
	const seenKeys = new Set<string>();

	for (const rawItem of rawItems) {
		try {
			const transformed = provider.transformItem(rawItem, type);

			if (seenKeys.has(transformed.key)) {
				continue;
			}
			seenKeys.add(transformed.key);
			transformedItems.push(transformed);
		} catch (error) {
			log.warn({ type, error: error instanceof Error ? error.message : String(error) }, 'Item transform failed');
		}
	}

	emitProgress(onProgress, {
		phase: 'transform:complete',
		providerId: provider.id,
		providerName: provider.name,
		type,
		current: transformedItems.length,
		total: rawItems.length,
		timestamp: new Date()
	});

	let count = 0;

	for (let i = 0; i < transformedItems.length; i += BATCH_SIZE) {
		const batch = transformedItems.slice(i, i + BATCH_SIZE);

		try {
			await withTransaction(async (tx) => {
				for (const item of batch) {
					await tx
						.insert(compendium)
						.values({
							key: item.key,
							type: item.type,
							name: item.name,
							source: item.source,
							documentKey: item.documentKey ?? null,
							documentName: item.documentName ?? null,
							gamesystemKey: item.gamesystemKey ?? null,
							gamesystemName: item.gamesystemName ?? null,
							publisherKey: item.publisherKey ?? null,
							publisherName: item.publisherName ?? null,
							description: item.description ?? null,
							data: item.data
						})
						.onConflictDoUpdate({
							target: compendium.key,
							set: {
								name: item.name,
								description: item.description ?? null,
								data: item.data,
								documentKey: item.documentKey ?? null,
								documentName: item.documentName ?? null,
								gamesystemKey: item.gamesystemKey ?? null,
								gamesystemName: item.gamesystemName ?? null,
								publisherKey: item.publisherKey ?? null,
								publisherName: item.publisherName ?? null,
								updatedAt: new Date()
							}
						})
						.execute();
				}
			});

			count += batch.length;

			emitProgress(onProgress, {
				phase: 'insert:progress',
				providerId: provider.id,
				providerName: provider.name,
				type,
				current: count,
				total: transformedItems.length,
				timestamp: new Date()
			});
		} catch (error) {
			log.error({ type, error }, 'Batch insert failed');
		}
	}

	log.info({ type, count }, 'Type sync complete');
	return count;
}

export async function checkAllProviders(): Promise<{ healthy: string[]; unhealthy: string[] }> {
	const registry = providerRegistry;
	const enabledProviders = registry.getEnabledProviders();

	const results = await Promise.all(
		enabledProviders.map(async (provider) => ({
			id: provider.id,
			healthy: await provider.healthCheck()
		}))
	);

	return {
		healthy: results.filter((r) => r.healthy).map((r) => r.id),
		unhealthy: results.filter((r) => !r.healthy).map((r) => r.id)
	};
}

export async function syncProviderById(
	db: Db,
	providerId: string,
	options?: SyncOptions
): Promise<ProviderSyncResult> {
	const provider = providerRegistry.getProvider(providerId);
	if (!provider) {
		return {
			providerId,
			counts: {},
			totalItems: 0,
			skipped: 0,
			errors: [`Provider not found: ${providerId}`]
		};
	}

	const types = options?.types ?? ([...provider.supportedTypes] as CompendiumType[]);
	return syncSingleProvider(db, provider, types, options?.onProgress);
}
