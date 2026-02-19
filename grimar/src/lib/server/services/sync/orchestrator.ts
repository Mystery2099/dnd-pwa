/**
 * Sync Orchestrator
 *
 * Orchestrates multi-provider sync operations.
 * Uses retry and metrics modules for reliability and monitoring.
 */

import { providerRegistry, SYNC_CONFIG } from '$lib/server/providers';
import { compendiumItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { syncItemToFts } from '$lib/server/db/db-fts';
import type { Db } from '$lib/server/db';
import { withTransaction } from '$lib/server/db';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import type {
	CompendiumProvider,
	ProviderSyncResult,
	TransformResult
} from '$lib/server/providers/types';
import type { SyncProgressCallback } from './progress';
import { withRetry } from './retry';
import {
	createSyncMetrics,
	recordItemProcessed,
	recordError,
	getSyncSummary
} from './sync-metrics';
import { cleanupDisabledSources } from './sync-cleanup';
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
	/** Progress callback for real-time updates */
	onProgress?: SyncProgressCallback;
}

// Sync configuration from registry (code-driven, not hardcoded)
const MAX_RETRIES = SYNC_CONFIG.retryAttempts;
const RETRY_DELAY_MS = SYNC_CONFIG.retryDelayMs;
// Batch size for transaction processing
const BATCH_SIZE = 100;
// Emit progress every N items during transformation
const TRANSFORM_PROGRESS_INTERVAL = 50;

// Type canonicalization mapping (handles singular/plural variations from different APIs)
const TYPE_CANONICAL: Record<string, CompendiumTypeName> = {
	spell: 'spells',
	spells: 'spells',
	creature: 'creatures',
	creatures: 'creatures',
	item: 'magicitems',
	items: 'magicitems',
	feat: 'feats',
	feats: 'feats',
	background: 'backgrounds',
	backgrounds: 'backgrounds',
	race: 'species',
	races: 'species',
	class: 'classes',
	classes: 'classes',
	condition: 'conditions',
	conditions: 'conditions',
	skill: 'skills',
	skills: 'skills',
	language: 'languages',
	languages: 'languages',
	alignment: 'alignments',
	alignments: 'alignments',
	abilityScore: 'abilities',
	abilityScores: 'abilities',
	damageType: 'damagetypes',
	damageTypes: 'damagetypes',
	magicSchool: 'spellschools',
	magicSchools: 'spellschools',
	equipmentCategory: 'itemcategories',
	equipmentCategories: 'itemcategories',
	weaponProperty: 'weaponproperties',
	weaponProperties: 'weaponproperties',
	creatureType: 'creaturetypes',
	creatureTypes: 'creaturetypes',
	rule: 'rules',
	rules: 'rules',
	ruleSection: 'rulesections',
	ruleSections: 'rulesections',
	weapon: 'weapons',
	weapons: 'weapons',
	armor: 'armor',
	plane: 'environments',
	planes: 'environments',
	// Sub-item types
	classFeature: 'classfeatures',
	classFeatures: 'classfeatures',
	classfeature: 'classfeatures',
	classfeatures: 'classfeatures',
	classFeatureItem: 'classfeatureitems',
	classFeatureItems: 'classfeatureitems',
	creatureAction: 'creatureactions',
	creatureActions: 'creatureactions',
	creatureActionAttack: 'creatureactionattacks',
	creatureActionAttacks: 'creatureactionattacks',
	creatureTrait: 'creaturetraits',
	creatureTraits: 'creaturetraits',
	speciesTrait: 'speciestraits',
	speciesTraits: 'speciestraits',
	backgroundBenefit: 'backgroundbenefits',
	backgroundBenefits: 'backgroundbenefits',
	featBenefit: 'featbenefits',
	featBenefits: 'featbenefits',
	spellCastingOption: 'spellcastingoptions',
	spellCastingOptions: 'spellcastingoptions',
	weaponPropertyAssignment: 'weaponpropertyassignments',
	weaponPropertyAssignments: 'weaponpropertyassignments'
};

function normalizeType(type: string): CompendiumTypeName | null {
	return TYPE_CANONICAL[type.toLowerCase()] || null;
}

/**
 * Emit a progress event safely (wraps errors to prevent sync failure)
 */
