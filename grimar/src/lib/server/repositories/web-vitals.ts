import { sql } from 'drizzle-orm';
import { getDb } from '$lib/server/db';

export interface WebVitalMetric {
	name: string;
	value: number;
	rating?: string;
	pathname?: string;
	navigationType?: string;
	clientTimestamp?: number;
}

const MAX_QUEUE_SIZE = 2000;
const queue: WebVitalMetric[] = [];
let tableInitialized = false;
let initializedDb: Awaited<ReturnType<typeof getDb>> | null = null;

async function ensureTable(): Promise<Awaited<ReturnType<typeof getDb>>> {
	const db = await getDb();
	if (tableInitialized && initializedDb === db) return db;
	await db.run(sql`
		CREATE TABLE IF NOT EXISTS web_vitals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			value REAL NOT NULL,
			rating TEXT,
			pathname TEXT,
			navigation_type TEXT,
			client_timestamp INTEGER,
			recorded_at INTEGER NOT NULL
		)
	`);
	await db.run(sql`CREATE INDEX IF NOT EXISTS web_vitals_name_idx ON web_vitals(name)`);
	await db.run(
		sql`CREATE INDEX IF NOT EXISTS web_vitals_recorded_at_idx ON web_vitals(recorded_at)`
	);
	tableInitialized = true;
	initializedDb = db;
	return db;
}

async function writeWebVital(metric: WebVitalMetric): Promise<void> {
	const db = await ensureTable();
	await db.run(sql`
		INSERT INTO web_vitals (
			name,
			value,
			rating,
			pathname,
			navigation_type,
			client_timestamp,
			recorded_at
		)
		VALUES (
			${metric.name},
			${metric.value},
			${metric.rating ?? null},
			${metric.pathname ?? null},
			${metric.navigationType ?? null},
			${metric.clientTimestamp ?? null},
			${Date.now()}
		)
	`);
}

function enqueue(metric: WebVitalMetric): void {
	if (queue.length >= MAX_QUEUE_SIZE) {
		queue.shift();
	}
	queue.push(metric);
}

export async function persistWebVital(metric: WebVitalMetric): Promise<void> {
	try {
		await writeWebVital(metric);
	} catch (error) {
		enqueue(metric);
		throw error;
	}
}

export async function flushQueuedWebVitals(): Promise<{ flushed: number; remaining: number }> {
	if (queue.length === 0) {
		return { flushed: 0, remaining: 0 };
	}

	const pending = queue.splice(0, queue.length);
	let flushed = 0;
	for (const [index, metric] of pending.entries()) {
		try {
			await writeWebVital(metric);
			flushed += 1;
		} catch {
			enqueue(metric);
			for (const remainingMetric of pending.slice(index + 1)) {
				enqueue(remainingMetric);
			}
			break;
		}
	}

	return { flushed, remaining: queue.length };
}

export function getQueuedWebVitalCount(): number {
	return queue.length;
}
