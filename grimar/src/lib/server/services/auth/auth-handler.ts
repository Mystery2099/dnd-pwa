/**
 * Auth Handler
 *
 * SvelteKit handle hook for authentication middleware.
 * Supports both OAuth2 session-based auth and proxy header auth.
 */

import { type Handle } from '@sveltejs/kit';
import { resolveUser } from './auth-utils';
import { getSession } from '$lib/server/auth/session';
import type { AuthUser } from './auth-types';

const ADMIN_GROUPS = (import.meta.env.ADMIN_GROUPS || '')
	.split(',')
	.map((g) => g.trim().toLowerCase())
	.filter(Boolean);

function getUserRole(groups: string[]): 'user' | 'admin' {
	if (groups.length === 0) return 'user';
	const lowerGroups = groups.map((g) => g.toLowerCase());
	return lowerGroups.some((g) => ADMIN_GROUPS.includes(g)) ? 'admin' : 'user';
}

function createAuthUser(username: string, groups: string[] = []): AuthUser {
	return {
		username,
		settings: {},
		role: getUserRole(groups),
		groups
	};
}

/** Extract groups from Authentik headers */
function getAuthentikGroups(headers: Headers): string[] {
	const groupsHeader = headers.get('x-authentik-groups');
	if (!groupsHeader) return [];
	return groupsHeader.split('|').map((g) => g.trim()).filter(Boolean);
}

/** Authentication middleware hook */
export const handleAuth: Handle = async ({ event, resolve }) => {
	const isDevMode = import.meta.env.DEV;
	const path = event.url.pathname;

	// Development: E2E test authentication via header or cookie
	if (isDevMode) {
		const testUser =
			event.request.headers.get('X-Authentik-Username') || event.cookies.get('test-user');
		if (testUser || path.startsWith('/api/')) {
			const groups = getAuthentikGroups(event.request.headers);
			event.locals.user = createAuthUser(testUser || 'test-dm', groups);
			return resolve(event);
		}
	}

	// Session-based auth (OAuth2)
	const session = getSession(event.cookies);
	if (session) {
		const groups = getAuthentikGroups(event.request.headers);
		event.locals.user = createAuthUser(session.username, groups);
		return resolve(event);
	}

	// Proxy header auth (Traefik → Authentik)
	const result = await resolveUser(event);
	if (result.user) {
		const groups = getAuthentikGroups(event.request.headers);
		event.locals.user = createAuthUser(result.user.username, groups);
	}

	// Redirect unauthenticated requests to non-public paths
	const isPublicPath = path === '/login' || path.startsWith('/auth/') || path.startsWith('/api/');
	if (!event.locals.user && !isPublicPath) {
		return new Response(null, { status: 302, headers: { Location: '/login' } });
	}

	return resolve(event);
};
