/**
 * Debug Logging Utility for Sync Operations
 *
 * Writes detailed sync logs to a file for debugging purposes.
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');
const LOG_FILE = join(LOG_DIR, 'sync-debug.log');

// Ensure logs directory exists
if (!existsSync(LOG_DIR)) {
	mkdirSync(LOG_DIR, { recursive: true });
}

export function logSync(message: string, data?: unknown): void {
	const timestamp = new Date().toISOString();
	const dataStr = data ? JSON.stringify(data, null, 2) : '';
	const line = `[${timestamp}] ${message} ${dataStr}\n`;

	// Write to file (ignore errors)
	createWriteStream(LOG_FILE, { flags: 'a' }).write(line);

	// Also log to console for immediate visibility
	console.log(line.trim());
}

export function logSyncStart(type: string, providerId: string, itemCount: number): void {
	logSync('=== START_SYNC ===', { type, providerId, itemCount });
}

export function logSyncEnd(type: string, count: number, total: number): void {
	const percent = total > 0 ? Math.round((count / total) * 100) : 0;
	logSync('=== END_SYNC ===', { type, count, total, percentComplete: percent });
}

export function logItemStart(index: number, total: number): void {
	logSync(`ITEM_${index}/${total}`);
}

export function logTransformSuccess(type: string, externalId: string, name: string): void {
	logSync('TRANSFORM_SUCCESS', { type, externalId, name });
}

export function logTransformFailed(
	type: string,
	externalId: string,
	error: string,
	sample?: unknown
): void {
	logSync('TRANSFORM_FAILED', { type, externalId, error, sample });
}

export function logInserting(type: string, externalId: string, name: string): void {
	logSync('INSERTING', { type, externalId, name });
}

export function logInsertSuccess(type: string, externalId: string): void {
	logSync('INSERT_SUCCESS', { type, externalId });
}

export function logInsertFailed(type: string, externalId: string, error: string): void {
	logSync('INSERT_FAILED', { type, externalId, error });
}

export function logRawSample(type: string, firstItem: string, totalItems: number): void {
	logSync('RAW_SAMPLE', { type, totalItems, firstItem });
}

export function logSpellFields(fields: Record<string, unknown>): void {
	logSync('SPELL_FIELDS', fields);
}
