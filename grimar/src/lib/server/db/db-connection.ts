/**
 * Database Connection
 *
 * Initializes and returns database connections using Drizzle ORM.
 */

import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { applyPragmas } from './db-config';

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export type Db = BunSQLiteDatabase<typeof schema> | BetterSQLite3Database<typeof schema>;

let _db: Db | null = null;

export async function getDb(): Promise<Db> {
	if (_db) return _db;

	const isBun = typeof (globalThis as unknown as { Bun?: unknown }).Bun !== 'undefined';

	if (isBun) {
		const [{ Database }, { drizzle }] = await Promise.all([
			import('bun:sqlite'),
			import('drizzle-orm/bun-sqlite')
		]);
		const client = new Database(env.DATABASE_URL);
		applyPragmas(client);
		_db = drizzle(client, { schema });
		return _db;
	}

	const [{ default: BetterSqlite3Database }, { drizzle }] = await Promise.all([
		import('better-sqlite3'),
		import('drizzle-orm/better-sqlite3')
	]);
	const client = new BetterSqlite3Database(env.DATABASE_URL);
	applyPragmas(client);
	_db = drizzle(client, { schema });
	return _db;
}
