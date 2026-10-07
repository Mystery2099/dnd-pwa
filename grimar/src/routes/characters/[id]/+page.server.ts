import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { loadCharacter } from '$lib/server/services/characters/service';
import {
	characterId,
	revision,
	saveSheet,
	deleteSheet
} from '$lib/server/services/characters/sheets';
import { MAX_SHEET_BYTES } from '$lib/features/characters/rules';
import { readSheet } from '$lib/features/characters/schema';
export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const character = await loadCharacter(characterId(params.id), user.username);
	if (!character) error(404, 'Character not found');
	return { character, sheet: readSheet(character.stats), revision: revision(character.stats) };
};
export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const user = requireUser(locals),
			form = await request.formData();
		const expected = Number(form.get('revision'));
		if (!Number.isSafeInteger(expected) || expected < 0)
			return fail(400, { message: 'Invalid revision.' });
		let payload: unknown;
		try {
			const value = String(form.get('payload') || '');
			if (value.length > MAX_SHEET_BYTES) throw new Error();
			payload = JSON.parse(value);
		} catch {
			return fail(400, { message: 'Invalid character data.' });
		}
		const result = await saveSheet(characterId(params.id), user.username, payload, expected);
		if (result.kind === 'invalid')
			return fail(400, {
				message:
					'Check your sheet: numbers must be whole and within the displayed limits; current resources cannot exceed maximums.'
			});
		if (result.kind === 'conflict')
			return fail(409, {
				message:
					'Another tab or device changed this sheet. Copy your unsaved notes, then reload before saving.'
			});
		return { saved: true, message: 'Character saved.' };
	},
	delete: async ({ locals, params, request }) => {
		const user = requireUser(locals),
			form = await request.formData();
		const expected = Number(form.get('revision'));
		if (!Number.isSafeInteger(expected) || expected < 0)
			return fail(400, { message: 'Invalid revision.' });
		if (!(await deleteSheet(characterId(params.id), user.username, expected)))
			return fail(409, { message: 'Character changed or was deleted. Reload before deleting.' });
		redirect(303, '/characters');
	}
};
