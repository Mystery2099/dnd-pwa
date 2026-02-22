import { eq } from 'drizzle-orm';
import { compendiumItems } from './src/lib/server/db/schema';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const sqlite = new Database('local.db');
const db = drizzle(sqlite);

async function main() {
	// Check distinct types
	const types = await db
		.select({ type: compendiumItems.type })
		.from(compendiumItems)
		.groupBy(compendiumItems.type);

	console.log('Types in database:');
	for (const t of types) {
		console.log(`  ${t.type}`);
	}

	// Check specific new types
	const newTypes = [
		'alignment',
		'skill',
		'language',
		'proficiency',
		'abilityScore',
		'damageType',
		'magicSchool'
	];
	for (const type of newTypes) {
		const count = await db.$count(compendiumItems, eq(compendiumItems.type, type));
		console.log(`${type}: ${count} records`);
	}
}

main().catch(console.error);
