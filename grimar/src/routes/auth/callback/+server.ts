import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSession, destroySession } from '$lib/server/auth/session';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('AuthCallback');

/**
 * GET /auth/callback
 * Handles Authentik OAuth2 callback
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorParam = url.searchParams.get('error');

	// Handle error from Authentik
	if (errorParam) {
		log.error(
			{ error: errorParam, description: url.searchParams.get('error_description') },
			'Authentik authentication error'
		);
		throw error(401, 'Authentication failed');
	}

	// Validate required params
	if (!code || !state) {
		throw error(400, 'Missing authorization code or state');
	}

	// Validate state (CSRF protection)
	const storedState = cookies.get('oauth_state');
	cookies.delete('oauth_state', { path: '/' });

	if (!storedState || storedState !== state) {
		throw error(401, 'Invalid state parameter - possible CSRF attack');
	}

	// Get Authentik configuration
	const authentikUrl = process.env.AUTHENTIK_URL || 'https://authentik.mathewtech.us';
	const clientId = process.env.AUTHENTIK_CLIENT_ID;
	const clientSecret = process.env.AUTHENTIK_CLIENT_SECRET;
	const redirectUri = process.env.AUTHENTIK_REDIRECT_URI || `${url.origin}/auth/callback`;

	if (!clientId || !clientSecret) {
		throw error(500, 'Authentik not configured');
	}

	try {
		// Token exchange
		const tokenResponse = await fetch(`${authentikUrl}/application/o/token/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri
			})
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			log.error({ errorText }, 'Token exchange failed');
			throw error(401, 'Failed to exchange authorization code');
		}

		const tokenData = await tokenResponse.json();

		// Fetch user info
		const userInfoResponse = await fetch(`${authentikUrl}/application/o/userinfo/`, {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`
			}
		});

		if (!userInfoResponse.ok) {
			log.error({}, 'Failed to fetch user info');
			throw error(401, 'Failed to fetch user info');
		}

		const userInfo = await userInfoResponse.json();

		// Create session
		const userId = userInfo.sub;
		const username = userInfo.preferred_username || userInfo.name || userInfo.email || userId;
		const email = userInfo.email;
		const name = userInfo.name;

		// Destroy any existing session first
		destroySession(cookies);

		// Create new session
		createSession(cookies, userId, username, email, name);

		// Get redirect URL
		const redirectTo = cookies.get('auth_redirect') || '/dashboard';
		cookies.delete('auth_redirect', { path: '/' });

		throw redirect(302, redirectTo);
	} catch (err) {
		// Allow SvelteKit redirects to pass through (don't treat them as errors)
		// SvelteKit's redirect() throws an object with 'location' and 'status' properties
		if (typeof err === 'object' && err !== null && 'location' in err) {
			throw err;
		}
		log.error({ error: err }, 'Authentication callback failed');
		throw error(500, 'Authentication failed');
	}
};
