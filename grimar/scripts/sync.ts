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
 *   --type <type>     Compendium type: spell, monster, item, feat, background, race, class,
 *                     subclass, subrace, trait, feature, skill, language, alignment,
 *                     proficiency, abilityScore, damageType, magicSchool, equipment,
 *                     weaponProperty, equipmentCategory, vehicle, monsterType, rule,
 *                     ruleSection, weapon, armor, condition, plane, section
 *   --provider <id>   Provider ID to sync (e.g., open5e, 5e-bits, srd, homebrew)
 *   --full            Force full re-sync (vs incremental)
 *   --verbose, -v     Verbose output
 *   --quiet, -q       Minimal output (only summary)
 *   --help, -h        Show this help message
 */

// Suppress winston console logs for cleaner output
process.env.SUPPRESS_LOGS = 'true';

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import * as schema from '../src/lib/server/db/schema';
import { syncAllProviders } from '../src/lib/server/services/sync/orchestrator';
import { providerRegistry } from '../src/lib/server/providers';
import type { ProviderSyncResult } from '../src/lib/server/providers/types';
import type { CompendiumTypeName } from '../src/lib/types/compendium';
import type {
	SyncProgressEvent,
	SyncProgressCallback
} from '../src/lib/server/services/sync/progress';
import { applyPragmas } from '../src/lib/server/db/db-config';
import { $count } from 'drizzle-orm';
import { compendiumItems } from '../src/lib/server/db/schema';

// Silence the winston logger during sync for cleaner output
process.env.SUPPRESS_LOGS = 'true';

// Valid compendium types
const VALID_TYPES: CompendiumTypeName[] = [
	'spell',
	'monster',
	'item',
	'feat',
	'background',
	'race',
	'class',
	'subclass',
	'subrace',
	'trait',
	'feature',
	'skill',
	'language',
	'alignment',
	'proficiency',
	'abilityScore',
	'damageType',
	'magicSchool',
	'equipment',
	'weaponProperty',
	'equipmentCategory',
	'vehicle',
	'monsterType',
	'rule',
	'ruleSection',
	'weapon',
	'armor',
	'condition',
	'plane',
	'section'
];

// Type labels for display
const TYPE_LABELS: Record<CompendiumTypeName, string> = {
	spell: 'Spells',
	monster: 'Monsters',
	item: 'Items',
	feat: 'Feats',
	background: 'Backgrounds',
	race: 'Races',
	class: 'Classes',
	subclass: 'Subclasses',
	subrace: 'Subraces',
	trait: 'Traits',
	feature: 'Features',
	skill: 'Skills',
	language: 'Languages',
	alignment: 'Alignments',
	proficiency: 'Proficiencies',
	abilityScore: 'Ability Scores',
	damageType: 'Damage Types',
	magicSchool: 'Magic Schools',
	equipment: 'Equipment',
	weaponProperty: 'Weapon Properties',
	equipmentCategory: 'Equipment Categories',
	vehicle: 'Vehicles',
	monsterType: 'Monster Types',
	rule: 'Rules',
	ruleSection: 'Rule Sections',
	weapon: 'Weapons',
	armor: 'Armor',
	condition: 'Conditions',
	plane: 'Planes',
	section: 'Sections'
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
	white: '\x1b[37m',
	blue: '\x1b[34m'
};

interface Args {
	type?: string;
	provider?: string;
	full?: boolean;
	verbose?: boolean;
	quiet?: boolean;
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

		if (arg === '--quiet' || arg === '-q') {
			args.quiet = true;
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
	const mins = Math.floor(ms / 60000);
	const secs = Math.floor((ms % 60000) / 1000);
	return `${mins}m ${secs}s`;
}

/**
 * Progress display handler for real-time sync updates
 */
class ProgressHandler {
	private quiet: boolean;
	private currentLine: string = '';
	private lastUpdate: number = 0;
	private pendingMessages: string[] = [];

	constructor(quiet: boolean = false) {
		this.quiet = quiet;
	}

