import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireUser } from '$lib/server/services/auth';
import {
	getHomebrewItemByKey,
	updateHomebrewItem,
	deleteHomebrewItem
} from '$lib/server/repositories/compendium';
import { homebrewItemSchema, type HomebrewItemInput } from '$lib/server/validators/homebrew';

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
	const body = await request.json();

	const parsed = homebrewItemSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
	}

	const validated: HomebrewItemInput = parsed.data;

	const item = await updateHomebrewItem(
		params.id,
		{
			name: validated.name,
			description: validated.summary,
			data: validated.details
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
