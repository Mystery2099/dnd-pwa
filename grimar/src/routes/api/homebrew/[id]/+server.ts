import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { getHomebrewItemByKey, updateHomebrewItem, deleteHomebrewItem } from '$lib/server/repositories/compendium';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = requireUser(locals);
	const item = await getHomebrewItemByKey(params.id);
	
	if (!item || item.source !== 'homebrew') {
		return json({ error: 'Item not found' }, { status: 404 });
	}
	
	if (user.role !== 'admin' && item.createdBy !== user.username) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}
	
	return json(item);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const user = requireUser(locals);
	const data = await request.json();
	
	const item = await updateHomebrewItem(
		params.id,
		{
			name: data.name,
			description: data.description,
			data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data
		},
		user.username,
		user.role
	);
	
	if (!item) {
		return json({ error: 'Item not found or unauthorized' }, { status: 404 });
	}
	
	return json(item);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = requireUser(locals);
	const deleted = await deleteHomebrewItem(params.id, user.username, user.role);
	
	if (!deleted) {
		return json({ error: 'Item not found or unauthorized' }, { status: 404 });
	}
	
	return json({ success: true });
};
