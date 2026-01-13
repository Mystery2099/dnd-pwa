/**
 * Unified Retry Utility
 *
 * Exponential backoff retry logic for sync and database operations.
 */

import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('Retry');

/** Default retry configuration */
export const RETRY_CONFIG = {
	maxRetries: 3,
	retryDelayMs: 1000
} as const;

interface RetryOptions {
	/** Number of retry attempts for failed operations */
	maxRetries?: number;
	/** Delay between retries in ms (exponential backoff applied) */
	retryDelayMs?: number;
	/** Operation name for logging */
	operationName?: string;
	/** Callback on each retry */
	onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Execute an operation with exponential backoff retry
 */
export async function withRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const maxRetries = options.maxRetries ?? RETRY_CONFIG.maxRetries;
	const retryDelayMs = options.retryDelayMs ?? RETRY_CONFIG.retryDelayMs;
	const operationName = options.operationName ?? 'operation';

	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt <= maxRetries) {
				// Exponential backoff: 1x, 2x, 4x, etc. (using bit shift for powers of 2)
				const delay = retryDelayMs * (1 << (attempt - 1));
				log.warn(
					{ operationName, attempt, maxRetries: maxRetries + 1, delay, error: lastError.message },
					'Operation failed, retrying'
				);

				if (options.onRetry) {
					options.onRetry(lastError, attempt);
				}

				await sleep(delay);
			}
		}
	}

	throw lastError!;
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
