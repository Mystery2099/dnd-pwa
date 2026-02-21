import { json } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { getHomebrewItemByKey, updateHomebrewItem } from '$lib/server/repositories/compendium';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireUser(locals);

	const item = await getHomebrewItemByKey(params.id);

	if (!item || item.source !== 'homebrew') {
		throw new Error('Item not found');
	}

	const canEdit = user.role === 'admin' || item.createdBy === user.username;

	if (!canEdit) {
		throw new Error('You do not have permission to edit this item');
	}

	return {
		item: {
			key: item.key,
			name: item.name,
			type: item.type,
			description: item.description ?? '',
			data: item.data ?? '{}'
		},
		user: {
			username: user.username,
			role: user.role
		}
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const user = requireUser(locals);

		const item = await getHomebrewItemByKey(params.id);

		if (!item || item.source !== 'homebrew') {
			return json({ error: 'Item not found' }, { status: 404 });
		}

		const canEdit = user.role === 'admin' || item.createdBy === user.username;

		if (!canEdit) {
			return json({ error: 'You do not have permission to edit this item' }, { status: 403 });
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const data = formData.get('data') as string;

		try {
			const parsed = JSON.parse(data);

			await updateHomebrewItem(
				params.id,
				{
					name,
					description,
					data: parsed
				},
				user.username,
				user.role
			);

			return { success: true };
		} catch (e) {
			return json({ error: 'Invalid JSON format' }, { status: 400 });
		}
	}
};
