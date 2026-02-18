/**
 * Auth Utilities
 *
 * Low-level authentication helper functions.
 */

import { getDb } from '$lib/server/db';
import { createModuleLogger } from '$lib/server/logger';
import { ensureUser } from '$lib/server/repositories/users';
import type { AuthResult, AuthUser } from './auth-types';
import type { RequestEvent } from '@sveltejs/kit';

const log = createModuleLogger('AuthUtils');
const MOCK_USER = import.meta.env.VITE_MOCK_USER;

/** Read username from authentication header */
export function readAuthHeader(event: RequestEvent): string | null {
	return event.request.headers.get('X-Authentik-Username');
}

/** Apply development bypass for testing */
export function applyDevBypass(existingUsername: string | null): string | null {
	if (existingUsername || import.meta.env.MODE === 'test' || !import.meta.env.DEV || !MOCK_USER) {
		return existingUsername;
	}
	log.info({ mockUser: MOCK_USER }, 'Dev bypass applied');
	return MOCK_USER;
}

/** Upsert user and load their data */
export async function upsertAndLoadUser(username: string): Promise<AuthUser | null> {
	const db = await getDb();
	const userRow = await ensureUser(db, username);
	if (!userRow) {
		log.warn({ username }, 'Failed to load user after upsert');
		return null;
	}
	return {
		username: userRow.username,
		settings: userRow.settings,
		role: 'user',
		groups: []
	};
}

/** Resolve user from request */
export async function resolveUser(event: RequestEvent): Promise<AuthResult> {
	const username = applyDevBypass(readAuthHeader(event));
	if (!username) {
		return { user: null };
	}

	const user = await upsertAndLoadUser(username);
	if (!user) {
		log.warn({ username }, 'User resolution failed');
		return { user: null };
	}
	log.info({ username }, 'User resolved');
	return { user };
}

/** Check if user can edit an item (owner or admin) */
export function canEdit(item: { createdBy: string | null }, user: AuthUser): boolean {
	return user.role === 'admin' || item.createdBy === user.username;
}

/** Check if user can delete an item (owner or admin) */
export function canDelete(item: { createdBy: string | null }, user: AuthUser): boolean {
	return canEdit(item, user);
}
