#!/usr/bin/env bun

import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../src/lib/server/db/schema';
import { initFts, populateFtsFromDatabase } from '../src/lib/server/db/db-fts';

const dbPath = process.env.DATABASE_URL?.trim() || './data/e2e.db';

const sqlite = new Database(dbPath, { create: true });
const db = drizzle(sqlite, { schema });
const now = new Date();

const seededCompendium = [
	{
		key: 'srd_fireball',
		type: 'spells',
		name: 'Fireball',
		source: 'open5e',
		documentKey: 'srd-5-1',
		documentName: 'SRD 5.1',
		gamesystemKey: 'dnd5e',
		gamesystemName: 'D&D 5e',
		publisherKey: 'wotc',
		publisherName: 'Wizards of the Coast',
		description: 'A bright streak flashes to a point you choose, then blossoms with a low roar.',
		data: {
			key: 'srd_fireball',
			name: 'Fireball',
			level: 3,
			school: 'evocation',
			desc: 'A bright streak flashes to a point you choose, then blossoms with a low roar.',
			ritual: false,
			concentration: false,
			document: {
				key: 'srd-5-1',
				name: 'SRD 5.1'
			}
		}
	},
	{
		key: 'srd_magic_missile',
		type: 'spells',
		name: 'Magic Missile',
		source: 'open5e',
		documentKey: 'srd-5-1',
		documentName: 'SRD 5.1',
		gamesystemKey: 'dnd5e',
		gamesystemName: 'D&D 5e',
		publisherKey: 'wotc',
		publisherName: 'Wizards of the Coast',
		description: 'Darts of magical force strike targets you can see.',
		data: {
			key: 'srd_magic_missile',
			name: 'Magic Missile',
			level: 1,
			school: 'evocation',
			desc: 'Darts of magical force strike targets you can see.',
			ritual: false,
			concentration: false,
			document: {
				key: 'srd-5-1',
				name: 'SRD 5.1'
			}
		}
	},
	{
		key: 'srd_cure_wounds',
		type: 'spells',
		name: 'Cure Wounds',
		source: 'open5e',
		documentKey: 'srd-5-1',
		documentName: 'SRD 5.1',
		gamesystemKey: 'dnd5e',
		gamesystemName: 'D&D 5e',
		publisherKey: 'wotc',
		publisherName: 'Wizards of the Coast',
		description: 'A creature you touch regains a number of hit points.',
		data: {
			key: 'srd_cure_wounds',
			name: 'Cure Wounds',
			level: 1,
			school: 'evocation',
			desc: 'A creature you touch regains a number of hit points.',
			ritual: false,
			concentration: false,
			document: {
				key: 'srd-5-1',
				name: 'SRD 5.1'
			}
		}
	},
	{
		key: 'srd_goblin',
		type: 'creatures',
		name: 'Goblin',
		source: 'open5e',
		documentKey: 'srd-5-1',
		documentName: 'SRD 5.1',
		gamesystemKey: 'dnd5e',
		gamesystemName: 'D&D 5e',
		publisherKey: 'wotc',
		publisherName: 'Wizards of the Coast',
		description: 'A small green humanoid that attacks in packs.',
		data: {
			key: 'srd_goblin',
			name: 'Goblin',
			size: 'Small',
			type: 'humanoid',
			alignment: 'neutral evil',
			challenge_rating_text: '1/4',
			desc: 'A small green humanoid that attacks in packs.',
			document: {
				key: 'srd-5-1',
				name: 'SRD 5.1'
			}
		}
	},
	{
		key: 'srd_ancient_red_dragon',
		type: 'creatures',
		name: 'Ancient Red Dragon',
		source: 'open5e',
		documentKey: 'srd-5-1',
		documentName: 'SRD 5.1',
		gamesystemKey: 'dnd5e',
		gamesystemName: 'D&D 5e',
		publisherKey: 'wotc',
		publisherName: 'Wizards of the Coast',
		description: 'A legendary dragon wrapped in smoke and flame.',
		data: {
			key: 'srd_ancient_red_dragon',
			name: 'Ancient Red Dragon',
			size: 'Huge',
			type: 'dragon',
			alignment: 'chaotic evil',
			challenge_rating_text: '24',
			desc: 'A legendary dragon wrapped in smoke and flame.',
			document: {
				key: 'srd-5-1',
				name: 'SRD 5.1'
			}
		}
	}
] satisfies Array<typeof schema.compendium.$inferInsert>;

sqlite.exec(`
	DROP TABLE IF EXISTS compendium_fts;
	DROP TABLE IF EXISTS characters;
	DROP TABLE IF EXISTS sync_metadata;
	DROP TABLE IF EXISTS compendium;
	DROP TABLE IF EXISTS users;

	CREATE TABLE users (
		username text PRIMARY KEY NOT NULL,
		settings text NOT NULL DEFAULT '{}'
	);

	CREATE TABLE compendium (
		key text NOT NULL,
		type text NOT NULL,
		name text NOT NULL,
		source text NOT NULL,
		document_key text,
		document_name text,
		gamesystem_key text,
		gamesystem_name text,
		publisher_key text,
		publisher_name text,
		description text,
		data text NOT NULL,
		created_at integer NOT NULL,
		updated_at integer NOT NULL,
		created_by text,
		PRIMARY KEY(type, key),
		FOREIGN KEY(created_by) REFERENCES users(username)
	);

	CREATE INDEX compendium_type_idx ON compendium(type);
	CREATE INDEX compendium_type_name_idx ON compendium(type, name);
	CREATE INDEX compendium_source_idx ON compendium(source);
	CREATE INDEX compendium_document_idx ON compendium(document_key);
	CREATE INDEX compendium_gamesystem_idx ON compendium(gamesystem_key);
	CREATE INDEX compendium_publisher_idx ON compendium(publisher_key);
	CREATE INDEX compendium_name_idx ON compendium(name);

	CREATE TABLE characters (
		id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		owner text NOT NULL REFERENCES users(username),
		name text NOT NULL,
		portrait_url text,
		stats text NOT NULL DEFAULT '{}',
		inventory text NOT NULL DEFAULT '[]',
		spells text NOT NULL DEFAULT '[]'
	);

	CREATE INDEX characters_owner_idx ON characters(owner);
	CREATE INDEX characters_name_idx ON characters(name);

	CREATE TABLE sync_metadata (
		provider_id text PRIMARY KEY NOT NULL,
		last_sync_at integer,
		item_count integer DEFAULT 0
	);
`);

await db.insert(schema.users).values({
	username: 'test-dm',
	settings: {}
});

await db.insert(schema.characters).values({
	owner: 'test-dm',
	name: 'Playwright Ranger',
	portraitUrl: null,
	stats: { level: 5, class: 'Ranger' },
	inventory: ['Longbow', 'Rations'],
	spells: ["Hunter's Mark"]
});

await db.insert(schema.compendium).values(
	seededCompendium.map((item) => ({
		...item,
		createdBy: null,
		createdAt: now,
		updatedAt: now
	}))
);

await initFts(db);
await populateFtsFromDatabase(db);

sqlite.close();

console.log(`E2E database prepared at ${dbPath}`);
