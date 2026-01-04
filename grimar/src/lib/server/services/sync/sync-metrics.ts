/**
 * Sync Metrics Interface
 *
 * Tracks sync operation metrics for monitoring and reporting.
 */

/**
 * Metrics collected during a sync operation
 */
export interface SyncMetrics {
	/** Timestamp when sync started */
	startTime: number;
	/** Total items processed */
	itemsProcessed: number;
	/** Approximate bytes processed */
	bytesProcessed: number;
	/** Map of provider ID to errors encountered */
	providerErrors: Map<string, string[]>;
}

/**
 * Create a new sync metrics instance
 */
export function createSyncMetrics(): SyncMetrics {
	return {
		startTime: Date.now(),
		itemsProcessed: 0,
		bytesProcessed: 0,
		providerErrors: new Map()
	};
}

/**
 * Record an item as processed
 */
export function recordItemProcessed(metrics: SyncMetrics, itemDetails?: unknown): void {
	metrics.itemsProcessed++;
	if (itemDetails) {
		metrics.bytesProcessed += JSON.stringify(itemDetails).length;
	}
}

/**
 * Record an error for a provider
 */
export function recordError(metrics: SyncMetrics, providerId: string, error: string): void {
	const errors = metrics.providerErrors.get(providerId) || [];
	errors.push(error);
	metrics.providerErrors.set(providerId, errors);
}

/**
 * Get a summary of the sync metrics
 */
export function getSyncSummary(metrics: SyncMetrics): {
	duration: number;
	totalItems: number;
	totalBytes: number;
	providersWithErrors: number;
	totalErrors: number;
} {
	const duration = Date.now() - metrics.startTime;
	const providersWithErrors = metrics.providerErrors.size;
	let totalErrors = 0;
	for (const errors of metrics.providerErrors.values()) {
		totalErrors += errors.length;
	}

	return {
		duration,
		totalItems: metrics.itemsProcessed,
		totalBytes: metrics.bytesProcessed,
		providersWithErrors,
		totalErrors
	};
}
