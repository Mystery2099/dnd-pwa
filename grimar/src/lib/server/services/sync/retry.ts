/**
 * Sync Retry Utility
 *
 * Provides exponential backoff retry logic for sync operations.
 */
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SyncRetry');

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

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
	const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
	const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
	const operationName = options.operationName ?? 'operation';

	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt <= maxRetries) {
				// Exponential backoff: 1x, 2x, 4x, etc.
				const delay = retryDelayMs * Math.pow(2, attempt - 1);
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
