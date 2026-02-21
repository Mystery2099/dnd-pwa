/**
 * Full-Text Search (FTS5) for Compendium
 *
 * SQLite FTS5 provides fast search for patterns like '%fire%'
 * that B-tree indexes can't efficiently handle.
 *
 * This module indexes:
 * - key: Unique identifier (stored for lookups)
 * - name: Item name (high weight)
 * - description: Full description text
 */

import { getDb } from '$lib/server/db';
import type { Db } from '$lib/server/db';
import { compendium } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('FtsService');

function parseFtsQuery(query: string): string {
	return query.trim().split(/\s+/).join(' ') + '*';
}

export async function initFts(db?: Db): Promise<void> {
	log.info('Initializing FTS5 virtual table');
	const database = db ?? (await getDb());

	await database.run(sql`DROP TABLE IF EXISTS compendium_fts`);

	await database.run(sql`
		CREATE VIRTUAL TABLE compendium_fts USING fts5(
			key,
			name,
			description,
			tokenize='unicode61'
		)
	`);
	log.info('FTS5 virtual table created');
}

export async function populateFtsFromDatabase(db?: Db): Promise<number> {
	log.info('Populating FTS with existing compendium data');
	const database = db ?? (await getDb());

	const items = await database.select().from(compendium);
	let count = 0;

	for (const item of items) {
		await database.run(
			sql`INSERT INTO compendium_fts(key, name, description) VALUES (${item.key}, ${item.name}, ${item.description ?? ''})`
		);
		count++;
	}

	log.info({ count }, 'FTS populated with existing data');
	return count;
}

export async function syncItemToFts(
	key: string,
	name: string,
	description: string | null,
	db?: Db
): Promise<void> {
	const database = db ?? (await getDb());

	await database.run(
		sql`INSERT OR REPLACE INTO compendium_fts(key, name, description) VALUES (${key}, ${name}, ${description ?? ''})`
	);
	log.debug({ key, name }, 'Item synced to FTS');
}

export async function removeItemFromFts(key: string, db?: Db): Promise<void> {
	const database = db ?? (await getDb());
	await database.run(sql`DELETE FROM compendium_fts WHERE key = ${key}`);
	log.debug({ key }, 'Item removed from FTS');
}

export async function searchFts(query: string, limit: number = 50, db?: Db): Promise<string[]> {
	const database = db ?? (await getDb());
	const ftsQuery = parseFtsQuery(query);

	log.debug({ query: ftsQuery, limit }, 'FTS search executed');
	const results = await database.all<{ key: string }>(
		sql`SELECT key FROM compendium_fts WHERE compendium_fts MATCH ${ftsQuery} LIMIT ${limit}`
	);

	log.debug({ resultCount: results.length }, 'FTS search completed');
	return results.map((r) => r.key);
}

export async function searchFtsRanked(
	query: string,
	limit: number = 50,
	db?: Db
): Promise<{ key: string; rank: number }[]> {
	const database = db ?? (await getDb());
	const ftsQuery = parseFtsQuery(query);

	log.debug({ query: ftsQuery, limit }, 'FTS ranked search executed');
	const results = await database.all<{ key: string; rank: number }>(
		sql`SELECT key, bm25(compendium_fts) as rank FROM compendium_fts WHERE compendium_fts MATCH ${ftsQuery} ORDER BY rank LIMIT ${limit}`
	);

	log.debug({ resultCount: results.length }, 'FTS ranked search completed');
	return results;
}

export async function rebuildFtsIndex(db?: Db): Promise<number> {
	log.info('Rebuilding FTS index');
	const database = db ?? (await getDb());

	await database.run(sql`DELETE FROM compendium_fts`);

	const items = await database.select().from(compendium);
	let count = 0;

	for (const item of items) {
		await database.run(
			sql`INSERT INTO compendium_fts(key, name, description) VALUES (${item.key}, ${item.name}, ${item.description ?? ''})`
		);
		count++;
	}

	log.info({ count }, 'FTS index rebuilt');
	return count;
}

export async function getFtsStats(db?: Db): Promise<{ rowCount: number }> {
	const database = db ?? (await getDb());

	const rowCountResult = await database.all<{ count: number }>(
		sql`SELECT count(*) as count FROM compendium_fts`
	);
	const rowCount = rowCountResult[0]?.count ?? 0;

	return { rowCount };
}
