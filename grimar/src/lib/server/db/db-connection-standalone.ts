/**
 * Standalone Database Connection
 *
 * Direct SQLite connection for CLI scripts without SvelteKit context.
 * Uses bun:sqlite directly instead of Drizzle for simpler CLI usage.
 */

import { Database } from 'bun:sqlite';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/bun-sqlite';

type Db = BunSQLiteDatabase<typeof schema> | BetterSQLite3Database<typeof schema>;

let _db: Db | null = null;

/**
 * Get database connection directly from environment
 * Works without SvelteKit context
 */
export function getDbDirect(): Db {
	if (_db) return _db;

	const url = process.env.DATABASE_URL || 'file:./local.db';
	const client = new Database(url);
	_db = drizzle(client, { schema });

	return _db;
}

/**
 * Get raw SQLite client for raw queries
 */
export function getRawDbDirect(): Database {
	const url = process.env.DATABASE_URL || 'file:./local.db';
	return new Database(url);
}

/**
 * Close database connection
 */
export function closeDbDirect(): void {
	_db = null;
}
