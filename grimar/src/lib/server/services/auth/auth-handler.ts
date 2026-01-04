/**
 * Auth Handler
 *
 * SvelteKit handle hook for authentication middleware.
 * Supports both OAuth2 session-based auth and proxy header auth.
 */

import { type Handle } from '@sveltejs/kit';
import { resolveUser } from './auth-utils';
import { getSession } from '$lib/server/auth/session';

export { resolveUser } from './auth-utils';

/** Authentication middleware hook */
export const handleAuth: Handle = async ({ event, resolve }) => {
	// Skip auth for API endpoints in development mode
	// This allows E2E tests to run without complex auth setup
	const isApiEndpoint = event.url.pathname.startsWith('/api/');
	const isDevMode = import.meta.env.DEV;

	if (isApiEndpoint && isDevMode) {
		// Set a mock user for API requests in development
		event.locals.user = {
			username: 'test-dm',
			settings: {}
		};
		return resolve(event);
	}

	// Try session-based auth first (OAuth2)
	const session = getSession(event.cookies);
	if (session) {
		event.locals.user = {
			username: session.username,
			settings: {}
		};
		return resolve(event);
	}

	// Fall back to proxy header auth (Traefik → Authentik)
	const result = await resolveUser(event);
	if (result.user) {
		event.locals.user = result.user;
	}

	// Public paths that don't require authentication
	const isPublicPath =
		event.url.pathname === '/login' ||
		event.url.pathname.startsWith('/auth/') ||
		event.url.pathname.startsWith('/api/');

	if (!event.locals.user && !isPublicPath) {
		return new Response(null, { status: 302, headers: { Location: '/login' } });
	}

	return resolve(event);
};
