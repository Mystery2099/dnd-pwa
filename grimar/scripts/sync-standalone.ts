#!/usr/bin/env bun
/**
 * Standalone Sync CLI
 *
 * Syncs D&D 5e compendium data from providers without SvelteKit context.
 *
 * Usage:
 *   bun run db:sync                 # Sync all enabled providers (default)
 *   bun run db:sync --type spell    # Sync only spells
 *   bun run db:sync --provider open5e  # Sync only a specific provider
 *   bun run db:sync --verbose       # Verbose output
 *   bun run db:sync --help          # Show help
 *
 * Options:
 *   --type <type>       Compendium type: spell, monster, item, feat, background, race, class
 *   --provider <id>     Provider ID to sync (e.g., open5e, srd)
 *   --verbose, -v       Verbose output
 *   --quiet, -q         Minimal output
 *   --help, -h          Show this help
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sql, eq } from 'drizzle-orm';
import { z } from 'zod';
import * as schema from '../src/lib/server/db/schema';
import { applyPragmas } from '../src/lib/server/db/db-config';

// Parse arguments
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');
const verbose = args.includes('--verbose') || args.includes('-v');
const quiet = args.includes('--quiet') || args.includes('-q');

// Valid compendium types
const VALID_TYPES = ['spell', 'monster', 'item', 'feat', 'background', 'race', 'class'] as const;
type CompendiumType = (typeof VALID_TYPES)[number];

// Parse --type
const typeIndex = args.indexOf('--type');
const typeArg = typeIndex > -1 ? args[typeIndex + 1] : null;
const selectedType =
	typeArg && VALID_TYPES.includes(typeArg as CompendiumType) ? (typeArg as CompendiumType) : null;

// Parse --provider
const providerIndex = args.indexOf('--provider');
const selectedProvider = providerIndex > -1 ? args[providerIndex + 1] : null;

if (help) {
	console.log(`
Standalone Sync CLI

Syncs D&D 5e compendium data from providers without SvelteKit context.

Usage:
  bun run db:sync                 # Sync all enabled providers
  bun run db:sync --type spell    # Sync only spells
  bun run db:sync --provider open5e  # Sync only a specific provider
  bun run db:sync --verbose       # Verbose output
  bun run db:sync --help          # Show this help

Options:
  --type <type>       spell, monster, item, feat, background, race, class
  --provider <id>     open5e, srd
  --verbose, -v       Verbose output
  --quiet, -q         Minimal output
  --help, -h          Show this help
`);
	process.exit(0);
}

// Simple logger
const log = {
	info: (msg: string, meta?: object) => !quiet && console.log(`[INFO] ${msg}`),
	error: (msg: string, meta?: object) => console.error(`[ERROR] ${msg}`, meta || ''),
	warn: (msg: string, meta?: object) => !quiet && console.warn(`[WARN] ${msg}`),
	debug: (msg: string, meta?: object) => verbose && console.log(`[DEBUG] ${msg}`, meta || '')
};

// Provider configurations
const PROVIDERS = {
	open5e: {
		id: 'open5e',
		name: 'Open5e',
		baseUrl: 'https://api.open5e.com',
		types: ['spell', 'monster', 'item', 'feat', 'background', 'race', 'class'] as const,
		endpoints: {
			spell: '/v1/spells/',
			monster: '/v1/monsters/',
			item: '/v1/magicitems/',
			feat: '/v1/feats/',
			background: '/v1/backgrounds/',
			race: '/v1/races/',
			class: '/v1/classes/'
		}
	},
	srd: {
		id: 'srd',
		name: 'SRD',
		baseUrl: 'https://www.dnd5eapi.co/api',
		types: ['spell', 'monster'] as const,
		endpoints: {
			spell: '/spells',
			monster: '/monsters'
		}
	}
};

// Open5e schema for validation
const Open5eItemSchema = z.object({
	slug: z.string(),
	name: z.string(),
	desc: z.string().optional(),
	description: z.string().optional(),
	higher_level: z.string().optional().nullable(),
	higherLevel: z.string().optional(),
	material: z.string().optional().nullable(),
	level: z.number().optional(),
	school: z.string().optional(),
	attack_type: z.string().optional().nullable(),
	damage: z.string().optional().nullable(),
	heal_at_slot_level: z.string().optional().nullable(),
	range: z.string().optional().nullable(),
	components: z.string().optional().nullable(),
	ritual: z.string().optional().nullable(),
	concentration: z.string().optional().nullable(),
	duration: z.string().optional().nullable(),
	casting_time: z.string().optional().nullable(),
	armor_class: z.string().optional().nullable(),
	hit_dice: z.string().optional().nullable(),
	hp: z.string().optional().nullable(),
	strength: z.string().optional().nullable(),
	stealth: z.string().optional().nullable(),
	weight: z.string().optional().nullable(),
	type: z.string().optional(),
	rarity: z.string().optional(),
	properties: z.array(z.string()).optional(),
	actions: z.array(z.object({ name: z.string(), desc: z.string() })).optional(),
	special_abilities: z.array(z.object({ name: z.string(), desc: z.string() })).optional(),
	reactions: z.array(z.object({ name: z.string(), desc: z.string() })).optional()
});

// Zod import for validation
import { z } from 'zod';

// Helper to validate and parse Open5e data
function validateOpen5eItem(data: unknown, type: string) {
	const result = Open5eItemSchema.safeParse(data);
	if (!result.success) {
		log.debug({ type, issues: result.error.issues }, 'Validation warning');
		return data;
	}
	return result.data;
}

// Transform Open5e item to database format
function transformOpen5eItem(item: unknown, type: string, providerId: string) {
	const data = validateOpen5eItem(item, type);
	const name = data.name || 'Unknown';
	const externalId = data.slug || name.toLowerCase().replace(/\s+/g, '-');

	// Build summary from description
	let summary = data.description || data.desc || '';
	if (summary.length > 200) {
		summary = summary.slice(0, 197) + '...';
	}

	// Build details object
	const details: Record<string, unknown> = {
		name,
		description: data.description || data.desc || '',
		higherLevel: data.higher_level || data.higherLevel,
		material: data.material,
		level: data.level,
		school: data.school,
		damage: data.damage,
		range: data.range,
		components: data.components,
		ritual: data.ritual,
		concentration: data.concentration,
		duration: data.duration,
		castingTime: data.casting_time,
		type: data.type,
		rarity: data.rarity,
		properties: data.properties,
		actions: data.actions,
		specialAbilities: data.special_abilities,
		reactions: data.reactions
	};

	return {
		source: providerId,
		type,
		externalId,
		name,
		summary: summary || name,
		details,
		spellLevel: data.level,
		spellSchool: data.school
	};
}

// Fetch all pages from Open5e
async function fetchOpen5eAllPages(endpoint: string): Promise<unknown[]> {
	const baseUrl = PROVIDERS.open5e.baseUrl;
	let nextUrl: string | null = `${baseUrl}${endpoint}?limit=200`;
	const allItems: unknown[] = [];

	while (nextUrl) {
		log.debug({ url: nextUrl }, 'Fetching Open5e page');

		const response = await fetch(nextUrl);
		if (!response.ok) {
			throw new Error(`Open5e API error: ${response.status} ${response.statusText}`);
		}

		const rawData = await response.json();
		const items = rawData.results || [];

		for (const item of items) {
			allItems.push(item);
		}

		nextUrl = rawData.next;
	}

	log.debug({ count: allItems.length }, 'Open5e fetch complete');
	return allItems;
}

// Sync a single type from a provider
async function syncType(
	db: ReturnType<typeof drizzle>,
	type: string,
	providerId: string,
	endpoint: string
): Promise<number> {
	log.info(`Syncing ${type} from ${providerId}...`);

	const startTime = Date.now();
	let count = 0;

	try {
		if (providerId === 'open5e') {
			const items = await fetchOpen5eAllPages(endpoint);

			for (const item of items) {
				try {
					const transformed = transformOpen5eItem(item, type, providerId);

					// Insert into database
					await db
						.insert(schema.compendiumItems)
						.values({
							source: transformed.source,
							type: transformed.type,
							externalId: transformed.externalId,
							name: transformed.name,
							summary: transformed.summary,
							details: transformed.details,
							spellLevel: transformed.spellLevel,
							spellSchool: transformed.spellSchool
						})
						.onConflictDoUpdate({
							target: [
								schema.compendiumItems.type,
								schema.compendiumItems.source,
								schema.compendiumItems.externalId
							],
							set: {
								name: transformed.name,
								summary: transformed.summary,
								details: transformed.details,
								spellLevel: transformed.spellLevel,
								spellSchool: transformed.spellSchool
							}
						})
						.execute();

					count++;
				} catch (err) {
					console.error('❌ Insert failed:', err);
					console.error('Item:', JSON.stringify(item).slice(0, 500));
				}
			}
		}

		const elapsed = Date.now() - startTime;
		log.info(`Synced ${count} ${type} items from ${providerId} in ${elapsed}ms`);
	} catch (err) {
		log.error({ error: err, type, providerId }, 'Sync failed');
		throw err;
	}

	return count;
}

// Extract searchable content from details
function extractSearchableContent(details: Record<string, unknown>): string {
	const parts: string[] = [];

	const addStrings = (arr: unknown) => {
		if (Array.isArray(arr)) {
			for (const item of arr) {
				if (typeof item === 'string') {
					parts.push(item);
				} else if (item && typeof item === 'object') {
					const obj = item as Record<string, unknown>;
					if (obj.desc && typeof obj.desc === 'string') parts.push(obj.desc);
					if (obj.description && typeof obj.description === 'string') parts.push(obj.description);
				}
			}
		}
	};

	const addString = (value: unknown) => {
		if (typeof value === 'string') parts.push(value);
	};

	addString(details.description);
	if (Array.isArray(details.description)) addStrings(details.description);
	if (details.actions) addStrings(details.actions);
	if (details.specialAbilities) addStrings(details.specialAbilities);
	if (details.reactions) addStrings(details.reactions);
	addString(details.higherLevel);
	addString(details.material);

	return parts.join(' ');
}

// Index item in FTS
async function indexInFts(
	db: ReturnType<typeof drizzle>,
	item: typeof schema.compendiumItems.$inferSelect
): Promise<void> {
	const content = extractSearchableContent(item.details as Record<string, unknown>);
	await db.run(
		sql`INSERT OR REPLACE INTO compendium_items_fts(rowid, name, summary, content) VALUES (${item.id}, ${item.name}, ${item.summary ?? ''}, ${content})`
	);
}

// Build FTS index for a type
async function buildFtsForType(db: ReturnType<typeof drizzle>, type: string): Promise<number> {
	const items = await db
		.select()
		.from(schema.compendiumItems)
		.where(eq(schema.compendiumItems.type, type));
	let count = 0;

	for (const item of items) {
		await indexInFts(db, item);
		count++;
	}

	return count;
}

async function main() {
	console.log('🚀 Starting sync...\n');

	// Initialize database
	const dbPath = process.env.DATABASE_URL || 'file:./local.db';
	log.info(`Database: ${dbPath}`);

	const sqlite = new Database(dbPath);
	applyPragmas(sqlite);
	const db = drizzle(sqlite, { schema });

	// Determine types to sync
	const typesToSync = selectedType ? [selectedType] : VALID_TYPES;
	const providersToSync = selectedProvider
		? [PROVIDERS[selectedProvider as keyof typeof PROVIDERS]].filter(Boolean)
		: [PROVIDERS.open5e];

	let totalItems = 0;

	// Sync each provider/type combination
	for (const provider of providersToSync) {
		for (const type of typesToSync) {
			if (provider.types.includes(type as (typeof provider.types)[number])) {
				const endpoint = provider.endpoints[type as keyof typeof provider.endpoints];
				if (endpoint) {
					const count = await syncType(db, type, provider.id, endpoint);
					totalItems += count;
				}
			}
		}
	}

	// Build FTS index for synced items
	log.info('\n🏗️ Building FTS index...');
	for (const type of typesToSync) {
		const ftsCount = await buildFtsForType(db, type);
		log.info(`Indexed ${ftsCount} ${type} items in FTS`);
	}

	console.log('\n✅ Sync complete!');
	console.log(`   Total items synced: ${totalItems}`);

	sqlite.close();
}

main().catch((err) => {
	console.error('❌ Sync failed:', err);
	process.exit(1);
});
