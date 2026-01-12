/**
 * Full-Text Search (FTS5) for Compendium
 *
 * SQLite FTS5 provides fast search for patterns like '%fire%'
 * that B-tree indexes can't efficiently handle.
 *
 * This module indexes:
 * - name: Item name (high weight)
 * - summary: Brief description (medium weight)
 * - content: Full searchable text from details JSON (lower weight)
 */

import { getDb } from '$lib/server/db';
import type { Db } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('FtsService');

/**
 * Extract searchable content from details JSON
 * Collects all descriptive text from various item types
 */
export function extractSearchableContent(details: Record<string, unknown>): string {
	const parts: string[] = [];

	// Helper to safely get string arrays
	const addStrings = (arr: unknown) => {
		if (Array.isArray(arr)) {
			for (const item of arr) {
				if (typeof item === 'string') {
					parts.push(item);
				} else if (item && typeof item === 'object') {
					// Handle objects with desc field (like MonsterAction)
					const obj = item as Record<string, unknown>;
					if (obj.desc && typeof obj.desc === 'string') {
						parts.push(obj.desc);
					}
					if (obj.description && typeof obj.description === 'string') {
						parts.push(obj.description);
					}
				}
			}
		}
	};

	// Helper to safely get string fields
	const addString = (value: unknown) => {
		if (typeof value === 'string') {
			parts.push(value);
		}
	};

	// Generic description field (BaseCompendiumItem)
	addString(details.description);
	if (details.description && Array.isArray(details.description)) {
		addStrings(details.description);
	}

	// Monster-specific fields
	if (details.actions) addStrings(details.actions);
	if (details.specialAbilities) addStrings(details.specialAbilities);
	if (details.reactions) addStrings(details.reactions);
	if (details.legendaryActions) addStrings(details.legendaryActions);
	if (details.lairActions) addStrings(details.lairActions);
	if (details.regionalEffects) addStrings(details.regionalEffects);
	if (details.mythicEncounter) addStrings(details.mythicEncounter);

	// Spell-specific fields
	addString(details.higherLevel);
	addString(details.material);
	addString(details.ritual);
	addString(details.concentration);

	// Item-specific fields
	addString(details.properties);
	addString(details.desc);
	addString(details.description);
	if (details.grants) {
		// Item grants like "grants darkvision 60ft"
		addStrings(details.grants);
	}

	// Class/subclass-specific
	addString(details.subclassFlavor);
	addString(details.features);
	if (Array.isArray(details.features)) {
		addStrings(details.features);
	}

	// Race-specific
	addString(details.traits);
	if (Array.isArray(details.traits)) {
		addStrings(details.traits);
	}

	// Background-specific
	addString(details.bond);
	addString(details.flaws);
	addString(details.ideals);
	addString(details.personalityTraits);

	return parts.join(' ');
}

/**
 * Initialize FTS virtual table for compendium search
 * Run this once during app startup or migration
 */
export async function initFts(db?: Db): Promise<void> {
	log.info('Initializing FTS5 virtual table');
	const database = db ?? (await getDb());

	// Drop existing FTS table to recreate with new schema
	// This ensures clean migration when schema changes
	await database.run(sql`DROP TABLE IF EXISTS compendium_items_fts`);

	// Create FTS5 virtual table with content column for full-text search
	// Using content= explicitly (not contentless) since we have searchable content
	await database.run(sql`
		CREATE VIRTUAL TABLE compendium_items_fts USING fts5(
			name,
			summary,
			content,
			tokenize='unicode61'
		)
	`);
	log.info('FTS5 virtual table created');
}

/**
 * Populate FTS with all existing compendium data
 * Should be called after initFts() during setup or migration
 */
export async function populateFtsFromDatabase(db?: Db): Promise<number> {
	log.info('Populating FTS with existing compendium data');
	const database = db ?? (await getDb());

	const items = await database.select().from(compendiumItems);
	let count = 0;

	for (const item of items) {
		const content = item.content
			? extractSearchableContent(item.details as Record<string, unknown>) + ' ' + item.content
			: extractSearchableContent(item.details as Record<string, unknown>);

		await database.run(
			sql`INSERT INTO compendium_items_fts(rowid, name, summary, content) VALUES (${item.id}, ${item.name}, ${item.summary ?? ''}, ${content})`
		);
		count++;
	}

	log.info({ count }, 'FTS populated with existing data');
	return count;
}

