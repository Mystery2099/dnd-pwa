import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createModuleLogger } from '$lib/server/logger';
import { DEFAULT_SERVER_SETTINGS, type ServerSettings } from '$lib/core/client/settings';

const log = createModuleLogger('UserRepository');

export type UserRecord = {
	username: string;
	settings: Record<string, unknown>;
};

function normalizeSettings(settings: unknown): Record<string, unknown> {
	if (settings && typeof settings === 'object' && !Array.isArray(settings)) {
		return settings as Record<string, unknown>;
	}
	return {};
}

export async function getUser(db: Db, username: string) {
	log.debug({ username }, 'Fetching user');
	return db.query.users.findFirst({
		where: eq(users.username, username)
	});
}

export async function ensureUser(
	db: Db,
	username: string,
	settings: Record<string, unknown> = {}
): Promise<UserRecord> {
	log.debug({ username }, 'Ensuring user exists');
	await db.insert(users).values({ username, settings }).onConflictDoNothing();
	const userRow = await getUser(db, username);
	if (userRow) {
		log.debug({ username }, 'User found in database');
		return {
			username: userRow.username,
			settings: normalizeSettings(userRow.settings)
		};
	}

	log.warn({ username }, 'User not found after insert attempt');
	return { username, settings: normalizeSettings(settings) };
}

/**
 * Get user's server settings, returning defaults if not found
 */
export async function getUserSettings(db: Db, username: string): Promise<ServerSettings> {
	log.debug({ username }, 'Fetching user settings');
	const userRow = await db.query.users.findFirst({
		where: eq(users.username, username)
	});

	if (!userRow) {
		log.debug({ username }, 'User not found, returning defaults');
		return DEFAULT_SERVER_SETTINGS;
	}

	const normalized = normalizeSettings(userRow.settings);
	return { ...DEFAULT_SERVER_SETTINGS, ...normalized };
}

/**
 * Update user's server settings (partial update - merges with existing)
 */
export async function updateUserSettings(
	db: Db,
	username: string,
	partial: Partial<ServerSettings>
): Promise<ServerSettings> {
	log.debug({ username, keys: Object.keys(partial) }, 'Updating user settings');

	// Fetch current settings
	const current = await getUserSettings(db, username);

	// Merge with partial update
	const merged: ServerSettings = { ...current, ...partial };

	// Save to database
	await db.update(users).set({ settings: merged }).where(eq(users.username, username));

	log.debug({ username }, 'Settings updated');
	return merged;
}

/**
 * Ensure user settings exist with defaults
 */
export async function ensureUserSettings(db: Db, username: string): Promise<ServerSettings> {
	log.debug({ username }, 'Ensuring user settings exist');
	await db
		.insert(users)
		.values({ username, settings: DEFAULT_SERVER_SETTINGS })
		.onConflictDoNothing();
	return getUserSettings(db, username);
}
