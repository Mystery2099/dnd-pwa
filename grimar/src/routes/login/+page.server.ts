import type { PageServerLoad } from './$types';
import { getAuthentikRedirectUri, getAuthentikUrl } from '$lib/server/services/auth/auth-config';

export const load: PageServerLoad = async ({ url }) => ({
	authentikUrl: getAuthentikUrl(),
	redirectUri: getAuthentikRedirectUri(url)
});
