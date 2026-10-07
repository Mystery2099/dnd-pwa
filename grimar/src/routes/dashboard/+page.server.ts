import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/services/auth';

import { listUserCharacters } from '$lib/server/services/characters/service';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	return {
		user: { username: user.username },
		characters: await listUserCharacters(user.username)
	};
};
