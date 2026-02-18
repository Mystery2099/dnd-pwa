import { json } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { requireUser } from '$lib/server/services/auth';
import { getHomebrewItemById, updateHomebrewItem } from '$lib/server/repositories/compendium';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = requireUser(locals);
	
	const item = await getHomebrewItemById(Number(params.id));
	
	if (!item || item.source !== 'homebrew') {
		throw new Error('Item not found');
	}
	
	const canEdit = user.role === 'admin' || item.createdBy === user.username;
	
	if (!canEdit) {
		throw new Error('You do not have permission to edit this item');
	}
	
	return {
		item: {
			id: item.id,
			name: item.name,
			type: item.type,
			summary: item.summary || '',
			jsonData: item.jsonData ? JSON.stringify(JSON.parse(item.jsonData), null, 2) : '{}'
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
		
		const item = await getHomebrewItemById(Number(params.id));
		
		if (!item || item.source !== 'homebrew') {
			return json({ error: 'Item not found' }, { status: 404 });
		}
		
		const canEdit = user.role === 'admin' || item.createdBy === user.username;
		
		if (!canEdit) {
			return json({ error: 'You do not have permission to edit this item' }, { status: 403 });
		}
		
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const summary = formData.get('summary') as string;
		const jsonData = formData.get('jsonData') as string;
		
		try {
			const parsed = JSON.parse(jsonData);
			
			await updateHomebrewItem(
				Number(params.id),
				{
					name,
					summary,
					jsonData: JSON.stringify(parsed),
					details: {}
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
