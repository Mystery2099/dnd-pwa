/**
 * Compendium Sync CLI
 * Syncs data from Open5e API to local database using the shared provider path.
 *
 * Usage:
 *   bun run db:sync                          # Sync all types
 *   bun run db:sync --types spells          # Sync only spells
 *   bun run db:sync --types spells -t creatures  # Sync multiple types
 */

import { OPEN5E_SYNCABLE_TYPES } from '$lib/server/providers/open5e-config';
import { syncOpen5eTypes } from '$lib/server/providers/open5e';
import { getDb } from '$lib/server/db';
import type { CompendiumType } from '$lib/server/db/schema';
import type { SyncProgressEvent } from '$lib/server/providers/types';

interface CliOptions {
	types: string[];
	help: boolean;
}

function parseArgs(): CliOptions {
	const args = process.argv.slice(2);
	const options: CliOptions = {
		types: [],
		help: false
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === '--types' || arg === '-t') {
			const value = args[++i];
			if (value && !value.startsWith('-')) {
				options.types.push(value);
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
  --help, -h            Show this help message

Available types:
  ${OPEN5E_SYNCABLE_TYPES.join(', ')}

Examples:
  bun run db:sync                           # Sync all types
  bun run db:sync --types spells            # Sync only spells
  bun run db:sync --types spells -t creatures  # Sync spells and creatures
`);
}

function logProgress(event: SyncProgressEvent): void {
	if (event.type === 'all' && event.message) {
		console.log(`[open5e] ${event.message}`);
		return;
	}

	if (event.status === 'fetching' && event.totalItems) {
		console.log(`[${event.type}] Fetching ${event.itemsProcessed}/${event.totalItems} items...`);
		return;
	}

	if (event.status === 'complete' && event.totalItems) {
		console.log(`[${event.type}] ✓ Saved ${event.totalItems} items`);
		return;
	}

	if (event.status === 'error') {
		console.error(`[${event.type}] ✗ ${event.error ?? 'Unknown error'}`);
	}
}

async function main(): Promise<void> {
	const options = parseArgs();

	if (options.help) {
		printHelp();
		process.exit(0);
	}

	// Validate types if specified
	if (options.types.length > 0) {
		const invalidTypes = options.types.filter((t) => !OPEN5E_SYNCABLE_TYPES.includes(t as CompendiumType));
		if (invalidTypes.length > 0) {
			console.error(`Invalid types: ${invalidTypes.join(', ')}`);
			console.error(`Available types: ${OPEN5E_SYNCABLE_TYPES.join(', ')}`);
			process.exit(1);
		}
	}

	const typesToSync =
		options.types.length > 0
			? (options.types as CompendiumType[])
			: [...OPEN5E_SYNCABLE_TYPES];

	console.log('Starting compendium sync...');
	console.log(`Types to sync: ${typesToSync.join(', ')}`);
	console.log('');

	// Initialize database connection
	await getDb();

	const result = await syncOpen5eTypes(typesToSync, logProgress);

	console.log('\n' + '='.repeat(50));
	console.log('Sync Complete');
	console.log('='.repeat(50));
	console.log(`Total items synced: ${result.itemsSynced}`);
	console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
	if (result.errors.length > 0) {
		console.log(`Errors: ${result.errors.length}`);
		for (const error of result.errors) {
			console.log(`- ${error}`);
		}
		process.exit(1);
	}
	console.log('');
}

main().catch((error) => {
	console.error('Sync failed:', error);
	process.exit(1);
});
