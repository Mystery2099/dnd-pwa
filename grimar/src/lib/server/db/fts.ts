/**
 * Full-Text Search (FTS5) for Compendium
 *
 * SQLite FTS5 provides fast search for patterns like '%fire%'
 * that B-tree indexes can't efficiently handle.
 */

import { getDb } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { compendiumItems } from '$lib/server/db/schema';

/**
 * Initialize FTS virtual table for compendium search
 * Run this once during app startup or migration
 */
export async function initFts(): Promise<void> {
	const db = await getDb();

	// Create FTS5 virtual table for fast name/summary search
	// Using contentless FTS since we query by rowid
	await db.run(sql`
		CREATE VIRTUAL TABLE IF NOT EXISTS compendium_items_fts USING fts5(
			name,
			summary,
			content='',
			contentless_rowid='yes'
		)
	`);

	// Populate FTS with existing data
	await db.run(sql`
		INSERT INTO compendium_items_fts(rowid, name, summary)
		SELECT id, name, COALESCE(summary, '') FROM compendiumItems
		WHERE NOT EXISTS (SELECT 1 FROM compendium_items_fts WHERE rowid = compendiumItems.id)
	`);

	console.info('[FTS] Initialized successfully');
}

/**
 * Sync a single item to FTS index
 */
export async function syncItemToFts(
	id: number,
	name: string,
	summary: string | null
): Promise<void> {
	const db = await getDb();

	await db.run(
		sql`INSERT OR REPLACE INTO compendium_items_fts(rowid, name, summary) VALUES (${id}, ${name}, ${summary ?? ''})`
	);
}

/**
 * Remove item from FTS index
 */
export async function removeItemFromFts(id: number): Promise<void> {
	const db = await getDb();
	await db.run(sql`DELETE FROM compendium_items_fts WHERE rowid = ${id}`);
}

/**
 * Search using FTS5 - much faster than LIKE '%query%'
 * @param query Search term (splits on spaces for AND matching)
 * @param limit Max results
 * @returns Array of rowids matching the search
 */
export async function searchFts(
	query: string,
	limit: number = 50
): Promise<number[]> {
	const db = await getDb();

	// FTS5 query syntax: terms separated by space = AND matching
	// Use * prefix for prefix matching, quoted phrases for exact phrases
	const ftsQuery = query.trim().split(/\s+/).join(' ') + '*';

	const results = await db.all<{ rowid: number }>(
		sql`SELECT rowid FROM compendium_items_fts WHERE compendium_items_fts MATCH ${ftsQuery} LIMIT ${limit}`
	);

	return results.map((r) => r.rowid);
}

/**
 * Search with ranking - returns results ordered by relevance
 */
export async function searchFtsRanked(
	query: string,
	limit: number = 50
): Promise<{ rowid: number; rank: number }[]> {
	const db = await getDb();

	const ftsQuery = query.trim().split(/\s+/).join(' ') + '*';

	const results = await db.all<{ rowid: number; rank: number }>(
		sql`SELECT rowid, bm25(compendium_items_fts) as rank FROM compendium_items_fts WHERE compendium_items_fts MATCH ${ftsQuery} ORDER BY rank LIMIT ${limit}`
	);

	return results;
}
