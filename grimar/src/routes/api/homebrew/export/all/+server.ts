import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllHomebrewItems } from '$lib/server/repositories/compendium';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const items = await getAllHomebrewItems();

	const exportData = items.map((item) => ({
		name: item.name,
		desc: item.summary || '',
		createdBy: item.createdBy,
		...JSON.parse(item.jsonData || '{}')
	}));

	return new Response(JSON.stringify(exportData, null, 2), {
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': 'attachment; filename="homebrew-all.json"'
		}
	});
};
