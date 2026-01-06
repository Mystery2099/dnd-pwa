import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createModuleLogger } from '$lib/server/logger';

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
