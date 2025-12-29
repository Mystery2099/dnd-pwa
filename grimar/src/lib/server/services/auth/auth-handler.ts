/**
 * Auth Handler
 *
 * SvelteKit handle hook for authentication middleware.
 */

import { redirect, type Handle } from '@sveltejs/kit';
import { resolveUser } from './auth-utils';

export { resolveUser } from './auth-utils';

/** Authentication middleware hook */
export const handleAuth: Handle = async ({ event, resolve }) => {
	const result = await resolveUser(event);
	if (result.user) {
		event.locals.user = result.user;
	}

	if (!result.user && event.url.pathname !== '/') {
		return new Response(null, { status: 302, headers: { Location: '/' } });
	}

	return resolve(event);
};
