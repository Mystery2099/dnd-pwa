import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { destroySession } from '$lib/server/auth/session';

/**
 * POST /auth/logout
 * Destroys session and redirects to login page
 */
export const POST: RequestHandler = async ({ cookies }) => {
	destroySession(cookies);
	throw redirect(302, '/login');
};

/**
 * GET /auth/logout (for convenience)
 */
export const GET: RequestHandler = async ({ cookies }) => {
	destroySession(cookies);
	throw redirect(302, '/login');
};
