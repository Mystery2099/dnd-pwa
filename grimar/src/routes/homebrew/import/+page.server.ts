import { json } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return { success: false };
	}

	return {
		user: {
			username: user.username,
			role: user.role
		}
	};
};