	/**
	 * Handle a progress event and update display
	 */
	async handleEvent(event: SyncProgressEvent): Promise<void> {
		if (this.quiet) return;

		const { phase, providerName, type, current, total } = event;
		const percent = total && total > 0 ? Math.round(((current || 0) / total) * 100) : 0;
		const typeLabel = type ? TYPE_LABELS[type] : '';

		switch (phase) {
			case 'provider:start':
				this.clearLine();
				console.log(`${colors.bright}${colors.blue}▶ ${providerName}${colors.reset}`);
				break;

			case 'fetch:start':
				this.clearLine();
				this.showSpinner(
					`  ${colors.cyan}Fetching ${typeLabel}${colors.reset} from ${providerName}...`
				);
				break;

			case 'fetch:complete':
				this.clearSpinner();
				console.log(
					`  ${colors.green}✓${colors.reset} Fetched ${formatNumber(total)} ${typeLabel.toLowerCase()}`
				);
				break;

			case 'transform:start':
				// Already handled by first transform:progress
				break;

			case 'transform:progress':
				this.showSpinner(
					`  ${colors.cyan}Processing${colors.reset} ${formatNumber(current)}/${formatNumber(total)} ${typeLabel.toLowerCase()} (${percent}%)`
				);
				break;

			case 'transform:complete':
				this.clearSpinner();
				break;

			case 'insert:start':
				// Already handled by first insert:progress
				break;

			case 'insert:progress':
				this.showSpinner(
					`  ${colors.cyan}Inserting${colors.reset} ${formatNumber(current)}/${formatNumber(total)} ${typeLabel.toLowerCase()} (${percent}%)`
				);
				break;

			case 'insert:complete':
				this.clearSpinner();
				console.log(`  ${colors.green}✓${colors.reset} Inserted ${formatNumber(current)} items`);
				break;

			case 'provider:complete':
				console.log('');
				break;

			case 'error':
				this.clearSpinner();
				console.log(`  ${colors.red}✗ Error:${colors.reset} ${event.error}`);
				break;
		}
	}

	private showSpinner(message: string): void {
		const now = Date.now();
		// Rate limit updates to 200ms
		if (now - this.lastUpdate < 200 && this.currentLine) return;

		this.clearLine();
		const spinChars = ['◐', '◓', '◑', '◒'];
		const char = spinChars[Math.floor(now / 150) % spinChars.length];
		this.currentLine = `${colors.dim}${char}${colors.reset} ${message}`;
		process.stdout.write(this.currentLine);
		this.lastUpdate = now;
	}

	private clearLine(): void {
		if (this.currentLine) {
			process.stdout.write('\r' + ' '.repeat(this.currentLine.length + 5) + '\r');
			this.currentLine = '';
		}
	}

	private clearSpinner(): void {
		this.clearLine();
	}

