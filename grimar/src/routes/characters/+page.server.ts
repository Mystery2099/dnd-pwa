import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/services/auth/service';
import { listUserCharacters } from '$lib/server/services/characters/service';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);

	const userCharacters = await listUserCharacters(user.username);

	return {
		characters: userCharacters
	};
};
