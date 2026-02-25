/**
 * Database Connection
 *
 * Uses bun:sqlite for SQLite database access.
 *
 * ## Singleton Pattern
 *
 * This module uses a singleton pattern - the database connection is created once
 * and reused across all requests. This is efficient for serverless/SvelteKit deployments.
 *
 * ## Cleanup
 *
 * In development (HMR), you may want to reset the connection:
 * ```ts
 * import { resetDb } from '$lib/server/db';
 * // After schema changes or migrations
 * await resetDb();
 * ```
 *
 * In production, connections are typically managed by the runtime and don't need
 * manual cleanup. The `closeDb()` function is available for graceful shutdowns.
 */

import * as schema from './schema';
import { applyPragmas } from './db-config';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { Database } from 'bun:sqlite';

const DATABASE_URL = process.env.DATABASE_URL ?? 'local.db';

export type Db = BunSQLiteDatabase<typeof schema>;

let _db: Db | null = null;
let _client: Database | null = null;

export async function getDb(): Promise<Db> {
	if (_db) return _db;

	const { Database } = await import('bun:sqlite');
	const { drizzle } = await import('drizzle-orm/bun-sqlite');

	_client = new Database(DATABASE_URL);
	applyPragmas(_client);
	_db = drizzle(_client, { schema });
	return _db;
}

/**
 * Get the raw SQLite client
 */
export function getRawClient(): Database | null {
	return _client;
}

/**
 * Close the database connection
 */
export async function closeDb(): Promise<void> {
	if (_client) {
		_client.close();
		_client = null;
		_db = null;
	}
}

/**
 * Reset database connection (useful for HMR in dev mode)
 */
export async function resetDb(): Promise<Db> {
	await closeDb();
	return getDb();
}
