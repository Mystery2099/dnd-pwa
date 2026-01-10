/**
 * Database Connection
 *
 * Initializes and returns database connections using Drizzle ORM.
 */

import * as schema from './schema';
import { applyPragmas } from './db-config';

import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

// Try to get env, but handle case where $env/dynamic/private isn't available
let env: Record<string, string | undefined> = {};
try {
	const envModule = await import('$env/dynamic/private');
	env = envModule.env as Record<string, string | undefined>;
} catch {
	// Standalone script - env will be undefined, use process.env directly
}

const DATABASE_URL = env.DATABASE_URL ?? process.env.DATABASE_URL ?? 'local.db';

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
		const client = new Database(DATABASE_URL);
		applyPragmas(client);
		_db = drizzle(client, { schema });
		return _db;
	}

	const [{ default: BetterSqlite3Database }, { drizzle }] = await Promise.all([
		import('better-sqlite3'),
		import('drizzle-orm/better-sqlite3')
	]);
	const client = new BetterSqlite3Database(DATABASE_URL);
	applyPragmas(client);
	_db = drizzle(client, { schema });
	return _db;
}
