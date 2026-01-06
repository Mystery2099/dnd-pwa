/**
 * Auth Utilities
 *
 * Low-level authentication helper functions.
 */

import { getDb } from '$lib/server/db';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('AuthUtils');
import { ensureUser } from '$lib/server/repositories/users';
import type { AuthResult, AuthUser } from './auth-types';
import type { RequestEvent } from '@sveltejs/kit';

const MOCK_USER = import.meta.env.VITE_MOCK_USER;

/** Read username from authentication header */
export function readAuthHeader(event: RequestEvent): string | null {
	const username = event.request.headers.get('X-Authentik-Username');
	log.debug({ hasUsername: !!username }, 'Read auth header');
	return username;
}

/** Apply development bypass for testing */
export function applyDevBypass(existingUsername: string | null): string | null {
	// Don't bypass in test mode, even if MOCK_USER is set
	if (import.meta.env.MODE === 'test') {
		log.debug({ bypassApplied: false, reason: 'test_mode' }, 'Dev bypass not applied');
		return existingUsername;
	}

	if (!existingUsername && import.meta.env.DEV && MOCK_USER) {
		log.info({ bypassApplied: true, mockUser: MOCK_USER }, 'Dev bypass applied');
		return MOCK_USER;
	}
	log.debug({ bypassApplied: false, reason: 'conditions_not_met' }, 'Dev bypass not applied');
	return existingUsername;
}

/** Upsert user and load their data */
export async function upsertAndLoadUser(username: string): Promise<AuthUser | null> {
	log.debug({ username }, 'Upserting and loading user');
	const db = await getDb();
	const userRow = await ensureUser(db, username);
	if (!userRow) {
		log.warn({ username }, 'Failed to load user after upsert');
		return null;
	}
	log.debug({ username }, 'User loaded successfully');
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
		log.debug({ path: event.url.pathname }, 'No username in request, anonymous access');
		return { user: null };
	}

	const user = await upsertAndLoadUser(username);
	if (!user) {
		log.warn({ username }, 'User resolution failed');
		return { user: null };
	}
	log.info({ username }, 'User resolved successfully');
	return { user };
}
