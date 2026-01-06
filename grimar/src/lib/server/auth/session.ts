/**
 * Session Management
 *
 * Cookie-based session handling for OAuth2 authentication.
 */

import type { Cookies } from '@sveltejs/kit';
import { encrypt, decrypt } from '$lib/server/crypto';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SessionService');

const SESSION_COOKIE_NAME = 'grimar_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Session data stored in cookie
 */
export interface SessionData {
	userId: string;
	username: string;
	email?: string;
	name?: string;
	createdAt: number;
	expiresAt: number;
}

/**
 * Create session cookie
 */
export function createSessionCookie(cookies: Cookies, session: SessionData): void {
	const encrypted = encrypt(JSON.stringify(session));
	cookies.set(SESSION_COOKIE_NAME, encrypted, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_MAX_AGE
	});
	log.debug({ userId: session.userId, expiresAt: session.expiresAt }, 'Session cookie created');
}

/**
 * Get session from cookie
 */
export function getSession(cookies: Cookies): SessionData | null {
	const cookie = cookies.get(SESSION_COOKIE_NAME);
	if (!cookie) {
		log.debug('No session cookie found');
		return null;
	}

	try {
		const decrypted = decrypt(cookie);
		const session = JSON.parse(decrypted) as SessionData;

		// Check if session has expired
		if (session.expiresAt < Date.now()) {
			log.debug({ userId: session.userId }, 'Session expired, destroying');
			destroySession(cookies);
			return null;
		}

		log.debug({ userId: session.userId }, 'Session retrieved successfully');
		return session;
	} catch (error) {
		log.warn({ error }, 'Invalid session cookie, destroying');
		// Invalid session - delete cookie
		destroySession(cookies);
		return null;
	}
}

/**
 * Destroy session cookie
 */
export function destroySession(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});
	log.debug('Session cookie destroyed');
}

/**
 * Refresh session expiration
 */
export function refreshSession(cookies: Cookies, session: SessionData): void {
	log.debug({ userId: session.userId }, 'Refreshing session');
	session.expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
	createSessionCookie(cookies, session);
}

/**
 * Create a new session with user data
 */
export function createSession(
	cookies: Cookies,
	userId: string,
	username: string,
	email?: string,
	name?: string
): SessionData {
	const now = Date.now();
	const session: SessionData = {
		userId,
		username,
		email,
		name,
		createdAt: now,
		expiresAt: now + SESSION_MAX_AGE * 1000
	};
	log.info({ userId, username }, 'Creating new session');
	createSessionCookie(cookies, session);
	return session;
}
