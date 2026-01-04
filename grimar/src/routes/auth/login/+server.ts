import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /auth/login
 * Redirects to Authentik OAuth2 authorize endpoint
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
	const authentikUrl = process.env.AUTHENTIK_URL || 'https://authentik.mathewtech.us';
	const clientId = process.env.AUTHENTIK_CLIENT_ID;
	const redirectUri = process.env.AUTHENTIK_REDIRECT_URI || `${url.origin}/auth/callback`;
	const state = crypto.randomUUID();

	// Store state in cookie for CSRF protection
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 10 // 10 minutes
	});

	// Store redirect URL if provided
	const redirectTo = url.searchParams.get('redirect') || '/dashboard';
	cookies.set('auth_redirect', redirectTo, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 10 // 10 minutes
	});

	// Build authorization URL
	const authUrl = new URL(`${authentikUrl}/application/o/authorize/`);
	authUrl.searchParams.set('client_id', clientId || 'grimar');
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', 'openid profile email');
	authUrl.searchParams.set('state', state);

	throw redirect(302, authUrl.toString());
};
