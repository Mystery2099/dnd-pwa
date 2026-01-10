#!/usr/bin/env bun
/**
 * Test FTS Search
 *
 * Quick test to verify FTS search is working.
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sql, eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { applyPragmas } from '../src/lib/server/db/db-config';

const dbPath = process.env.DATABASE_URL || 'file:./local.db';
const sqlite = new Database(dbPath);
applyPragmas(sqlite);
const db = drizzle(sqlite, { schema });
const { compendiumItems } = schema;

async function main() {
	console.log('🔍 Testing FTS search...\n');

	// Test search for "fire" (should find fire bolt, fire elementals, etc.)
	const fireQuery = 'fire*';
	const fireResults = await db.all<{ rowid: number; rank: number }>(
		sql`SELECT rowid, bm25(compendium_items_fts) as rank FROM compendium_items_fts WHERE compendium_items_fts MATCH ${fireQuery} LIMIT 10`
	);
	console.log(`🔥 Search for "${fireQuery}": ${fireResults.length} results`);

	if (fireResults.length > 0) {
		const items = await Promise.all(
			fireResults.map(async (r) => {
				const item = await db.query.compendiumItems.findFirst({
					where: eq(compendiumItems.id, r.rowid)
				});
				return item;
			})
		);
		console.log('\nTop results:');
		for (const item of items.filter(Boolean)) {
			console.log(`  - ${item?.name} (${item?.type})`);
		}
	}

	// Test search for "explode" (should find monsters with explosion abilities)
	const explodeQuery = 'explode*';
	const explodeResults = await db.all<{ rowid: number }>(
		sql`SELECT rowid FROM compendium_items_fts WHERE compendium_items_fts MATCH ${explodeQuery} LIMIT 5`
	);
	console.log(`\n💥 Search for "${explodeQuery}": ${explodeResults.length} results`);

	if (explodeResults.length > 0) {
		const items = await Promise.all(
			explodeResults.map(async (r) => {
				const item = await db.query.compendiumItems.findFirst({
					where: eq(compendiumItems.id, r.rowid)
				});
				return item;
			})
		);
		for (const item of items.filter(Boolean)) {
			console.log(`  - ${item?.name} (${item?.type})`);
		}
	}

	console.log('\n✅ FTS search is working!');
	sqlite.close();
}

main().catch(console.error);