/**
 * Sync a single item to FTS index
 */
export async function syncItemToFts(
	id: number,
	name: string,
	summary: string | null,
	details: Record<string, unknown>,
	content: string | null,
	db?: Db
): Promise<void> {
	const database = db ?? (await getDb());

	// Extract searchable content from details if not provided
	const searchableContent = content
		? extractSearchableContent(details) + ' ' + content
		: extractSearchableContent(details);

	await database.run(
		sql`INSERT OR REPLACE INTO compendium_items_fts(rowid, name, summary, content) VALUES (${id}, ${name}, ${summary ?? ''}, ${searchableContent})`
	);
	log.debug({ id, name }, 'Item synced to FTS');
}

/**
 * Remove item from FTS index
 */
export async function removeItemFromFts(id: number, db?: Db): Promise<void> {
	const database = db ?? (await getDb());
	await database.run(sql`DELETE FROM compendium_items_fts WHERE rowid = ${id}`);
	log.debug({ id }, 'Item removed from FTS');
}

/**
 * Search using FTS5 - much faster than LIKE '%query%'
 * @param query Search term (splits on spaces for AND matching)
 * @param limit Max results
 * @returns Array of rowids matching the search
 */
export async function searchFts(query: string, limit: number = 50, db?: Db): Promise<number[]> {
	const database = db ?? (await getDb());

	// FTS5 query syntax: terms separated by space = AND matching
	// Use * prefix for prefix matching
	const ftsQuery = query.trim().split(/\s+/).join(' ') + '*';

	log.debug({ query: ftsQuery, limit }, 'FTS search executed');
	const results = await database.all<{ rowid: number }>(
		sql`SELECT rowid FROM compendium_items_fts WHERE compendium_items_fts MATCH ${ftsQuery} LIMIT ${limit}`
	);

	log.debug({ resultCount: results.length }, 'FTS search completed');
	return results.map((r) => r.rowid);
}

/**
 * Search with ranking - returns results ordered by relevance (BM25)
 */
export async function searchFtsRanked(
	query: string,
	limit: number = 50,
	db?: Db
): Promise<{ rowid: number; rank: number }[]> {
	const database = db ?? (await getDb());

	const ftsQuery = query.trim().split(/\s+/).join(' ') + '*';

	log.debug({ query: ftsQuery, limit }, 'FTS ranked search executed');
	const results = await database.all<{ rowid: number; rank: number }>(
		sql`SELECT rowid, bm25(compendium_items_fts) as rank FROM compendium_items_fts WHERE compendium_items_fts MATCH ${ftsQuery} ORDER BY rank LIMIT ${limit}`
	);

	log.debug({ resultCount: results.length }, 'FTS ranked search completed');
	return results;
}

/**
 * Rebuild the entire FTS index from all compendium items
 * Useful for migration or after adding new searchable content
 */
export async function rebuildFtsIndex(db?: Db): Promise<number> {
	log.info('Rebuilding FTS index');
	const database = db ?? (await getDb());

	// Clear existing index
	await database.run(sql`DELETE FROM compendium_items_fts`);

	// Get all items with their content
	const items = await database.select().from(compendiumItems);
	let count = 0;

	for (const item of items) {
		const searchableContent = item.content
			? extractSearchableContent(item.details as Record<string, unknown>) + ' ' + item.content
			: extractSearchableContent(item.details as Record<string, unknown>);

		await database.run(
			sql`INSERT INTO compendium_items_fts(rowid, name, summary, content) VALUES (${item.id}, ${item.name}, ${item.summary ?? ''}, ${searchableContent})`
		);
		count++;
	}

	log.info({ count }, 'FTS index rebuilt');
	return count;
}

/**
 * Get FTS index statistics
 */
export async function getFtsStats(db?: Db): Promise<{ rowCount: number; tableSize: string }> {
	const database = db ?? (await getDb());

	const rowCountResult = await database.all<{ count: number }>(
		sql`SELECT count(*) as count FROM compendium_items_fts`
	);
	const rowCount = rowCountResult[0]?.count ?? 0;

	// Get approximate size
	const sizeResult = await database.all<{ size: string }>(
		sql`SELECT pg_size_approx(sqlite_fts_data('compendium_items_fts')) as size`
	);
	const tableSize = sizeResult[0]?.size ?? 'unknown';

	return { rowCount, tableSize };
}
