#!/usr/bin/env bun
/**
 * Deduplicate Compendium Items
 *
 * Removes duplicate items keeping only the first occurrence.
 * Handles duplicates by (type, externalId) AND by (source, type, name) for same-name variants.
 */

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { compendiumItems, compendiumCache } from '../src/lib/server/db/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';
import { createModuleLogger } from '../src/lib/server/logger';

const logger = createModuleLogger('DeduplicateCLI');

const DATABASE_URL = process.env.DATABASE_URL || 'local.db';

async function deduplicate() {
	console.log('🔍 Starting deduplication...');

	const client = new Database(DATABASE_URL);
	const db = drizzle(client);

	let totalDeleted = 0;

	// Strategy 1: Remove exact duplicates by (type, externalId) keeping lowest ID
	console.log('\n📋 Step 1: Remove exact (type, externalId) duplicates...');

	// Get all IDs that are NOT the minimum ID for their (type, externalId) group
	const duplicatesToDelete = await db.select({ id: compendiumItems.id }).from(compendiumItems)
		.where(sql`
			${compendiumItems.id} NOT IN (
				SELECT MIN(id)
				FROM compendium_items
				WHERE external_id IS NOT NULL
				GROUP BY type, external_id
			)
			AND ${compendiumItems.externalId} IS NOT NULL
		`);

	if (duplicatesToDelete.length > 0) {
		const idsToDelete = duplicatesToDelete.map((d) => d.id);

		// Delete from compendium_items
		const result = await db
			.delete(compendiumItems)
			.where(inArray(compendiumItems.id, idsToDelete))
			.run();

		totalDeleted += result.changes || 0;
		console.log(`  Removed ${result.changes || 0} exact duplicate items`);
	} else {
		console.log('  No exact duplicates found');
	}

	// Strategy 2: Remove same-name variants from the same source (keep lowest ID per source/type/name)
	console.log('\n📋 Step 2: Remove same-name variants from same source...');

	const sameNameVariants = await db.select({ id: compendiumItems.id }).from(compendiumItems)
		.where(sql`
			${compendiumItems.id} NOT IN (
				SELECT MIN(id)
				FROM compendium_items
				GROUP BY source, type, name
			)
		`);

	if (sameNameVariants.length > 0) {
		const idsToDelete = sameNameVariants.map((d) => d.id);

		const result = await db
			.delete(compendiumItems)
			.where(inArray(compendiumItems.id, idsToDelete))
			.run();

		totalDeleted += result.changes || 0;
		console.log(`  Removed ${result.changes || 0} same-name variant items`);
	} else {
		console.log('  No same-name variants found');
	}

	// Clean up orphaned cache entries
	console.log('\n📋 Step 3: Clean up orphaned cache entries...');

	const orphanedCache = await db.select({ id: compendiumCache.id }).from(compendiumCache).where(sql`
			NOT EXISTS (
				SELECT 1 FROM compendium_items
				WHERE compendium_items.source || ':' || compendium_items.type || ':' || compendium_items.external_id = compendium_cache.id
			)
		`);

	if (orphanedCache.length > 0) {
		const idsToDelete = orphanedCache.map((c) => c.id);

		const result = await db
			.delete(compendiumCache)
			.where(inArray(compendiumCache.id, idsToDelete))
			.run();

		console.log(`  Removed ${result.changes || 0} orphaned cache entries`);
	}

	console.log(`\n✅ Deduplication complete: ${totalDeleted} items removed`);

	// Show remaining counts
	console.log('\n📊 Remaining items per source/type:');
	const counts = await db
		.select({
			source: compendiumItems.source,
			type: compendiumItems.type,
			count: sql<number>`count(*)`
		})
		.from(compendiumItems)
		.groupBy(compendiumItems.source, compendiumItems.type)
		.orderBy(compendiumItems.source, compendiumItems.type);

	for (const c of counts) {
		console.log(`  ${c.source}/${c.type}: ${c.count}`);
	}
}

deduplicate().catch((error) => {
	logger.error({ error }, 'Deduplication failed');
	process.exit(1);
});
