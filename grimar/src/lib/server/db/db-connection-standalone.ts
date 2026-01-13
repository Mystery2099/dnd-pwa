/**
 * Standalone Database Connection
 *
 * Direct SQLite connection for CLI scripts without SvelteKit context.
 */

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

type Db = BunSQLiteDatabase<typeof schema>;

let _db: Db | null = null;

/**
 * Get database connection directly from environment
 * Works without SvelteKit context
 */
export async function getDbDirect(): Promise<Db> {
	if (_db) return _db;

	const { Database } = await import('bun:sqlite');
	const { drizzle } = await import('drizzle-orm/bun-sqlite');

	const url = process.env.DATABASE_URL || 'file:./local.db';
	const client = new Database(url);
	_db = drizzle(client, { schema });

	return _db;
}

/**
 * Get raw SQLite client for raw queries
 */
export async function getRawDbDirect(): Promise<ReturnType<typeof Database>> {
	const { Database } = await import('bun:sqlite');
	const url = process.env.DATABASE_URL || 'file:./local.db';
	return new Database(url);
}

/**
 * Close database connection
 */
export function closeDbDirect(): void {
	_db = null;
}
