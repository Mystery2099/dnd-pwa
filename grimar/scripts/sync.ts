/**
 * Compendium Sync CLI
 * Syncs data from Open5e API to local database
 *
 * Usage:
 *   bun run db:sync                    # Sync all types
 *   bun run db:sync --types spells     # Sync only spells
 *   bun run db:sync --types spells --types creatures  # Sync multiple types
 *   bun run db:sync --limit 100        # Limit items per type (for testing)
 */

import {
	syncType,
	SYNCABLE_TYPES,
	type CompendiumType
} from '$lib/server/services/sync/open5e-sync';
import { getDb } from '$lib/server/db';

interface SyncProgress {
	fetched: number;
	total: number;
}

interface CliOptions {
	types: string[];
	limit?: number;
	help: boolean;
}

function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: CliOptions = {
		types: [],
		limit: undefined,
		help: false
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === '--types' || arg === '-t') {
			const value = args[++i];
			if (value && !value.startsWith('-')) {
				options.types.push(value);
			}
		} else if (arg === '--limit' || arg === '-l') {
			const value = args[++i];
			if (value) {
				options.limit = parseInt(value, 10);
			}
		} else if (arg === '--help' || arg === '-h') {
			options.help = true;
		}
	}

	return options;
}

function printHelp(): void {
	console.log(`
Compendium Sync CLI

Usage:
  bun run db:sync [options]

Options:
  --types, -t <type>    Compendium type(s) to sync (can be specified multiple times)
  --limit, -l <number>  Limit number of items per type (for testing)
  --help, -h            Show this help message

Available types:
  ${SYNCABLE_TYPES.join(', ')}

Examples:
  bun run db:sync                       # Sync all types
  bun run db:sync --types spells        # Sync only spells
  bun run db:sync --types spells -t creatures  # Sync spells and creatures
  bun run db:sync --limit 100           # Sync first 100 items per type (testing)
`);
}

async function main(): Promise<void> {
	const options = parseArgs();

	if (options.help) {
		printHelp();
		process.exit(0);
	}

	// Validate types if specified
	if (options.types.length > 0) {
		const invalidTypes = options.types.filter((t) => !SYNCABLE_TYPES.includes(t));
		if (invalidTypes.length > 0) {
			console.error(`Invalid types: ${invalidTypes.join(', ')}`);
			console.error(`Available types: ${SYNCABLE_TYPES.join(', ')}`);
			process.exit(1);
		}
	}

	const typesToSync = options.types.length > 0 ? options.types : SYNCABLE_TYPES;

	console.log('Starting compendium sync...');
	console.log(`Types to sync: ${typesToSync.join(', ')}`);
	if (options.limit) {
		console.log(`Limit per type: ${options.limit}`);
	}
	console.log('');

	// Initialize database connection
	await getDb();

	let totalItems = 0;
	let totalErrors = 0;
	const startTime = Date.now();

	for (const type of typesToSync) {
		console.log(`\n[${type}] Starting sync...`);

		let lastProgress = 0;

		const progressCallback = (fetched: number, total: number) => {
			if (total !== lastProgress && total > 0) {
				console.log(`[${type}] Fetching ${fetched}/${total} items...`);
				lastProgress = total;
			}
		};

		try {
			const result = await syncType(type, progressCallback);

			if (result.synced > 0) {
				console.log(
					`[${type}] ✓ Synced ${result.synced}/${result.total} items in ${result.duration}ms`
				);
				totalItems += result.synced;
			} else {
				console.log(`[${type}] No items to sync`);
			}

			if (result.errors > 0) {
				console.error(`[${type}] ✗ ${result.errors} errors occurred`);
				totalErrors++;
			}
		} catch (error) {
			console.error(`[${type}] ✗ Unexpected error:`, error);
			totalErrors++;
		}
	}

	const duration = Date.now() - startTime;

	console.log('\n' + '='.repeat(50));
	console.log('Sync Complete');
	console.log('='.repeat(50));
	console.log(`Total items synced: ${totalItems}`);
	console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
	if (totalErrors > 0) {
		console.log(`Errors: ${totalErrors} type(s) failed`);
	}
	console.log('');
}

main().catch((error) => {
	console.error('Sync failed:', error);
	process.exit(1);
});
