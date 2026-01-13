/**
 * Database Connection
 *
 * Uses bun:sqlite for SQLite database access.
 */

import * as schema from './schema';
import { applyPragmas } from './db-config';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';

const DATABASE_URL = process.env.DATABASE_URL ?? 'local.db';

export type Db = BunSQLiteDatabase<typeof schema>;

let _db: Db | null = null;

export async function getDb(): Promise<Db> {
	if (_db) return _db;

	const { Database } = await import('bun:sqlite');
	const { drizzle } = await import('drizzle-orm/bun-sqlite');

	const client = new Database(DATABASE_URL);
	applyPragmas(client);
	_db = drizzle(client, { schema });
	return _db;
}
