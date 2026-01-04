interface ActivityStats {
	recentlyViewed: Array<{ itemType: string; itemId: string; timestamp: number }>;
	frequentlyAccessed: Array<{ itemType: string; itemId: string; count: number }>;
	searchHistory: Array<{ query: string; timestamp: number; resultCount?: number }>;
	bookmarks: Array<{ itemType: string; itemId: string; timestamp: number }>;
}

// Database client interface (unified for Bun and better-sqlite3)
interface DbClient {
	exec(sql: string): void;
	prepare(sql: string): {
		run(...params: unknown[]): { changes?: number };
		all(...params: unknown[]): unknown[];
	};
}

// Get database client based on runtime
async function getDbClient(): Promise<DbClient> {
	const isBun = typeof (globalThis as unknown as { Bun?: unknown }).Bun !== 'undefined';

	if (isBun) {
		const { Database } = await import('bun:sqlite');
		return new Database(process.env.DATABASE_URL || 'local.db') as unknown as DbClient;
	} else {
		const BetterSqlite3Database = await import('better-sqlite3');
		return new BetterSqlite3Database.default(
			process.env.DATABASE_URL || 'local.db'
		) as unknown as DbClient;
	}
}

// SQL queries (shared between both database backends)
const SQL_QUERIES = {
	createTable: `
		CREATE TABLE IF NOT EXISTS user_activity (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL,
			item_type TEXT NOT NULL,
			item_id TEXT NOT NULL,
			action TEXT NOT NULL CHECK(action IN ('view', 'search', 'bookmark')),
			timestamp INTEGER NOT NULL,
			metadata TEXT,
			created_at INTEGER DEFAULT (strftime('%s', 'now'))
		)
	`,
	createIndexes: `
		CREATE INDEX IF NOT EXISTS idx_user_activity_username ON user_activity(username);
		CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity(timestamp);
		CREATE INDEX IF NOT EXISTS idx_user_activity_item ON user_activity(item_type, item_id);
		CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
	`,
	recentViews: `
		SELECT DISTINCT item_type, item_id, MAX(timestamp) as timestamp
		FROM user_activity
		WHERE username = ? AND action = 'view' AND timestamp > ?
		GROUP BY item_type, item_id
		ORDER BY timestamp DESC
		LIMIT 20
	`,
	frequentAccess: `
		SELECT item_type, item_id, COUNT(*) as count
		FROM user_activity
		WHERE username = ? AND action IN ('view', 'bookmark') AND timestamp > ?
		GROUP BY item_type, item_id
		ORDER BY count DESC
		LIMIT 20
	`,
	searchHistory: `
		SELECT item_id as query, timestamp, metadata
		FROM user_activity
		WHERE username = ? AND action = 'search' AND timestamp > ?
		ORDER BY timestamp DESC
		LIMIT 10
	`,
	bookmarks: `
		SELECT item_type, item_id, timestamp
		FROM user_activity
		WHERE username = ? AND action = 'bookmark' AND timestamp > ?
		ORDER BY timestamp DESC
	`,
	insertActivity: `
		INSERT INTO user_activity (username, item_type, item_id, action, timestamp, metadata)
		VALUES (?, ?, ?, ?, ?, ?)
	`,
	deleteOld: `DELETE FROM user_activity WHERE timestamp < ?`
};

export class ActivityTracker {
	private static instance: ActivityTracker;
	private db: DbClient | null = null;

	static getInstance(): ActivityTracker {
		if (!ActivityTracker.instance) {
			ActivityTracker.instance = new ActivityTracker();
		}
		return ActivityTracker.instance;
	}

	private async getDatabase() {
		if (!this.db) {
			this.db = await getDbClient();
		}
		return this.db;
	}

	// Initialize activity tracking tables
	async initialize(): Promise<void> {
		try {
			const client = await this.getDatabase();

			client.exec(SQL_QUERIES.createTable);
			client.exec(SQL_QUERIES.createIndexes);

			console.log('[ACTIVITY] Activity tracking initialized');
		} catch (error) {
			console.error('[ACTIVITY] Failed to initialize activity tracking:', error);
		}
	}

