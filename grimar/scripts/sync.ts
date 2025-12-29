#!/usr/bin/env bun
/**
 * Compendium Sync CLI
 *
 * Syncs D&D 5e compendium data from all enabled providers.
 *
 * Usage:
 *   bun run db:sync                 # Sync all providers (default)
 *   bun run db:sync --type spell    # Sync only spells
 *   bun run db:sync --provider open5e  # Sync only a specific provider
 *   bun run db:sync --full          # Force full re-sync
 *
 * Options:
 *   --type <type>     Compendium type: spell, monster, item, feat, background, race, class
 *   --provider <id>   Provider ID to sync (e.g., open5e, 5e-bits, srd, homebrew)
 *   --full            Force full re-sync (vs incremental)
 *   --help, -h        Show this help message
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../src/lib/server/db/schema';
import { syncAllProviders } from '../src/lib/server/services/sync/orchestrator';
import { providerRegistry } from '../src/lib/server/providers';
import type { ProviderSyncResult } from '../src/lib/server/providers/types';
import type { CompendiumTypeName } from '../src/lib/types/compendium';
import { applyPragmas } from '../src/lib/server/db/db-config';

// Valid compendium types
const VALID_TYPES: CompendiumTypeName[] = [
	'spell',
	'monster',
	'item',
	'feat',
	'background',
	'race',
	'class'
];

// Colors for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
	magenta: '\x1b[35m'
};

function log(msg: string, color: keyof typeof colors = 'reset') {
	console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSection(msg: string) {
	log(`\n${msg}`, 'bright');
	log('─'.repeat(50), 'dim');
}

function showHelp() {
	const help = `
${colors.bright}Compendium Sync CLI${colors.reset}
${colors.dim}Sync D&D 5e data from providers into local database${colors.reset}

${colors.bright}Usage:${colors.reset}
  bun run db:sync [options]

${colors.bright}Options:${colors.reset}
  --type <type>       Compendium type to sync
                      Values: spell, monster, item, feat, background, race, class
  --provider <id>     Sync only a specific provider
                      Values: open5e, 5e-bits, srd, homebrew
  --full              Force full re-sync (ignore incremental)
  --help, -h          Show this help message

${colors.bright}Examples:${colors.reset}
  bun run db:sync                 # Sync everything
  bun run db:sync --type spell    # Sync spells only
  bun run db:sync --provider srd  # Sync SRD content only
  bun run db:sync --full          # Force full re-sync
`;
	console.log(help);
}

interface Args {
	type?: string;
	provider?: string;
	full?: boolean;
	help?: boolean;
}

function parseArgs(): Args {
	const args: Args = {};
	const argv = Bun.argv.slice(2);

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]!;

		if (arg === '--help' || arg === '-h') {
			args.help = true;
			break;
		}

		if (arg === '--full') {
			args.full = true;
			continue;
		}

		if (arg === '--type' && i + 1 < argv.length) {
			args.type = argv[++i];
			continue;
		}

		if (arg === '--provider' && i + 1 < argv.length) {
			args.provider = argv[++i];
			continue;
		}

		log(`Unknown option: ${arg}`, 'yellow');
	}

	return args;
}

function formatNumber(n: number): string {
	return n.toLocaleString();
}

function summarizeResult(result: ProviderSyncResult): string {
	const lines: string[] = [];

	if (result.spells) lines.push(`${formatNumber(result.spells)} spells`);
	if (result.monsters) lines.push(`${formatNumber(result.monsters)} monsters`);
	if (result.items) lines.push(`${formatNumber(result.items)} items`);
	if (result.feats) lines.push(`${formatNumber(result.feats)} feats`);
	if (result.backgrounds) lines.push(`${formatNumber(result.backgrounds)} backgrounds`);
	if (result.races) lines.push(`${formatNumber(result.races)} races`);
	if (result.classes) lines.push(`${formatNumber(result.classes)} classes`);

	return lines.length > 0 ? lines.join(', ') : 'No items synced';
}

async function main() {
	const args = parseArgs();

	if (args.help) {
		showHelp();
		return 0;
	}

	logSection(`${colors.cyan}Compendium Sync${colors.reset}`);

	// Check DATABASE_URL
	const databaseUrl = process.env.DATABASE_URL || 'local.db';
	log(`Database: ${databaseUrl}`, 'dim');

	// Validate type if provided
	let types: CompendiumTypeName[] | undefined;
	if (args.type) {
		const normalizedType = args.type.toLowerCase() as CompendiumTypeName;
		if (!VALID_TYPES.includes(normalizedType)) {
			log(`Invalid type: ${args.type}`, 'red');
			log(`Valid types: ${VALID_TYPES.join(', ')}`, 'yellow');
			return 1;
		}
		types = [normalizedType];
		log(`Type filter: ${args.type}`, 'dim');
	}

	// Validate provider if provided
	const providerIds = args.provider ? [args.provider] : undefined;
	if (args.provider) {
		const registry = providerRegistry;
		const provider = registry.getProvider(args.provider);
		if (!provider) {
			log(`Unknown provider: ${args.provider}`, 'red');
			log(
				`Available providers: ${registry
					.getEnabledProviders()
					.map((p) => p.id)
					.join(', ')}`,
				'yellow'
			);
			return 1;
		}
		log(`Provider filter: ${provider.name}`, 'dim');
	}

	// Initialize database
	log('Connecting to database...', 'dim');

	let db;
	try {
		const client = new Database(databaseUrl);
		applyPragmas(client);
		db = drizzle(client, { schema });
		log('Database connection established', 'green');
	} catch (error) {
		log(`Failed to connect to database: ${error}`, 'red');
		return 1;
	}

	// Run sync
	logSection('Syncing providers');

	const startTime = Date.now();
	let totalErrors = 0;
	let totalItems = 0;

	try {
		const results = await syncAllProviders(db, {
			types,
			providerIds,
			forceFull: args.full
		});

		// Display results
		for (const result of results) {
			const provider = providerRegistry.getProvider(result.providerId);
			const providerName = provider?.name || result.providerId;
			const summary = summarizeResult(result);
			const duration = Date.now() - startTime;

			log(`\n${colors.bright}${providerName}${colors.reset}`, 'cyan');
			log(
				`  Status: ${result.errors.length === 0 ? 'OK' : 'Completed with errors'}`,
				result.errors.length === 0 ? 'green' : 'yellow'
			);
			log(`  Items: ${summary}`);

			totalItems += result.totalItems;
			totalErrors += result.errors.length;

			if (result.errors.length > 0) {
				log(`  ${colors.red}Errors (${result.errors.length}):${colors.reset}`);
				for (const error of result.errors.slice(0, 5)) {
					log(`    - ${error}`, 'red');
				}
				if (result.errors.length > 5) {
					log(`    ... and ${result.errors.length - 5} more`, 'dim');
				}
			}
		}

		logSection('Sync Summary');

		const duration = Date.now() - startTime;
		log(`Total items synced: ${formatNumber(totalItems)}`, 'bright');
		log(`Total errors: ${totalErrors}`, totalErrors === 0 ? 'green' : 'red');
		log(`Duration: ${(duration / 1000).toFixed(2)}s`, 'dim');

		// Exit code based on success
		return totalErrors > 0 ? 1 : 0;
	} catch (error) {
		log(`\nSync failed: ${error}`, 'red');
		logSection('Error Details');
		console.error(error);
		return 1;
	}
}

// Run and exit with proper code
main()
	.then((code) => {
		process.exit(code);
	})
	.catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
