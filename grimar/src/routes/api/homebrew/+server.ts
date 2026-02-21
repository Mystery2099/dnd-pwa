import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { upsertItem, getUserHomebrewItems } from '$lib/server/repositories/compendium';

export const GET: RequestHandler = async ({ locals }) => {
	const user = requireUser(locals);
	const items = await getUserHomebrewItems(user.username);
	return json(items);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireUser(locals);
	const data = await request.json();
	
	const item = await upsertItem({
		key: data.key || `homebrew-${Date.now()}`,
		type: data.type,
		name: data.name,
		source: 'homebrew',
		description: data.description,
		data: data.data ?? {},
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
