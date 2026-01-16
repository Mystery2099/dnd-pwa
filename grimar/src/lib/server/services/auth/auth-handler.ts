/**
 * Auth Handler
 *
 * SvelteKit handle hook for authentication middleware.
 * Supports both OAuth2 session-based auth and proxy header auth.
 */

import { type Handle } from '@sveltejs/kit';
import { resolveUser } from './auth-utils';
import { getSession } from '$lib/server/auth/session';

/** Authentication middleware hook */
export const handleAuth: Handle = async ({ event, resolve }) => {
	const isDevMode = import.meta.env.DEV;
	const path = event.url.pathname;

	// Development: E2E test authentication via header or cookie
	if (isDevMode) {
		const testUser =
			event.request.headers.get('X-Authentik-Username') || event.cookies.get('test-user');
		if (testUser || path.startsWith('/api/')) {
			event.locals.user = { username: testUser || 'test-dm', settings: {} };
			return resolve(event);
		}
	}

	// Session-based auth (OAuth2)
	const session = getSession(event.cookies);
	if (session) {
		event.locals.user = { username: session.username, settings: {} };
		return resolve(event);
	}

	// Proxy header auth (Traefik → Authentik)
	const result = await resolveUser(event);
	if (result.user) {
		event.locals.user = result.user;
	}

	// Redirect unauthenticated requests to non-public paths
	const isPublicPath = path === '/login' || path.startsWith('/auth/') || path.startsWith('/api/');
	if (!event.locals.user && !isPublicPath) {
		return new Response(null, { status: 302, headers: { Location: '/login' } });
	}

	return resolve(event);
};