	finish(): void {
		this.clearLine();
	}
}

function showHelp() {
	const help = `
${colors.bright}${colors.cyan}╔════════════════════════════════════════╗${colors.reset}
${colors.bright}${colors.cyan}║${colors.reset}       ${colors.bright}Compendium Sync CLI${colors.reset}           ${colors.bright}${colors.cyan}║${colors.reset}
${colors.bright}${colors.cyan}╚════════════════════════════════════════╝${colors.reset}
${colors.dim}Sync D&D 5e data from providers into local database${colors.reset}

${colors.bright}Usage:${colors.reset}
  ${colors.cyan}bun run db:sync${colors.reset} [options]

${colors.bright}Options:${colors.reset}
  ${colors.cyan}--type <type>${colors.reset}       Compendium type to sync
                        Values: ${colors.green}spell${colors.reset}, ${colors.green}monster${colors.reset}, ${colors.green}item${colors.reset},
                                ${colors.green}feat${colors.reset}, ${colors.green}background${colors.reset},
                                ${colors.green}race${colors.reset}, ${colors.green}class${colors.reset}
  ${colors.cyan}--provider <id>${colors.reset}   Sync only a specific provider
                        Values: ${colors.green}open5e${colors.reset}, ${colors.green}srd${colors.reset}, ${colors.green}homebrew${colors.reset}
  ${colors.cyan}--full${colors.reset}             Force full re-sync (ignore incremental)
  ${colors.cyan}--verbose, -v${colors.reset}     Show detailed progress
  ${colors.cyan}--quiet, -q${colors.reset}       Minimal output (summary only)
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

function createProgressBar(current: number, total: number, width: number = 25): string {
	const percent = total > 0 ? current / total : 0;
	const filled = Math.round(percent * width);
	const empty = width - filled;
	return `${colors.cyan}${'█'.repeat(filled)}${'░'.repeat(empty)}${colors.reset}`;
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
	const dbSpinner = new ProgressHandler(args.quiet);
	dbSpinner.handleEvent({
		phase: 'fetch:start',
		providerId: 'db',
		providerName: 'Database',
		type: 'spell',
		timestamp: new Date()
	} as SyncProgressEvent);

	let db: any;
	try {
		const client = new Database(databaseUrl);
		applyPragmas(client);
		db = drizzle(client, { schema });
		migrate(db, { migrationsFolder: './drizzle' });
		dbSpinner.handleEvent({
			phase: 'fetch:complete',
			providerId: 'db',
			providerName: 'Database',
			type: 'spell',
			current: 1,
			total: 1,
			timestamp: new Date()
		} as SyncProgressEvent);
	} catch (error) {
		dbSpinner.handleEvent({
			phase: 'error',
			providerId: 'db',
			providerName: 'Database',
			type: 'spell',
			error: String(error),
			timestamp: new Date()
		} as SyncProgressEvent);
		return 1;
	}

	// Get before stats
	const beforeStats = await getDbStats(db);
	const beforeTotal = Object.values(beforeStats).reduce((a, b) => a + b, 0);

	// Find max for progress bar scaling
	const maxCount = Math.max(...Object.values(beforeStats), 1);

	console.log('');
	console.log(`${colors.dim}📊 Current database state:${colors.reset}`);
	for (const type of VALID_TYPES) {
		const count = beforeStats[type];
		const label = TYPE_LABELS[type];
		const bar = createProgressBar(count, maxCount, 25);
		console.log(
			`   ${colors.cyan}${label.padEnd(12)}${colors.reset} ${bar} ${formatNumber(count)}`
		);
	}
	const totalBar = createProgressBar(beforeTotal, beforeTotal, 25);
	console.log(
		`   ${colors.white}${'Total'.padEnd(12)}${colors.reset} ${totalBar} ${formatNumber(beforeTotal)}`
	);
	console.log('');

	// Run sync
	console.log(`${colors.bright}${colors.cyan}🚀 Starting sync...${colors.reset}`);
	console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
	console.log('');

	const startTime = Date.now();
	let totalErrors = 0;
	let totalItems = 0;

	// Create progress handler
	const progress = new ProgressHandler(args.quiet);

	try {
		const results = await syncAllProviders(db, {
			types,
			providerIds,
			forceFull: args.full,
			onProgress: (event) => progress.handleEvent(event)
		});

		// Clear any remaining spinner
		progress.finish();

		// Display results per provider
		for (const result of results) {
			const provider = providerRegistry.getProvider(result.providerId);
			const providerName = provider?.name || result.providerId;

			// Provider card
			console.log(`${colors.bright}${colors.blue}┌─── ${providerName}${colors.reset}`);
			console.log(`${colors.bright}${colors.blue}│${colors.reset}`);

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
					`${colors.bright}${colors.blue}│${colors.reset}   ${typeResults.join(`  ${colors.dim}│${colors.reset}   `)}`
				);
			} else {
				console.log(
					`${colors.bright}${colors.blue}│${colors.reset}   ${colors.dim}No items synced${colors.reset}`
				);
			}

			console.log(`${colors.bright}${colors.blue}│${colors.reset}`);

			if (result.skipped > 0) {
				console.log(
					`${colors.bright}${colors.blue}│${colors.reset}   ${colors.yellow}⏭ Skipped:${colors.reset} ${formatNumber(result.skipped)}`
				);
			}

			if (result.errors.length > 0) {
				console.log(
					`${colors.bright}${colors.blue}│${colors.reset}   ${colors.red}✗ Errors:${colors.reset} ${result.errors.length}`
				);
				if (args.verbose) {
					for (const error of result.errors.slice(0, 3)) {
						const errorMsg = typeof error === 'string' ? error : error.message;
						console.log(
							`${colors.bright}${colors.blue}│${colors.reset}      ${colors.red}•${colors.reset} ${errorMsg.substring(0, 60)}${errorMsg.length > 60 ? '...' : ''}`
						);
					}
					if (result.errors.length > 3) {
						console.log(
							`${colors.bright}${colors.blue}│${colors.reset}      ${colors.dim}... and ${result.errors.length - 3} more${colors.reset}`
						);
					}
				}
			} else {
				console.log(
					`${colors.bright}${colors.blue}│${colors.reset}   ${colors.green}✓ All operations successful${colors.reset}`
				);
			}

			console.log(
				`${colors.bright}${colors.blue}└${colors.dim}${'─'.repeat(providerName.length + 2)}${colors.reset}`
			);
			console.log('');

			totalItems += result.totalItems;
			totalErrors += result.errors.length;
		}

		// Get after stats
		const afterStats = await getDbStats(db);
		const afterTotal = Object.values(afterStats).reduce((a, b) => a + b, 0);

		// Summary
		const duration = Date.now() - startTime;

		// Summary box
		console.log(
			`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
		);
		console.log(`${colors.bright}${colors.white}  SYNC SUMMARY${colors.reset}`);
		console.log(
			`${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
		);
		console.log('');

		// Before → After table
		console.log(
			`${colors.dim}┌${'─'.repeat(14)}┬${'─'.repeat(12)}┬${'─'.repeat(12)}┬${'─'.repeat(10)}┐${colors.reset}`
		);
		console.log(
			`${colors.dim}│${colors.reset} ${colors.white}Type${colors.reset.padEnd(12)} ${colors.dim}│${colors.reset} ${colors.white}Before${colors.reset.padEnd(10)} ${colors.dim}│${colors.reset} ${colors.white}After${colors.reset.padEnd(10)} ${colors.dim}│${colors.reset} ${colors.white}Change${colors.reset.padEnd(8)} ${colors.dim}│${colors.reset}`
		);
		console.log(
			`${colors.dim}├${'─'.repeat(14)}┼${'─'.repeat(12)}┼${'─'.repeat(12)}┼${'─'.repeat(10)}┤${colors.reset}`
		);

		for (const type of VALID_TYPES) {
			const before = beforeStats[type];
			const after = afterStats[type];
			const diff = after - before;

			if (diff !== 0 || before > 0) {
				const diffStr = diff > 0 ? `+${formatNumber(diff)}` : diff < 0 ? formatNumber(diff) : '0';
				const diffColor = diff > 0 ? 'green' : diff < 0 ? 'red' : 'dim';
				console.log(
					`${colors.dim}│${colors.reset} ${colors.cyan}${TYPE_LABELS[type].padEnd(12)} ${colors.dim}│${colors.reset} ${formatNumber(before).padEnd(10)} ${colors.dim}│${colors.reset} ${formatNumber(after).padEnd(10)} ${colors.dim}│${colors.reset} ${colors[diffColor]}${diffStr.padEnd(8)}${colors.reset} ${colors.dim}│${colors.reset}`
				);
			}
		}

		// Total row
		const totalDiff = afterTotal - beforeTotal;
		const totalDiffStr = totalDiff > 0 ? `+${formatNumber(totalDiff)}` : formatNumber(totalDiff);
		const totalDiffColor = totalDiff >= 0 ? 'green' : 'red';

		console.log(
			`${colors.dim}├${'─'.repeat(14)}┼${'─'.repeat(12)}┼${'─'.repeat(12)}┼${'─'.repeat(10)}┤${colors.reset}`
		);
		console.log(
			`${colors.dim}│${colors.reset} ${colors.white}${'Total'.padEnd(12)} ${colors.dim}│${colors.reset} ${formatNumber(beforeTotal).padEnd(10)} ${colors.dim}│${colors.reset} ${formatNumber(afterTotal).padEnd(10)} ${colors.dim}│${colors.reset} ${colors[totalDiffColor]}${totalDiffStr.padEnd(8)}${colors.reset} ${colors.dim}│${colors.reset}`
		);
		console.log(
			`${colors.dim}└${'─'.repeat(14)}┴${'─'.repeat(12)}┴${'─'.repeat(12)}┴${'─'.repeat(10)}┘${colors.reset}`
		);
		console.log('');

		// Statistics
		console.log(`${colors.bright}📈 Statistics:${colors.reset}`);
		console.log(
			`   ${colors.cyan}Items synced:${colors.reset} ${colors.bright}${formatNumber(totalItems)}${colors.reset}`
		);
		console.log(
			`   ${colors.cyan}Duration:${colors.reset}    ${colors.bright}${formatDuration(duration)}${colors.reset}`
		);
		console.log(`   ${colors.cyan}Providers:${colors.reset}   ${results.length}`);
		console.log(
			`   ${colors.cyan}Errors:${colors.reset}      ${totalErrors === 0 ? colors.green + 'None' : colors.red + formatNumber(totalErrors)}${colors.reset}`
		);
		console.log('');

		// Exit indicator
		if (totalErrors === 0 && totalItems > 0) {
			console.log(`${colors.green}${colors.bright}✅ Sync completed successfully!${colors.reset}`);
		} else if (totalErrors > 0) {
			console.log(
				`${colors.yellow}${colors.bright}⚠ Sync completed with ${formatNumber(totalErrors)} error(s)${colors.reset}`
			);
		} else {
			console.log(`${colors.dim}${colors.bright}ℹ No new items to sync${colors.reset}`);
		}

		return totalErrors > 0 ? 1 : 0;
	} catch (error) {
		progress.finish();
		console.log(`\n${colors.red}✗ Sync failed: ${error}${colors.reset}`);
		console.error(`Sync failed: ${error}`);
		return 1;
	}
}

// Run and exit with proper code
main()
	.then((code) => {
		process.exit(code);
	})
	.catch((error) => {
		console.error(`Fatal error: ${error}`);
		process.exit(1);
	});
