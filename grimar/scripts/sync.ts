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
 *   --verbose, -v     Verbose output
 *   --help, -h        Show this help message
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import * as schema from '../src/lib/server/db/schema';
import { syncAllProviders } from '../src/lib/server/services/sync/orchestrator';
import { providerRegistry } from '../src/lib/server/providers';
import type { ProviderSyncResult } from '../src/lib/server/providers/types';
import type { CompendiumTypeName } from '../src/lib/types/compendium';
import { applyPragmas } from '../src/lib/server/db/db-config';
import { createModuleLogger } from '../src/lib/server/logger';
import { $count } from 'drizzle-orm';
import { compendiumItems } from '../src/lib/server/db/schema';

const logger = createModuleLogger('SyncCLI');

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

// Type labels for display
const TYPE_LABELS: Record<CompendiumTypeName, string> = {
	spell: 'Spells',
	monster: 'Monsters',
	item: 'Items',
	feat: 'Feats',
	background: 'Backgrounds',
	race: 'Races',
	class: 'Classes'
};

// Colors for terminal output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
	magenta: '\x1b[35m',
	white: '\x1b[37m'
};

interface Args {
	type?: string;
	provider?: string;
	full?: boolean;
	verbose?: boolean;
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

		if (arg === '--verbose' || arg === '-v') {
			args.verbose = true;
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
	}

	return args;
}

function formatNumber(n: number | undefined): string {
	return (n || 0).toLocaleString();
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(0)}s`;
}

function formatPercent(a: number, b: number): string {
	if (b === 0) return '0%';
	return `${((a / b) * 100).toFixed(1)}%`;
}

// Progress spinner class
class ProgressSpinner {
	private chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	private idx = 0;
	private message: string;
	private interval: number | null = null;

	constructor(message: string) {
		this.message = message;
	}

	start() {
		process.stdout.write(`${this.chars[0]} ${this.message}`);
		this.interval = setInterval(() => {
			this.idx = (this.idx + 1) % this.chars.length;
			process.stdout.write(`\r${this.chars[this.idx]} ${this.message}`);
		}, 100);
	}

	stop(success: boolean = true) {
		if (this.interval) {
			clearInterval(this.interval);
			process.stdout.write('\r');
		}
		process.stdout.write(`${success ? '✓' : '✗'} ${this.message}\n`);
	}
}

function showHelp() {
	const help = `
${colors.bright}${colors.cyan}┌─────────────────────────────────────────┐${colors.reset}
${colors.bright}${colors.cyan}│${colors.reset}         ${colors.bright}Compendium Sync CLI${colors.reset}          ${colors.bright}${colors.cyan}│${colors.reset}
${colors.bright}${colors.cyan}└─────────────────────────────────────────┘${colors.reset}
${colors.dim}Sync D&D 5e data from providers into local database${colors.reset}

${colors.bright}Usage:${colors.reset}
  ${colors.cyan}bun run db:sync${colors.reset} [options]

${colors.bright}Options:${colors.reset}
  ${colors.cyan}--type <type>${colors.reset}       Compendium type to sync
                        Values: ${colors.green}spell${colors.reset}, ${colors.green}monster${colors.reset}, ${colors.green}item${colors.reset},
                                ${colors.green}feat${colors.reset}, ${colors.green}background${colors.reset},
                                ${colors.green}race${colors.reset}, ${colors.green}class${colors.reset}
  ${colors.cyan}--provider <id>${colors.reset}   Sync only a specific provider
                        Values: ${colors.green}open5e${colors.reset}, ${colors.green}5e-bits${colors.reset},
                                ${colors.green}srd${colors.reset}, ${colors.green}homebrew${colors.reset}
  ${colors.cyan}--full${colors.reset}             Force full re-sync (ignore incremental)
  ${colors.cyan}--verbose, -v${colors.reset}     Show detailed progress
  ${colors.cyan}--help, -h${colors.reset}        Show this help message

${colors.bright}Examples:${colors.reset}
  ${colors.cyan}bun run db:sync${colors.reset}                 # Sync everything
  ${colors.cyan}bun run db:sync --type spell${colors.reset}    # Sync spells only
  ${colors.cyan}bun run db:sync --provider srd${colors.reset}  # Sync SRD content only
  ${colors.cyan}bun run db:sync --full${colors.reset}          # Force full re-sync
