import type { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DATABASE_URL = process.env.DATABASE_URL ?? 'local.db';

type ColumnInfo = {
	name: string;
	pk: number;
};

function log(message: string): void {
	console.log(`[db-compat] ${message}`);
}

function getColumnInfo(db: Database): ColumnInfo[] {
	return db
		.query(`PRAGMA table_info(compendium)`)
		.all() as Array<{
			name: string;
			pk: number;
		}>;
}

function hasCompositePrimaryKey(columns: ColumnInfo[]): boolean {
	const typeColumn = columns.find((column) => column.name === 'type');
	const keyColumn = columns.find((column) => column.name === 'key');

	return Boolean(typeColumn?.pk && keyColumn?.pk);
}

function hasCompendiumTable(db: Database): boolean {
	const result = db
		.query(
			`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'compendium' LIMIT 1`
		)
		.get() as { name?: string } | null;

	return result?.name === 'compendium';
}

function ensureParentDirectory(): void {
	const directory = dirname(DATABASE_URL);
	if (directory && directory !== '.') {
		mkdirSync(directory, { recursive: true });
	}
}

async function migrateLegacyCompendiumPrimaryKey(db: Database): Promise<void> {
	log('Migrating legacy compendium primary key to (type, key)');

	db.exec('BEGIN IMMEDIATE TRANSACTION;');

	try {
		db.exec(`
			CREATE TABLE compendium__new (
				key TEXT NOT NULL,
				type TEXT NOT NULL,
				name TEXT NOT NULL,
				source TEXT NOT NULL,
				document_key TEXT,
				document_name TEXT,
				gamesystem_key TEXT,
				gamesystem_name TEXT,
				publisher_key TEXT,
				publisher_name TEXT,
				description TEXT,
				data TEXT NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				created_by TEXT,
				PRIMARY KEY (type, key),
				FOREIGN KEY (created_by) REFERENCES users(username) ON UPDATE no action ON DELETE no action
			);
		`);

		db.exec(`
			INSERT INTO compendium__new (
				key,
				type,
				name,
				source,
				document_key,
				document_name,
				gamesystem_key,
				gamesystem_name,
				publisher_key,
				publisher_name,
				description,
				data,
				created_at,
				updated_at,
				created_by
			)
			SELECT
				key,
				type,
				name,
				source,
				document_key,
				document_name,
				gamesystem_key,
				gamesystem_name,
				publisher_key,
				publisher_name,
				description,
				data,
				created_at,
				updated_at,
				created_by
			FROM compendium;
		`);

		db.exec(`DROP TABLE compendium;`);
		db.exec(`ALTER TABLE compendium__new RENAME TO compendium;`);

		db.exec(`CREATE INDEX IF NOT EXISTS compendium_type_idx ON compendium (type);`);
		db.exec(`CREATE INDEX IF NOT EXISTS compendium_type_name_idx ON compendium (type, name);`);
		db.exec(`CREATE INDEX IF NOT EXISTS compendium_source_idx ON compendium (source);`);
		db.exec(`CREATE INDEX IF NOT EXISTS compendium_document_idx ON compendium (document_key);`);
		db.exec(`CREATE INDEX IF NOT EXISTS compendium_gamesystem_idx ON compendium (gamesystem_key);`);
		db.exec(`CREATE INDEX IF NOT EXISTS compendium_publisher_idx ON compendium (publisher_key);`);
		db.exec(`CREATE INDEX IF NOT EXISTS compendium_name_idx ON compendium (name);`);

		db.exec('COMMIT;');
		log('Legacy compendium migration complete');
	} catch (error) {
		db.exec('ROLLBACK;');
		throw error;
	}
}

export async function ensureRuntimeDbCompatibility(): Promise<void> {
	ensureParentDirectory();

	if (!existsSync(DATABASE_URL)) {
		log(`Database does not exist yet at ${DATABASE_URL}, skipping compatibility checks`);
		return;
	}

	const { Database } = await import('bun:sqlite');
	const db = new Database(DATABASE_URL);

	try {
		if (!hasCompendiumTable(db)) {
			log('Compendium table not found, skipping compatibility checks');
			return;
		}

		const columns = getColumnInfo(db);
		if (hasCompositePrimaryKey(columns)) {
			log('Compendium schema already uses composite primary key');
			return;
		}

		await migrateLegacyCompendiumPrimaryKey(db);
	} finally {
		db.close();
	}
}

if (import.meta.main) {
	ensureRuntimeDbCompatibility().catch((error) => {
		console.error('[db-compat] Failed to ensure runtime database compatibility');
		console.error(error);
		process.exit(1);
	});
}
