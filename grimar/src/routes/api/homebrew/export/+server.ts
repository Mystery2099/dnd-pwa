import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { getHomebrewItemByKey } from '$lib/server/repositories/compendium';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireUser(locals);
	const { key } = await request.json();

	const item = await getHomebrewItemByKey(key);

	if (!item || item.source !== 'homebrew') {
		return json({ error: 'Item not found' }, { status: 404 });
	}

	if (user.role !== 'admin' && item.createdBy !== user.username) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const exportedItem = {
		name: item.name,
		type: item.type,
		description: item.description,
		data: item.data,
		exportedAt: new Date().toISOString(),
		version: '1.0'
	};

	return json(exportedItem);
};
