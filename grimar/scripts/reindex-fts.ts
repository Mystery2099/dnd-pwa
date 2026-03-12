#!/usr/bin/env bun
/**
 * Reindex FTS CLI
 *
 * Rebuilds the compendium full-text search index from the current unified schema.
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
import * as schema from '../src/lib/server/db/schema';
import { applyPragmas } from '../src/lib/server/db/db-config';
import { getFtsStats, initFts, populateFtsFromDatabase } from '../src/lib/server/db/db-fts';

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
	console.log('Rebuilding compendium FTS index...\n');

	// Initialize database connection directly
	const dbPath = process.env.DATABASE_URL?.trim() || './local.db';
	if (verbose) console.log(`Database: ${dbPath}`);

	const sqlite = new Database(dbPath);
	applyPragmas(sqlite);
	const db = drizzle(sqlite, { schema });

	try {
		const startedAt = Date.now();
		if (verbose) console.log('Recreating compendium_fts virtual table...');
		await initFts(db);
		const indexedCount = await populateFtsFromDatabase(db);
		const stats = await getFtsStats(db);
		const elapsedMs = Date.now() - startedAt;

		console.log('FTS index rebuilt successfully.');
		console.log(`Items indexed: ${indexedCount}`);
		console.log(`FTS rows: ${stats.rowCount}`);
		console.log(`Elapsed: ${elapsedMs}ms`);
	} catch (error) {
		console.error('Error rebuilding FTS index:', error);
		process.exit(1);
	} finally {
		sqlite.close();
	}
}

main();
