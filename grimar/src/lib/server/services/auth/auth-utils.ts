/**
 * Auth Utilities
 *
 * Low-level authentication helper functions.
 */

import { getDb } from '$lib/server/db';
import { ensureUser } from '$lib/server/db/repositories/users';
import type { AuthResult, AuthUser } from './auth-types';
import type { RequestEvent } from '@sveltejs/kit';

const MOCK_USER = import.meta.env.VITE_MOCK_USER;

/** Read username from authentication header */
export function readAuthHeader(event: RequestEvent): string | null {
	return event.request.headers.get('X-Authentik-Username');
}

/** Apply development bypass for testing */
export function applyDevBypass(existingUsername: string | null): string | null {
	if (!existingUsername && import.meta.env.DEV && MOCK_USER) {
		return MOCK_USER;
	}
	return existingUsername;
}

/** Upsert user and load their data */
export async function upsertAndLoadUser(username: string): Promise<AuthUser | null> {
	const db = await getDb();
	const userRow = await ensureUser(db, username);
	if (!userRow) return null;
	return {
		username: userRow.username,
		settings: userRow.settings
	};
}

/** Resolve user from request */
export async function resolveUser(event: RequestEvent): Promise<AuthResult> {
	let username = readAuthHeader(event);
	username = applyDevBypass(username);

	if (!username) {
		return { user: null };
	}

	const user = await upsertAndLoadUser(username);
	return { user };
}
