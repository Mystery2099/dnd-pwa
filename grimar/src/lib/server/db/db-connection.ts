/**
 * Database Connection
 *
 * Uses bun:sqlite for SQLite database access.
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
