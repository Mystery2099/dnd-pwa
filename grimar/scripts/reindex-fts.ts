#!/usr/bin/env bun
/**
 * Reindex FTS CLI
 *
 * Rebuilds the full-text search index from all compendium items.
 * Use this after schema changes or to fix corrupted index.
 *
 * Usage:
 *   bun run reindex-fts    # Rebuild FTS index
 *   bun run reindex-fts --verbose  # Verbose output
 *
 * Options:
 *   --verbose, -v     Verbose output
 *   --help, -h        Show this help message
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sql } from 'drizzle-orm';
import * as schema from '../src/lib/server/db/schema';
import { applyPragmas } from '../src/lib/server/db/db-config';
import { createModuleLogger } from '../src/lib/server/logger';
import { extractSearchableContent } from '../src/lib/server/db/fts-utils';

const log = createModuleLogger('ReindexFts');

// Parse arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const help = args.includes('--help') || args.includes('-h');

if (help) {
	console.log(`
FTS Reindex CLI

Rebuilds the full-text search index from all compendium items.

Usage:
  bun run reindex-fts    # Rebuild FTS index
  bun run reindex-fts --verbose  # Verbose output

Options:
  --verbose, -v     Verbose output
  --help, -h        Show this help message
`);
	process.exit(0);
}

async function main() {
	console.log('🏗️  Rebuilding FTS index...\n');

	// Initialize database connection directly
	const dbPath = process.env.DATABASE_URL || 'file:./local.db';
	if (verbose) console.log(`📂 Database: ${dbPath}`);

	const sqlite = new Database(dbPath);
	applyPragmas(sqlite);
	const db = drizzle(sqlite, { schema });

	try {
		// Drop existing FTS table to recreate with new schema
		if (verbose) console.log('📋 Recreating FTS virtual table...');
		await db.run(sql`DROP TABLE IF EXISTS compendium_items_fts`);

		await db.run(sql`
			CREATE VIRTUAL TABLE compendium_items_fts USING fts5(
				name,
				summary,
				content,
				tokenize='unicode61'
			)
		`);
		console.log('✅ FTS virtual table created');

		// Rebuild index from all items
		if (verbose) console.log('🔨 Rebuilding index from compendium items...');
		const { compendiumItems } = schema;
		const items = await db.select().from(compendiumItems);

		let count = 0;
		const startTime = Date.now();

		for (const item of items) {
			const content = item.content
				? extractSearchableContent(item.details as Record<string, unknown>) + ' ' + item.content
				: extractSearchableContent(item.details as Record<string, unknown>);

			await db.run(
				sql`INSERT INTO compendium_items_fts(rowid, name, summary, content) VALUES (${item.id}, ${item.name}, ${item.summary ?? ''}, ${content})`
			);
			count++;
		}

		const elapsed = Date.now() - startTime;

		console.log(`✅ FTS index rebuilt successfully!`);
		console.log(`   Items indexed: ${count}`);
		console.log(`   Time elapsed: ${elapsed}ms`);

		console.log('\n✨ Search is now ready!');
	} catch (error) {
		console.error('❌ Error rebuilding FTS index:', error);
		process.exit(1);
	} finally {
		sqlite.close();
	}
}

main();
