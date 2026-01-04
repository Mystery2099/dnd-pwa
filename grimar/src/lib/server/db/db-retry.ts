/**
 * Database Connection Retry
 *
 * Exponential backoff retry logic for database connections.
 */

import { getDb } from './db-connection';

/** Retry configuration */
export const DB_CONFIG = {
	maxRetries: 3,
	retryDelayMs: 100
} as const;

/**
 * Get database connection with retry logic
 */
export async function getDbWithRetry(maxRetries = 3): Promise<ReturnType<typeof getDb>> {
	let lastError: Error | null = null;

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await getDb();
		} catch (error) {
			lastError = error as Error;
			console.warn(`Database connection attempt ${i + 1} failed:`, error);
			if (i < maxRetries - 1) {
				// Exponential backoff: 100ms, 200ms, 400ms
				const delay = Math.pow(2, i) * 100;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError || new Error('Failed to connect to database');
}
