import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { getHomebrewItemById, updateHomebrewItem, deleteHomebrewItem } from '$lib/server/repositories/compendium';
import { canEdit } from '$lib/server/services/auth/auth-utils';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = await getDb();
	const item = await getHomebrewItemById(parseInt(params.id));

	if (!item) {
		return json({ error: 'Item not found' }, { status: 404 });
	}

	if (item.source !== 'homebrew') {
		return json({ error: 'Not a homebrew item' }, { status: 403 });
	}

	return json(item);
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const item = await getHomebrewItemById(parseInt(params.id));

	if (!item) {
		return json({ error: 'Item not found' }, { status: 404 });
	}

	if (!canEdit(item, user)) {
		return json({ error: 'Forbidden: You can only edit your own items' }, { status: 403 });
	}

	const body = await request.json();

	const updated = await updateHomebrewItem(parseInt(params.id), body, user.username, user.role);

	if (!updated) {
		return json({ error: 'Failed to update item' }, { status: 500 });
	}

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const item = await getHomebrewItemById(parseInt(params.id));

	if (!item) {
		return json({ error: 'Item not found' }, { status: 404 });
	}

	if (!canEdit(item, user)) {
		return json({ error: 'Forbidden: You can only delete your own items' }, { status: 403 });
	}

	const deleted = await deleteHomebrewItem(parseInt(params.id), user.username, user.role);

	if (!deleted) {
		return json({ error: 'Failed to delete item' }, { status: 500 });
	}

	return json({ success: true });
};
