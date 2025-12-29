/**
 * Migration Script: Details to Files
 *
 * Moves heavy JSON data from the 'details' column to external JSON files.
 * Populates the 'jsonPath' column for existing items.
 */

import { getDb } from '../src/lib/server/db';
import { compendiumItems } from '../src/lib/server/db/schema';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { eq, sql } from 'drizzle-orm';

const DATA_ROOT = 'data/compendium';

async function migrate() {
	console.log('🚀 Starting details-to-files migration...');
	const db = await getDb();

	const items = await db.select().from(compendiumItems);
	console.log(`📦 Found ${items.length} items to process`);

	let migratedCount = 0;
	let errorCount = 0;

	for (const item of items) {
		try {
			const typeDir = join(process.cwd(), DATA_ROOT, item.type);
			if (!existsSync(typeDir)) {
				mkdirSync(typeDir, { recursive: true });
			}

			const fileName = `${item.externalId || item.id}.json`;
			const relativePath = join(DATA_ROOT, item.type, fileName);
			const fullPath = join(process.cwd(), relativePath);

			// Write details to file
			writeFileSync(fullPath, JSON.stringify(item.details, null, 2));

			// Update DB with jsonPath
			await db
				.update(compendiumItems)
				.set({ jsonPath: relativePath })
				.where(eq(compendiumItems.id, item.id));

			migratedCount++;
			if (migratedCount % 100 === 0) {
				console.log(`✅ Processed ${migratedCount} items...`);
			}
		} catch (error) {
			console.error(`❌ Failed to migrate item ${item.id}:`, error);
			errorCount++;
		}
	}

	console.log('\n✨ Migration complete!');
	console.log(`📊 Summary:
   - Success: ${migratedCount}
   - Errors: ${errorCount}`);
}

// Note: This script requires a proper environment to run.
// Use 'bun vitest run src/test/integration/migrate.test.ts' pattern if needed.
// migrate().catch(console.error);
