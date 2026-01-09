import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Database } from 'bun:sqlite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const dbPath = join(projectRoot, 'local.db');

console.log('Seeding test database with minimal data...');

const sqlite = new Database(dbPath);

// Create tables directly (full schema)
sqlite.exec(`
	CREATE TABLE IF NOT EXISTS users (
		username text PRIMARY KEY NOT NULL,
		settings text NOT NULL DEFAULT ('{}')
	);

	CREATE TABLE IF NOT EXISTS compendium_items (
		id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		source text NOT NULL,
		type text NOT NULL,
		external_id text,
		name text NOT NULL,
		summary text,
		details text NOT NULL,
		json_path text,
		spell_level integer,
		spell_school text,
		challenge_rating text,
		monster_size text,
		monster_type text,
		class_hit_die integer,
		race_size text,
		race_speed integer,
		background_feature text,
		background_skill_proficiencies text,
		feat_prerequisites text,
		created_by text REFERENCES users(username)
	);

	CREATE UNIQUE INDEX IF NOT EXISTS compendium_items_external ON compendium_items (type, source, external_id);
	CREATE INDEX IF NOT EXISTS compendium_items_type_idx ON compendium_items (type);
	CREATE INDEX IF NOT EXISTS compendium_items_name_idx ON compendium_items (name);
	CREATE INDEX IF NOT EXISTS compendium_items_type_name_idx ON compendium_items (type, name);
	CREATE INDEX IF NOT EXISTS compendium_items_created_by_idx ON compendium_items (created_by);
	CREATE INDEX IF NOT EXISTS compendium_items_spell_level_idx ON compendium_items (spell_level);
	CREATE INDEX IF NOT EXISTS compendium_items_spell_school_idx ON compendium_items (spell_school);
	CREATE INDEX IF NOT EXISTS compendium_items_type_level_school_idx ON compendium_items (type, spell_level, spell_school);
	CREATE INDEX IF NOT EXISTS compendium_items_challenge_rating_idx ON compendium_items (challenge_rating);
	CREATE INDEX IF NOT EXISTS compendium_items_monster_size_idx ON compendium_items (monster_size);
	CREATE INDEX IF NOT EXISTS compendium_items_monster_type_idx ON compendium_items (monster_type);
	CREATE INDEX IF NOT EXISTS compendium_items_class_hit_die_idx ON compendium_items (class_hit_die);
	CREATE INDEX IF NOT EXISTS compendium_items_race_size_idx ON compendium_items (race_size);
	CREATE INDEX IF NOT EXISTS compendium_items_background_feature_idx ON compendium_items (background_feature);
	CREATE INDEX IF NOT EXISTS compendium_items_feat_prerequisites_idx ON compendium_items (feat_prerequisites);

	CREATE TABLE IF NOT EXISTS characters (
		id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
		owner text NOT NULL REFERENCES users(username),
		name text NOT NULL,
		portrait_url text,
		stats text NOT NULL DEFAULT ('{}'),
		inventory text NOT NULL DEFAULT ('[]'),
		spells text NOT NULL DEFAULT ('[]')
	);
	CREATE INDEX IF NOT EXISTS characters_owner_idx ON characters (owner);
	CREATE INDEX IF NOT EXISTS characters_name_idx ON characters (name);

	-- Compendium cache for replay/resync
	CREATE TABLE IF NOT EXISTS compendium_cache (
		id text PRIMARY KEY NOT NULL,
		type text NOT NULL,
		data text NOT NULL
	);
	CREATE INDEX IF NOT EXISTS compendium_cache_type_idx ON compendium_cache (type);

	-- Sync metadata
	CREATE TABLE IF NOT EXISTS sync_metadata (
		provider_id text PRIMARY KEY NOT NULL,
		last_sync_at integer,
		last_sync_type text,
		items_synced integer DEFAULT 0
	);
	CREATE INDEX IF NOT EXISTS sync_metadata_provider_id_idx ON sync_metadata (provider_id);
`);

console.log('Schema created.');

// Insert minimal test data
const insertSql = `
	INSERT INTO compendium_items (source, type, name, summary, details, spell_level, spell_school, json_path, challenge_rating, monster_size, monster_type, class_hit_die, race_size, race_speed, background_feature, background_skill_proficiencies, feat_prerequisites)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const testItems = [
	[
		'srd',
		'spell',
		'Fireball',
		'A bright streak flashes from your pointing finger',
		'{"level":3,"school":"evocation","description":"Fireball spell details"}',
		3,
		'evocation',
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null
	],
	[
		'srd',
		'spell',
		'Magic Missile',
		'Three glowing darts of magical force',
		'{"level":1,"school":"evocation","description":"Magic Missile spell details"}',
		1,
		'evocation',
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null
	],
	[
		'srd',
		'spell',
		'Cure Wounds',
		'A creature you touch regains hit points',
		'{"level":1,"school":"evocation","description":"Cure Wounds spell details"}',
		1,
		'evocation',
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null
	],
	[
		'srd',
		'monster',
		'Goblin',
		'Small humanoid (goblinoid)',
		'{"challengeRating":"1/4","size":"Small","type":"humanoid","description":"Goblin details"}',
		null,
		null,
		null,
		'1/4',
		'Small',
		'humanoid',
		null,
		null,
		null,
		null,
		null,
		null
	],
	[
		'srd',
		'monster',
		'Ancient Red Dragon',
		'Huge dragon (chromatic)',
		'{"challengeRating":"24","size":"Huge","type":"dragon","description":"Ancient Red Dragon details"}',
		null,
		null,
		null,
		'24',
		'Huge',
		'dragon',
		null,
		null,
		null,
		null,
		null,
		null
	]
];

for (const item of testItems) {
	try {
		sqlite.prepare(insertSql).run(...item);
		console.log(`Inserted: ${item[2]} (${item[1]})`);
	} catch (error) {
		console.log(`Error inserting ${item[2]}: ${error.message}`);
	}
}

sqlite.close();
console.log('\nSeeding complete!');
console.log(`Database: ${dbPath}`);
