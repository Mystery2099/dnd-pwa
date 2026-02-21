/**
 * Database Index
 *
 * Re-exports database utilities for convenience.
 */

import type { Db } from './db-connection';
import { getDb } from './db-connection';
export type { Db } from './db-connection';
export { getDb, getRawClient, closeDb, resetDb } from './db-connection';
export { getDbWithRetry, DB_CONFIG } from './db-retry';
export * from './schema';
export * from './db-fts';
export * from './fts-utils';

/**
 * Run a function within a database transaction
 * Automatically commits on success, rolls back on error
 */
export async function withTransaction<T>(fn: (db: Db) => Promise<T>): Promise<T> {
	const db = await getDb();
	return db.transaction(fn);
}
