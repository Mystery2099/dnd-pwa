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
import { getAdminGroups, isDevTestAuthBypassEnabled } from './auth-config';

const ADMIN_GROUPS = getAdminGroups();

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
	return groupsHeader
		.split('|')
		.map((g) => g.trim())
		.filter(Boolean);
}

function getDevMockUser(): string | null {
	const username = import.meta.env.VITE_MOCK_USER?.trim();
	return username ? username : null;
}

/** Authentication middleware hook */
export const handleAuth: Handle = async ({ event, resolve }) => {
	const isDevMode = import.meta.env.DEV || import.meta.env.MODE === 'test';
	const path = event.url.pathname;

	if (isDevMode) {
		// Preserve the old local-dev shortcut while still keeping the explicit E2E bypass path.
		const testUser =
			(isDevTestAuthBypassEnabled() &&
				(event.request.headers.get('X-Authentik-Username') || event.cookies.get('test-user'))) ||
			getDevMockUser();
		if (testUser) {
			const groups = getAuthentikGroups(event.request.headers);
			event.locals.user = createAuthUser(testUser, groups);
			return resolve(event);
		}
	}

	// Session-based auth (OAuth2) - use groups from session, not request headers
	const session = getSession(event.cookies);
	if (session) {
		event.locals.user = createAuthUser(session.username, session.groups ?? []);
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
