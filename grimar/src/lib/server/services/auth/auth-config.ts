import { env as privateEnv } from '$env/dynamic/private';

export function getAuthentikUrl(): string {
	return privateEnv.AUTHENTIK_URL?.trim() || 'https://authentik.mathewtech.us';
}

export function getAuthentikClientId(): string {
	return privateEnv.AUTHENTIK_CLIENT_ID?.trim() || 'grimar';
}

export function getAuthentikClientSecret(): string | undefined {
	return privateEnv.AUTHENTIK_CLIENT_SECRET?.trim() || undefined;
}

export function getAuthentikRedirectUri(url: URL): string {
	return privateEnv.AUTHENTIK_REDIRECT_URI?.trim() || `${url.origin}/auth/callback`;
}

export function getAdminGroups(): string[] {
	return (process.env.ADMIN_GROUPS || '')
		.split(',')
		.map((group) => group.trim().toLowerCase())
		.filter(Boolean);
}

export function isDevTestAuthBypassEnabled(): boolean {
	return process.env.DEV_TEST_AUTH_BYPASS === 'true';
}
