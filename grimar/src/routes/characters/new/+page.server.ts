import { fail, redirect, isHttpError } from '@sveltejs/kit';
import type { Actions } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { createSheet } from '$lib/server/services/characters/sheets';
export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = requireUser(locals);
		const form = await request.formData();
		let character;
		try {
			character = await createSheet(user.username, String(form.get('name') || ''));
		} catch (e) {
			if (isHttpError(e) && e.status === 400) return fail(400, { message: e.body.message });
			throw e;
		}
		redirect(303, `/characters/${character.id}`);
	}
};