function emitProgress(
	onProgress: SyncProgressCallback | undefined,
	event: Parameters<SyncProgressCallback>[0]
): void {
	try {
		onProgress?.(event);
	} catch (error) {
		log.warn({ error }, 'Progress callback error');
	}
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
		log.debug(
			{ providerId: provider.id, types: provider.supportedTypes },
			'Provider supported types'
		);
		for (const t of provider.supportedTypes) {
			const normalized = normalizeType(t);
			if (normalized) allProviderTypes.add(normalized);
		}
	}

	log.info(
		{
			enabledProviders: enabledProviders.length,
			totalTypes: allProviderTypes.size,
			types: Array.from(allProviderTypes)
		},
		'Types to sync'
	);

	// Use only types that at least one provider supports
	const typesToSync = options?.types?.length
		? options.types.filter((t) => allProviderTypes.has(t))
		: Array.from(allProviderTypes);

	const providerIds = options?.providerIds;
	const maxRetries = options?.maxRetries ?? MAX_RETRIES;
	const retryDelayMs = options?.retryDelayMs ?? RETRY_DELAY_MS;
	const onProgress = options?.onProgress;

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

		// Emit provider:start
		emitProgress(onProgress, {
			phase: 'provider:start',
			providerId: provider.id,
			providerName: provider.name,
			timestamp: new Date()
		});

		// Use retry logic for provider sync
		const providerResult = await withRetry(
			async () => syncSingleProvider(db, provider.id, typesToSync, metrics, onProgress),
			{ maxRetries, retryDelayMs, operationName: provider.name }
		);

		// Emit provider:complete
		emitProgress(onProgress, {
			phase: 'provider:complete',
			providerId: provider.id,
			providerName: provider.name,
			total: providerResult.totalItems,
			timestamp: new Date()
		});

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
	metrics: ReturnType<typeof createSyncMetrics>,
	onProgress?: SyncProgressCallback
): Promise<ProviderSyncResult> {
	const registry = providerRegistry;
	const provider = registry.getProvider(providerId);

	if (!provider) {
		return {
			providerId,
			spells: 0,
			creatures: 0,
			items: 0,
			feats: 0,
			backgrounds: 0,
			races: 0,
			classes: 0,
			subclasses: 0,
			subraces: 0,
			traits: 0,
			conditions: 0,
			features: 0,
			skills: 0,
			languages: 0,
			alignments: 0,
			proficiencies: 0,
			abilityScores: 0,
			damageTypes: 0,
			magicSchools: 0,
			equipment: 0,
			weaponProperties: 0,
			equipmentCategories: 0,
			vehicles: 0,
			creatureTypes: 0,
			rules: 0,
			ruleSections: 0,
			weapons: 0,
			armor: 0,
			planes: 0,
			sections: 0,
			classfeatures: 0,
			classfeatureitems: 0,
			creatureactions: 0,
			creatureactionattacks: 0,
			creaturetraits: 0,
			speciestraits: 0,
			backgroundbenefits: 0,
			featbenefits: 0,
			spellcastingoptions: 0,
			weaponpropertyassignments: 0,
			totalItems: 0,
			skipped: 0,
			errors: [`Provider not found: ${providerId}`]
		};
	}

	const result: ProviderSyncResult = {
		providerId,
		spells: 0,
		creatures: 0,
		items: 0,
		feats: 0,
		backgrounds: 0,
		races: 0,
		classes: 0,
		subclasses: 0,
		subraces: 0,
		traits: 0,
		conditions: 0,
		features: 0,
		skills: 0,
		languages: 0,
		alignments: 0,
		proficiencies: 0,
		abilityScores: 0,
		damageTypes: 0,
		magicSchools: 0,
		equipment: 0,
		weaponProperties: 0,
		equipmentCategories: 0,
		vehicles: 0,
		creatureTypes: 0,
		rules: 0,
		ruleSections: 0,
		weapons: 0,
		armor: 0,
		planes: 0,
		sections: 0,
		classfeatures: 0,
		classfeatureitems: 0,
		creatureactions: 0,
		creatureactionattacks: 0,
		creaturetraits: 0,
		speciestraits: 0,
		backgroundbenefits: 0,
		featbenefits: 0,
		spellcastingoptions: 0,
		weaponpropertyassignments: 0,
		totalItems: 0,
		skipped: 0,
		errors: []
	};

	log.info({ providerName: provider.name, typesToSync: types.length }, 'Syncing provider');

	for (const type of types) {
		// Check if provider supports this type
		if (!provider.supportedTypes.includes(type)) {
			log.debug({ providerId: provider.id, type }, 'Provider does not support type');
			continue;
		}

		try {
			// Use retry logic for type sync
			const itemCount = await withRetry(
				async () => syncTypeFromProvider(db, provider.id, type, provider, metrics, onProgress),
				{
					maxRetries: MAX_RETRIES,
					retryDelayMs: RETRY_DELAY_MS,
					operationName: `${provider.name}/${type}`
				}
			);
			result.totalItems += itemCount;

			switch (type) {
				case 'spells':
					result.spells = itemCount;
					break;
				case 'creatures':
					result.creatures = itemCount;
					break;
				case 'magicitems':
					result.items = itemCount;
					break;
				case 'feats':
					result.feats = itemCount;
					break;
				case 'backgrounds':
					result.backgrounds = itemCount;
					break;
				case 'species':
					result.races = itemCount;
					break;
				case 'classes':
					result.classes = itemCount;
					break;
				case 'conditions':
					result.conditions = itemCount;
					break;
				case 'skills':
					result.skills = itemCount;
					break;
				case 'languages':
					result.languages = itemCount;
					break;
				case 'alignments':
					result.alignments = itemCount;
					break;
				case 'abilities':
					result.abilityScores = itemCount;
					break;
				case 'damagetypes':
					result.damageTypes = itemCount;
					break;
				case 'spellschools':
					result.magicSchools = itemCount;
					break;
				case 'itemcategories':
					result.equipmentCategories = itemCount;
					break;
				case 'weaponproperties':
					result.weaponProperties = itemCount;
					break;
				case 'creaturetypes':
					result.creatureTypes = itemCount;
					break;
				case 'rules':
					result.rules = itemCount;
					break;
				case 'rulesections':
					result.ruleSections = itemCount;
					break;
				case 'weapons':
					result.weapons = itemCount;
					break;
				case 'armor':
					result.armor = itemCount;
					break;
				case 'environments':
					result.planes = itemCount;
					break;
				case 'classfeatures':
					result.classfeatures = itemCount;
					break;
				case 'classfeatureitems':
					result.classfeatureitems = itemCount;
					break;
				case 'creatureactions':
					result.creatureactions = itemCount;
					break;
				case 'creatureactionattacks':
					result.creatureactionattacks = itemCount;
					break;
				case 'creaturetraits':
					result.creaturetraits = itemCount;
					break;
				case 'speciestraits':
					result.speciestraits = itemCount;
					break;
				case 'backgroundbenefits':
					result.backgroundbenefits = itemCount;
					break;
				case 'featbenefits':
					result.featbenefits = itemCount;
					break;
				case 'spellcastingoptions':
					result.spellcastingoptions = itemCount;
					break;
				case 'weaponpropertyassignments':
					result.weaponpropertyassignments = itemCount;
					break;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			result.errors.push(`Failed to sync ${type}: ${errorMessage}`);
			recordError(metrics, provider.id, errorMessage);
			log.error({ providerId: provider.id, type, error }, 'Error syncing type');

			// Emit error event
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
	metrics: ReturnType<typeof createSyncMetrics>,
	onProgress?: SyncProgressCallback
): Promise<number> {
	// Fetch all items from provider
	if (!provider.fetchAllPages) {
		throw new Error(`Provider ${provider.id} does not support bulk fetch`);
	}

	// Emit fetch:start
	emitProgress(onProgress, {
		phase: 'fetch:start',
		providerId,
		providerName: provider.name,
		type,
		timestamp: new Date()
	});

	// Fetch with retry logic
	const rawItems = await withRetry(async () => provider.fetchAllPages!(type), {
		maxRetries: MAX_RETRIES,
		retryDelayMs: RETRY_DELAY_MS,
		operationName: `${provider.id}/${type}/fetch`
	});

	// Emit fetch:complete
	emitProgress(onProgress, {
		phase: 'fetch:complete',
		providerId,
		providerName: provider.name,
		type,
		current: rawItems.length,
		total: rawItems.length,
		timestamp: new Date()
	});

	log.info({ type, providerId, itemCount: rawItems.length }, 'Starting sync');

	let count = 0;

	// Emit transform:start
	emitProgress(onProgress, {
		phase: 'transform:start',
		providerId,
		providerName: provider.name,
		type,
		current: 0,
		total: rawItems.length,
		timestamp: new Date()
	});

	// Transform all items first (outside transaction)
	const transformedItems: Array<{ raw: unknown; transformed: TransformResult }> = [];
	const seenExternalIds = new Map<string, number>(); // externalId -> index (to keep first occurrence)

	for (let index = 0; index < rawItems.length; index++) {
		const rawItem = rawItems[index];

		try {
			const transformed = await provider.transformItem(rawItem, type);

			// Deduplicate: keep only the first occurrence of each (type, source, externalId)
			const key = `${type}:${providerId}:${transformed.externalId}`;
			if (seenExternalIds.has(key)) {
				log.debug({ type, externalId: transformed.externalId, index }, 'Duplicate item skipped');
				continue;
			}
			seenExternalIds.set(key, index);

			log.debug(
				{ type, externalId: transformed.externalId, name: transformed.name },
				'Item transformed'
			);
			transformedItems.push({ raw: rawItem, transformed });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			log.warn({ type, index, error: errorMessage }, 'Item transform failed');
		}

		// Emit transform:progress every N items
		if (index > 0 && index % TRANSFORM_PROGRESS_INTERVAL === 0) {
			emitProgress(onProgress, {
				phase: 'transform:progress',
				providerId,
				providerName: provider.name,
				type,
				current: index,
				total: rawItems.length,
				timestamp: new Date()
			});
		}
	}

	// Emit transform:complete
	emitProgress(onProgress, {
		phase: 'transform:complete',
		providerId,
		providerName: provider.name,
		type,
		current: transformedItems.length,
		total: rawItems.length,
		timestamp: new Date()
	});

	if (seenExternalIds.size < rawItems.length) {
		log.info(
			{ duplicatesRemoved: rawItems.length - seenExternalIds.size },
			'Deduplication completed'
		);
	}

	// Process in batches
	// Note: Disk file writes removed - data now stored in json_data column

	// Emit insert:start
	emitProgress(onProgress, {
		phase: 'insert:start',
		providerId,
		providerName: provider.name,
		type,
		current: 0,
		total: transformedItems.length,
		timestamp: new Date()
	});

	for (let batchIndex = 0; batchIndex < transformedItems.length; batchIndex += BATCH_SIZE) {
		const batch = transformedItems.slice(batchIndex, batchIndex + BATCH_SIZE);

		try {
			// Process each batch within a transaction for atomicity
			await withTransaction(async (tx) => {
				// Process each item in the batch
				for (const { transformed } of batch) {
					// Store processed item with json_data column (Hybrid SQLite)
					await tx
						.insert(compendiumItems)
						.values({
							source: providerId,
							type,
							externalId: transformed.externalId,
							name: transformed.name,
							summary: transformed.summary,
							details: transformed.details,
							jsonData: transformed.jsonData,
							edition: transformed.edition,
							sourceBook: transformed.sourceBook,
							sourcePublisher: transformed.sourcePublisher
						})
						.onConflictDoUpdate({
							target: [compendiumItems.type, compendiumItems.source, compendiumItems.externalId],
							set: {
								name: transformed.name,
								summary: transformed.summary,
								details: transformed.details,
								jsonData: transformed.jsonData,
								edition: transformed.edition,
								sourceBook: transformed.sourceBook,
								sourcePublisher: transformed.sourcePublisher
							}
						})
						.execute();

					// Sync to FTS after successful DB insert
					const payload = transformed.jsonData
						? JSON.parse(transformed.jsonData)
						: transformed.details;
					await syncItemToFts(
						0, // ID will be looked up from DB
						transformed.name,
						transformed.summary,
						payload,
						null, // content
						tx
					);
				}
			});

			count += batch.length;
			recordItemProcessed(metrics, { batchSize: batch.length });

			// Emit insert:progress every batch
			emitProgress(onProgress, {
				phase: 'insert:progress',
				providerId,
				providerName: provider.name,
				type,
				current: count,
				total: transformedItems.length,
				timestamp: new Date()
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorDetails =
				error instanceof Error
					? {
							message: error.message,
							stack: error.stack,
							cause: error.cause
						}
					: { details: error };

			log.error(
				{ type, error: errorDetails, batchIndex, batchSize: batch.length },
				`Batch insert failed: ${errorMessage}`
			);
			recordError(metrics, providerId, errorMessage);

			// Continue with next batch instead of failing entire type sync
			// This allows partial success even if some batches fail
			continue;
		}
	}

	// Emit insert:complete
	emitProgress(onProgress, {
		phase: 'insert:complete',
		providerId,
		providerName: provider.name,
		type,
		current: count,
		total: transformedItems.length,
		timestamp: new Date()
	});

	log.info({ type, count, total: rawItems.length }, 'Sync ended');
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
		'spells',
		'creatures',
		'magicitems',
		'feats',
		'backgrounds',
		'species',
		'classes',
		'conditions',
		'skills',
		'languages',
		'alignments',
		'abilities',
		'damagetypes',
		'spellschools',
		'itemcategories',
		'weaponproperties',
		'creaturetypes',
		'rules',
		'rulesections',
		'weapons',
		'armor',
		'environments'
	];
	const metrics = createSyncMetrics();

	return syncSingleProvider(db, providerId, types, metrics, options?.onProgress);
}
