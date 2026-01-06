/**
 * Auth Guard
 *
 * Guard helper for protecting routes.
 */

import { redirect } from '@sveltejs/kit';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('AuthGuard');
import type { AuthUser } from './auth-types';

export type { AuthUser } from './auth-types';

/**
 * Guard helper - throws redirect when unauthenticated.
 * Use in server load/actions to protect routes.
 */
export function requireUser(locals: App.Locals): AuthUser {
	if (!locals.user) {
		log.warn('Unauthenticated access attempt, redirecting to home');
		throw redirect(302, '/');
	}
	log.debug({ username: locals.user.username }, 'User authenticated successfully');
	return locals.user as AuthUser;
}
