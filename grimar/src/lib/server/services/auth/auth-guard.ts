/**
 * Auth Guard
 *
 * Guard helper for protecting routes.
 */

import { redirect } from '@sveltejs/kit';
import { createModuleLogger } from '$lib/server/logger';
import type { AuthUser } from './auth-types';

const log = createModuleLogger('AuthGuard');

/**
 * Guard helper - throws redirect when unauthenticated.
 * Use in server load/actions to protect routes.
 */
export function requireUser(locals: App.Locals): AuthUser {
	if (!locals.user) {
		log.warn('Unauthenticated access attempt, redirecting to home');
		throw redirect(302, '/');
	}
	return locals.user as AuthUser;
}
