/**
 * Database Connection Retry
 *
 * Uses unified retry utility with DB-specific defaults.
 */

import { getDb } from './db-connection';
import { withRetry, RETRY_CONFIG } from '$lib/server/utils/retry';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('DbRetry');

/** Database-specific retry configuration (faster for connections) */
export const DB_CONFIG = {
	maxRetries: RETRY_CONFIG.maxRetries,
	retryDelayMs: 100 // Faster for DB connections
} as const;

/**
 * Get database connection with retry logic
 */
export async function getDbWithRetry(maxRetries?: number): Promise<ReturnType<typeof getDb>> {
	return withRetry(
		async () => {
			log.debug('Establishing database connection');
			return await getDb();
		},
		{
			maxRetries: maxRetries ?? DB_CONFIG.maxRetries,
			retryDelayMs: DB_CONFIG.retryDelayMs,
			operationName: 'database-connection'
		}
	);
}