`;
	console.log(help);
}

async function getDbStats(db: any): Promise<Record<CompendiumTypeName, number>> {
	const stats: Record<string, number> = {};
	for (const type of VALID_TYPES) {
		stats[type] = (await db.$count(compendiumItems, undefined)) as number;
	}
	return stats as Record<CompendiumTypeName, number>;
}

async function main() {
	const args = parseArgs();

	if (args.help) {
		showHelp();
		return 0;
	}

	// Header
	console.log('');
	console.log(
		`${colors.bright}${colors.cyan}   ╔════════════════════════════════════╗${colors.reset}`
	);
	console.log(
		`${colors.bright}${colors.cyan}   ║${colors.reset}      ${colors.white}Compendium Sync${colors.reset}             ${colors.bright}${colors.cyan}║${colors.reset}`
	);
	console.log(
		`${colors.bright}${colors.cyan}   ╚════════════════════════════════════╝${colors.reset}`
	);
	console.log('');

	// Check DATABASE_URL
	const databaseUrl = process.env.DATABASE_URL || 'local.db';
	console.log(`${colors.dim}📂 Database:${colors.reset} ${databaseUrl}`);

	// Validate type if provided
	let types: CompendiumTypeName[] | undefined;
	if (args.type) {
		const normalizedType = args.type.toLowerCase() as CompendiumTypeName;
		if (!VALID_TYPES.includes(normalizedType)) {
			console.log(`${colors.red}✗ Invalid type: ${args.type}${colors.reset}`);
			console.log(`${colors.dim}Valid types: ${VALID_TYPES.join(', ')}${colors.reset}`);
			return 1;
		}
		types = [normalizedType];
		console.log(`${colors.dim}🔍 Type filter:${colors.reset} ${TYPE_LABELS[normalizedType]}`);
	}

	// Validate provider if provided
	const providerIds = args.provider ? [args.provider] : undefined;
	if (args.provider) {
		const registry = providerRegistry;
		const provider = registry.getProvider(args.provider);
		if (!provider) {
			console.log(`${colors.red}✗ Unknown provider: ${args.provider}${colors.reset}`);
			console.log(
				`${colors.dim}Available: ${registry
					.getEnabledProviders()
					.map((p) => p.id)
					.join(', ')}${colors.reset}`
			);
			return 1;
		}
		console.log(`${colors.dim}🔍 Provider filter:${colors.reset} ${provider.name}`);
	}

	if (args.full) {
		console.log(`${colors.dim}⚡ Force full re-sync enabled${colors.reset}`);
	}

	console.log('');

	// Initialize database
	const progress = new ProgressSpinner('Connecting to database...');
	progress.start();

	let db: any;
	try {
		const client = new Database(databaseUrl);
		applyPragmas(client);
		db = drizzle(client, { schema });
		migrate(db, { migrationsFolder: './drizzle' });
		progress.stop(true);
	} catch (error) {
		progress.stop(false);
		console.log(`${colors.red}✗ Failed to connect: ${error}${colors.reset}`);
		return 1;
	}

	// Get before stats
	const beforeStats = await getDbStats(db);
	const beforeTotal = Object.values(beforeStats).reduce((a, b) => a + b, 0);

	console.log(`${colors.dim}📊 Current database state:${colors.reset}`);
	for (const type of VALID_TYPES) {
		const count = beforeStats[type];
		const label = TYPE_LABELS[type];
		const bar = '█'.repeat(Math.min(count / 100, 40)) + '░'.repeat(40 - Math.min(count / 100, 40));
		console.log(
			`   ${colors.cyan}${label.padEnd(12)}${colors.reset} ${bar} ${formatNumber(count)}`
		);
	}
	console.log(
		`   ${colors.white}${'Total'.padEnd(12)}${colors.reset} ${'█'.repeat(40)} ${formatNumber(beforeTotal)}`
	);
	console.log('');

	// Run sync
	console.log(`${colors.bright}${colors.cyan}🚀 Starting sync...${colors.reset}`);
	console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);

	const startTime = Date.now();
	let totalErrors = 0;
	let totalItems = 0;
	const providerResults: Array<ProviderSyncResult & { duration: number; providerName: string }> =
		[];

	try {
		const results = await syncAllProviders(db, {
			types,
			providerIds,
			forceFull: args.full
		});

		// Display results per provider
		for (const result of results) {
			const provider = providerRegistry.getProvider(result.providerId);
			const providerName = provider?.name || result.providerId;
			const duration =
				providerResults.find((r) => r.providerId === result.providerId)?.duration || 0;

			console.log(`${colors.bright}${colors.cyan}┌─── ${providerName}${colors.reset}`);
			console.log(`${colors.bright}${colors.cyan}│${colors.reset}`);

			// Type breakdown
			const typeResults: string[] = [];
			for (const type of VALID_TYPES) {
				const count = result[(type + 's') as keyof ProviderSyncResult];
				if (count && count > 0) {
					const label = TYPE_LABELS[type];
					typeResults.push(
						`${colors.green}✓${colors.reset} ${label}: ${colors.bright}${formatNumber(count)}${colors.reset}`
					);
				}
			}

			if (typeResults.length > 0) {
				console.log(
					`${colors.bright}${colors.cyan}│${colors.reset}   ${typeResults.join(`  ${colors.dim}│${colors.reset}   `)}`
				);
			} else {
				console.log(
					`${colors.bright}${colors.cyan}│${colors.reset}   ${colors.dim}No items synced${colors.reset}`
				);
			}

			console.log(`${colors.bright}${colors.cyan}│${colors.reset}`);
			console.log(
				`${colors.bright}${colors.cyan}│${colors.reset}   ${colors.dim}Duration:${colors.reset} ${formatDuration(duration)}`
			);

			if (result.skipped > 0) {
				console.log(
					`${colors.bright}${colors.cyan}│${colors.reset}   ${colors.yellow}⏭ Skipped:${colors.reset} ${formatNumber(result.skipped)}`
				);
			}

			if (result.errors.length > 0) {
				console.log(
					`${colors.bright}${colors.cyan}│${colors.reset}   ${colors.red}✗ Errors:${colors.reset} ${result.errors.length}`
				);
				if (args.verbose) {
					for (const error of result.errors.slice(0, 3)) {
						const errorMsg = typeof error === 'string' ? error : error.message;
						console.log(
							`${colors.bright}${colors.cyan}│${colors.reset}      ${colors.red}•${colors.reset} ${errorMsg.substring(0, 60)}${colors.dim}${errorMsg.length > 60 ? '...' : ''}${colors.reset}`
						);
					}
					if (result.errors.length > 3) {
						console.log(
							`${colors.bright}${colors.cyan}│${colors.reset}      ${colors.dim}... and ${result.errors.length - 3} more${colors.reset}`
						);
					}
				}
			} else {
				console.log(
					`${colors.bright}${colors.cyan}│${colors.reset}   ${colors.green}✓ All operations successful${colors.reset}`
				);
			}

			console.log(
				`${colors.bright}${colors.cyan}└${colors.dim}${'─'.repeat(providerName.length + 2)}${colors.reset}\n`
			);

			totalItems += result.totalItems;
			totalErrors += result.errors.length;
			providerResults.push({ ...result, duration, providerName });
		}

		// Get after stats
		const afterStats = await getDbStats(db);
		const afterTotal = Object.values(afterStats).reduce((a, b) => a + b, 0);

		// Summary
		const duration = Date.now() - startTime;

		console.log(
			`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
		);
		console.log(`${colors.bright}${colors.white}  SYNC SUMMARY${colors.reset}`);
		console.log(
			`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
		);
		console.log('');

		console.log(
			`${colors.dim}┌${'─'.repeat(15)}┬${'─'.repeat(25)}┬${'─'.repeat(15)}┐${colors.reset}`
		);
		console.log(
			`${colors.dim}│${colors.reset} ${colors.white}Type${colors.reset.padEnd(13)} ${colors.dim}│${colors.reset} ${colors.white}Before${colors.reset.padEnd(23)} ${colors.dim}│${colors.reset} ${colors.white}After${colors.reset.padEnd(13)} ${colors.dim}│${colors.reset}`
		);
		console.log(
			`${colors.dim}├${'─'.repeat(15)}┼${'─'.repeat(25)}┼${'─'.repeat(15)}┤${colors.reset}`
		);

		let changedTypes = 0;
		for (const type of VALID_TYPES) {
			const before = beforeStats[type];
			const after = afterStats[type];
			const diff = after - before;

			if (diff !== 0) {
				const diffStr = diff > 0 ? `+${formatNumber(diff)}` : `${formatNumber(diff)}`;
				const diffColor = diff > 0 ? 'green' : 'red';
				console.log(
					`${colors.dim}│${colors.reset} ${colors.cyan}${TYPE_LABELS[type].padEnd(13)} ${colors.dim}│${colors.reset} ${formatNumber(before).padEnd(23)} ${colors.dim}│${colors.reset} ${formatNumber(after).padEnd(13)} ${colors.dim}│${colors.reset}`
				);
				console.log(
					`${colors.dim}│${colors.reset} ${colors.dim}Change${colors.reset.padEnd(11)} ${colors.dim}│${colors.reset} ${colors[diffColor]}${diffStr.padEnd(23)}${colors.reset} ${colors.dim}│${colors.reset}`
				);
				changedTypes++;
			}
		}

		console.log(
			`${colors.dim}├${'─'.repeat(15)}┼${'─'.repeat(25)}┼${'─'.repeat(15)}┤${colors.reset}`
		);
		console.log(
			`${colors.dim}│${colors.reset} ${colors.white}Total${colors.reset.padEnd(13)} ${colors.dim}│${colors.reset} ${formatNumber(beforeTotal).padEnd(23)} ${colors.dim}│${colors.reset} ${formatNumber(afterTotal).padEnd(13)} ${colors.dim}│${colors.reset}`
		);

		const totalDiff = afterTotal - beforeTotal;
		const totalDiffStr =
			totalDiff > 0 ? `+${formatNumber(totalDiff)}` : `${formatNumber(totalDiff)}`;
		const totalDiffColor = totalDiff >= 0 ? 'green' : 'red';
		console.log(
			`${colors.dim}│${colors.reset} ${colors.dim}Change${colors.reset.padEnd(11)} ${colors.dim}│${colors.reset} ${colors[totalDiffColor]}${totalDiffStr.padEnd(23)}${colors.reset} ${colors.dim}│${colors.reset}`
		);

		console.log(
			`${colors.dim}└${'─'.repeat(15)}┴${'─'.repeat(25)}┴${'─'.repeat(15)}┘${colors.reset}`
		);
		console.log('');

		// Stats
		console.log(`${colors.bright}📈 Statistics:${colors.reset}`);
		console.log(
			`   ${colors.cyan}Total synced:${colors.reset} ${colors.bright}${formatNumber(totalItems)}${colors.reset} items`
		);
		console.log(
			`   ${colors.cyan}Duration:${colors.reset} ${colors.bright}${formatDuration(duration)}${colors.reset}`
		);
		console.log(`   ${colors.cyan}Providers:${colors.reset} ${providerResults.length}`);

		if (providerResults.length > 0) {
			const avgDuration =
				providerResults.reduce((a, b) => a + b.duration, 0) / providerResults.length;
			console.log(
				`   ${colors.cyan}Avg per provider:${colors.reset} ${formatDuration(avgDuration)}`
			);
		}

		console.log('');
		console.log(
			`${colors.bright}📋 Errors:${colors.reset} ${totalErrors === 0 ? colors.green + '✓ None' : colors.red + totalErrors}${colors.reset}`
		);
		console.log('');

		// Exit indicator
		if (totalErrors === 0 && totalItems > 0) {
			console.log(`${colors.green}${colors.bright}✅ Sync completed successfully!${colors.reset}`);
		} else if (totalErrors > 0) {
			console.log(
				`${colors.yellow}${colors.bright}⚠ Sync completed with ${totalErrors} error(s)${colors.reset}`
			);
		} else {
			console.log(`${colors.dim}${colors.bright}ℹ No new items to sync${colors.reset}`);
		}

		return totalErrors > 0 ? 1 : 0;
	} catch (error) {
		console.log(`\n${colors.red}✗ Sync failed: ${error}${colors.reset}`);
		logger.error({ error }, 'Error during sync');
		return 1;
	}
}

// Run and exit with proper code
main()
	.then((code) => {
		process.exit(code);
	})
	.catch((error) => {
		logger.error({ error }, 'Fatal error');
		process.exit(1);
	});
