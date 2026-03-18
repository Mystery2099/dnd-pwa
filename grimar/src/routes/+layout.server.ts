import type { LayoutServerLoad } from './$types';
import { getSession } from '$lib/server/auth/session';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const session = getSession(cookies);
	const authUser = locals.user;

	const shellUser =
		session || authUser
			? {
					username: session?.username ?? authUser?.username ?? 'traveler',
					name: session?.name ?? authUser?.username ?? session?.username ?? 'Traveler',
					email: session?.email ?? null,
					role: authUser?.role ?? 'user'
				}
			: null;

	return {
		shellUser
	};
};