	// Record user activity
	async trackActivity(
		username: string,
		itemType: string,
		itemId: string,
		action: 'view' | 'search' | 'bookmark',
		metadata?: Record<string, unknown>
	): Promise<void> {
		try {
			const client = await this.getDatabase();
			const now = Date.now();

			client
				.prepare(SQL_QUERIES.insertActivity)
				.run(username, itemType, itemId, action, now, metadata ? JSON.stringify(metadata) : null);

			console.log(`[ACTIVITY] Tracked ${action} for ${username}: ${itemType}:${itemId}`);
		} catch (error) {
			console.error('[ACTIVITY] Failed to track activity:', error);
		}
	}

	// Get user activity stats for search ranking
	async getUserStats(username: string): Promise<ActivityStats> {
		try {
			const client = await this.getDatabase();
			const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

			// Get recently viewed items (last 7 days)
			const recentResults = client
				.prepare(SQL_QUERIES.recentViews)
				.all(username, sevenDaysAgo) as Array<{
				item_type: string;
				item_id: string;
				timestamp: number;
			}>;

			const recentlyViewed = recentResults.map((row) => ({
				itemType: row.item_type,
				itemId: row.item_id,
				timestamp: row.timestamp
			}));

			// Get frequently accessed items (last 7 days)
			const frequentResults = client
				.prepare(SQL_QUERIES.frequentAccess)
				.all(username, sevenDaysAgo) as Array<{
				item_type: string;
				item_id: string;
				count: number;
			}>;

			const frequentlyAccessed = frequentResults.map((row) => ({
				itemType: row.item_type,
				itemId: row.item_id,
				count: row.count
			}));

			// Get search history (last 7 days)
			const searchResults = client
				.prepare(SQL_QUERIES.searchHistory)
				.all(username, sevenDaysAgo) as Array<{
				query: string;
				timestamp: number;
				metadata: string | null;
			}>;

			const searchHistory = searchResults.map((row) => ({
				query: row.query,
				timestamp: row.timestamp,
				resultCount: row.metadata ? JSON.parse(row.metadata).resultCount : undefined
			}));

			// Get bookmarks (last 7 days)
			const bookmarkResults = client
				.prepare(SQL_QUERIES.bookmarks)
				.all(username, sevenDaysAgo) as Array<{
				item_type: string;
				item_id: string;
				timestamp: number;
			}>;

			const bookmarks = bookmarkResults.map((row) => ({
				itemType: row.item_type,
				itemId: row.item_id,
				timestamp: row.timestamp
			}));

			return {
				recentlyViewed,
				frequentlyAccessed,
				searchHistory,
				bookmarks
			};
		} catch (error) {
			console.error('[ACTIVITY] Failed to get user stats:', error);
			return {
				recentlyViewed: [],
				frequentlyAccessed: [],
				searchHistory: [],
				bookmarks: []
			};
		}
	}

	// Clean up old activity (older than 7 days)
	async cleanup(): Promise<number> {
		try {
			const client = await this.getDatabase();
			const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

			const result = client.prepare(SQL_QUERIES.deleteOld).run(sevenDaysAgo);
			const deletedCount = (result as { changes?: number }).changes || 0;

			console.log(`[ACTIVITY] Cleaned up ${deletedCount} old activity entries`);
			return deletedCount;
		} catch (error) {
			console.error('[ACTIVITY] Failed to cleanup activity:', error);
			return 0;
		}
	}

	// Schedule daily cleanup
	startCleanupScheduler(): void {
		const scheduleCleanup = () => {
			const now = new Date();
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(3, 0, 0, 0); // 3:00 AM

			const msUntilCleanup = tomorrow.getTime() - now.getTime();

			console.log(`[ACTIVITY] Next cleanup scheduled for ${tomorrow.toISOString()}`);

			setTimeout(async () => {
				try {
					await this.cleanup();
					console.log('[ACTIVITY] Daily cleanup completed successfully');
				} catch (error) {
					console.error('[ACTIVITY] Daily cleanup failed:', error);
				}

				// Schedule next cleanup
				scheduleCleanup();
			}, msUntilCleanup);
		};

		scheduleCleanup();
	}
}

// Singleton instance
export const activityTracker = ActivityTracker.getInstance();
