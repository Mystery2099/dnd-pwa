/**
 * Settings Page Server Load & Actions
 */

import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getSession } from '$lib/server/auth/session';
import { destroySession } from '$lib/server/auth/session';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = getSession(cookies);

	return {
		user: session
			? {
					username: session.username,
					email: session.email,
					name: session.name,
					createdAt: session.createdAt,
					expiresAt: session.expiresAt
				}
			: null
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		destroySession(cookies);
		throw redirect(302, '/login');
	}
};
