import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Database } from 'bun:sqlite';

// Exercise the real Bun/Drizzle repository against a disposable, representative database.
const directory = mkdtempSync(join(tmpdir(), 'grimar-performance-'));
process.env.DATABASE_URL = join(directory, 'compendium.db');
let sqlite = new Database(process.env.DATABASE_URL);
sqlite.exec(`
	CREATE TABLE users (username TEXT PRIMARY KEY, settings TEXT);
	CREATE TABLE compendium (
		type TEXT NOT NULL, key TEXT NOT NULL, name TEXT NOT NULL, source TEXT NOT NULL,
		description TEXT, data TEXT NOT NULL, document_key TEXT, document_name TEXT,
		gamesystem_key TEXT, gamesystem_name TEXT, publisher_key TEXT, publisher_name TEXT,
		created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, created_by TEXT,
		PRIMARY KEY (type, key)
	);
	CREATE INDEX compendium_type_idx ON compendium(type);
	CREATE INDEX compendium_type_name_idx ON compendium(type, name);
`);

function medianMs(operation: () => void): number {
	const durations: number[] = [];
	for (let i = 0; i < 5; i++) {
		const start = performance.now();
		operation();
		durations.push(performance.now() - start);
	}
	return Number(durations.sort((a, b) => a - b)[2].toFixed(2));
}

const { closeDb, getDb } = await import('../src/lib/server/db/db-connection');
try {
	const insert = sqlite.prepare(`INSERT INTO compendium
		(type, key, name, source, description, data, created_at, updated_at)
		VALUES (?, ?, ?, 'open5e', ?, ?, 1, 1)`);
	sqlite.transaction(() => {
		for (let i = 0; i < 50000; i++) {
			const key = `spell-${String(i).padStart(5, '0')}`;
			insert.run(
				'spells',
				key,
				`Fire Spell ${i}`,
				'Fire magic description.',
				JSON.stringify({ level: i % 10, school: 'evocation', desc: 'x'.repeat(1000) })
			);
		}
		// A shared key catches duplicate-ranked matches without multiplying result rows.
		insert.run('creatures', 'spell-00000', 'Fire Creature', 'Fire magic description.', '{}');
	})();

	const filterCountSql =
		"SELECT count(*) AS count FROM compendium WHERE type='spells' AND json_extract(data, '$.level')=3";
	const unindexedCountMs = medianMs(() => {
		sqlite.query(filterCountSql).get();
	});
	sqlite.exec(
		readFileSync(new URL('../drizzle/0003_compendium_filter_indexes.sql', import.meta.url), 'utf8')
	);
	// Startup upgrades must be idempotent on existing volume-backed databases.
	const { ensureRuntimeDbCompatibility } = await import('./ensure-runtime-db');
	await ensureRuntimeDbCompatibility();
	await ensureRuntimeDbCompatibility();
	const indexedCountMs = medianMs(() => {
		sqlite.query(filterCountSql).get();
	});
	const plan = JSON.stringify(sqlite.query(`EXPLAIN QUERY PLAN ${filterCountSql}`).all());
	assert.match(plan, /compendium_type_spell_level_name_idx/);

	const db = await getDb();
	const { rebuildFtsTable, searchFtsRanked } = await import('../src/lib/server/db/db-fts');
	assert.equal(await rebuildFtsTable(db), 50001);
	const { getPaginatedItems } = await import('../src/lib/server/repositories/compendium');
	const { MemoryCache } = await import('../src/lib/server/utils/cache/memory-cache');
	const { buildCompendiumListResult } = await import('../src/lib/server/services/compendium/list');
	const matches = await searchFtsRanked('fire', 5001, db);
	const keys = matches.slice(0, 5000).map((match) => match.key);
	const placeholders = keys.map(() => '?').join(',');
	const branches = keys.map(() => 'WHEN key = ? THEN ?').join(' ');
	const oldSql = `SELECT key FROM compendium WHERE type='spells' AND key IN (${placeholders}) ORDER BY CASE ${branches} ELSE 5000 END, name LIMIT 50`;
	const oldParams = [...keys, ...keys.flatMap((key, index) => [key, index])];
	const expectedKeys = (sqlite.query(oldSql).all(...oldParams) as { key: string }[]).map(
		(row) => row.key
	);
	const caseRankMs = medianMs(() => {
		sqlite.query(oldSql).all(...oldParams);
	});
	const newRankSql = `SELECT c.key FROM compendium c INNER JOIN
	(SELECT value AS matched_key, MIN(CAST(key AS INTEGER)) AS match_rank FROM json_each(?) GROUP BY value) AS ranked_matches
	ON c.key = ranked_matches.matched_key WHERE c.type='spells' ORDER BY ranked_matches.match_rank, c.name LIMIT 50`;
	const joinRankMs = medianMs(() => {
		sqlite.query(newRankSql).all(JSON.stringify(keys));
	});
	const result = await getPaginatedItems('spells', { pageSize: 50, filters: { search: 'fire' } });
	assert.deepEqual(
		result.items.map((item) => item.key),
		expectedKeys
	);
	assert.equal(result.total, new Set(keys).size);
	assert.equal(result.resultsTruncated, true);
	assert.equal(result.hasMore, true);
	assert.equal(new Set(result.items.map((item) => item.key)).size, 50);

	const filtered = await getPaginatedItems('spells', {
		page: 2,
		pageSize: 13,
		filters: { search: 'fire', spellLevel: 3 }
	});
	assert.equal(filtered.items.length, 13);
	assert.ok(filtered.items.every((item) => item.data.level === 3));
	assert.equal(
		filtered.total,
		keys.filter((key, index) => keys.indexOf(key) === index && Number(key.slice(-5)) % 10 === 3)
			.length
	);
	const empty = await getPaginatedItems('spells', { filters: { search: 'unfindableword' } });
	assert.equal(empty.total, 0);
	assert.equal(empty.items.length, 0);
	await assert.rejects(getPaginatedItems('spells', { pageSize: -1 }), RangeError);

	// An absent index must still take the existing LIKE fallback path.
	await closeDb();
	sqlite.close();
	sqlite = new Database(process.env.DATABASE_URL);
	sqlite.exec('DROP TABLE compendium_fts');
	MemoryCache.getInstance().clear();
	const fallback = await getPaginatedItems('spells', {
		pageSize: 5,
		filters: { search: 'fire', spellLevel: 3 }
	});
	assert.equal(fallback.total, 5000);
	assert.equal(fallback.items.length, 5);
	assert.ok(fallback.items.every((item) => item.data.level === 3));

	const fullBytes = Buffer.byteLength(JSON.stringify(buildCompendiumListResult(result)));
	const summaryBytes = Buffer.byteLength(
		JSON.stringify(buildCompendiumListResult(result, { summary: true }))
	);
	assert.ok(summaryBytes < fullBytes / 2);
	console.log(
		JSON.stringify(
			{
				rows: 50001,
				repeats: 5,
				caseRankMs,
				joinRankMs,
				unindexedCountMs,
				indexedCountMs,
				fullListBytes: fullBytes,
				summaryListBytes: summaryBytes,
				queryPlan: JSON.parse(plan)
			},
			null,
			2
		)
	);
	console.log(
		'Database ranking, filtering, pagination, fallback, migration, and response checks passed.'
	);
} finally {
	await closeDb();
	sqlite.close();
	rmSync(directory, { recursive: true, force: true });
}
