/**
 * Database Configuration
 *
 * SQLite PRAGMA settings for performance optimization.
 */

export const DB_CONFIG = {
	journalMode: 'WAL' as const,
	synchronous: 'NORMAL' as const,
	cacheSize: 10000,
	tempStore: 'MEMORY' as const,
	busyTimeout: 30000
};

/**
 * Apply SQLite PRAGMA optimizations to a database connection
 */
export function applyPragmas(client: { exec: (sql: string) => void }) {
	client.exec(`PRAGMA journal_mode = ${DB_CONFIG.journalMode};`);
	client.exec(`PRAGMA synchronous = ${DB_CONFIG.synchronous};`);
	client.exec(`PRAGMA cache_size = ${DB_CONFIG.cacheSize};`);
	client.exec(`PRAGMA temp_store = ${DB_CONFIG.tempStore};`);
	client.exec(`PRAGMA busy_timeout = ${DB_CONFIG.busyTimeout};`);
}
