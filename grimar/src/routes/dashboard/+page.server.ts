import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/services/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	return {
		user: { username: user.username }
	};
};
