import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

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
	return db.query.users.findFirst({
		where: eq(users.username, username)
	});
}

export async function ensureUser(
	db: Db,
	username: string,
	settings: Record<string, unknown> = {}
): Promise<UserRecord> {
	await db.insert(users).values({ username, settings }).onConflictDoNothing();
	const userRow = await getUser(db, username);
	if (userRow) {
		return {
			username: userRow.username,
			settings: normalizeSettings(userRow.settings)
		};
	}

	return { username, settings: normalizeSettings(settings) };
}
