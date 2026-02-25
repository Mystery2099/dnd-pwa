import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { upsertItem, getUserHomebrewItems } from '$lib/server/repositories/compendium';
import { homebrewItemSchema, type HomebrewItemInput } from '$lib/server/validators/homebrew';

export const GET: RequestHandler = async ({ locals }) => {
	const user = requireUser(locals);
	const items = await getUserHomebrewItems(user.username);
	return json(items);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireUser(locals);
	const body = await request.json();

	const parsed = homebrewItemSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
	}

	const validated: HomebrewItemInput = parsed.data;

	const item = await upsertItem({
		key: validated.externalId || `homebrew-${Date.now()}`,
		type: validated.type,
		name: validated.name,
		source: 'homebrew',
		description: validated.summary,
		data: validated.details,
		documentKey: null,
		documentName: null,
		gamesystemKey: null,
		gamesystemName: null,
		publisherKey: null,
		publisherName: null,
		createdBy: user.username
	});

	return json(item);
};
