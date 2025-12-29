/**
 * Auth Guard
 *
 * Guard helper for protecting routes.
 */

import { redirect } from '@sveltejs/kit';
import type { AuthUser } from './auth-types';

export type { AuthUser } from './auth-types';

/**
 * Guard helper - throws redirect when unauthenticated.
 * Use in server load/actions to protect routes.
 */
export function requireUser(locals: App.Locals): AuthUser {
	if (!locals.user) {
		throw redirect(302, '/');
	}
	return locals.user as AuthUser;
}
