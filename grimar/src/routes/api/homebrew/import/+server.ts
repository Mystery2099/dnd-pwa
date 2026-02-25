import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { upsertItems } from '$lib/server/repositories/compendium';
import { homebrewImportSchema, type HomebrewItemInput } from '$lib/server/validators/homebrew';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;

	if (!file) {
		return json({ error: 'No file provided' }, { status: 400 });
	}

	try {
		const text = await file.text();
		const rawData = JSON.parse(text);
		const itemsArray = Array.isArray(rawData) ? rawData : [rawData];

		const parsed = homebrewImportSchema.safeParse(itemsArray);
		if (!parsed.success) {
			return json(
				{ error: 'Validation failed', details: parsed.error.issues.slice(0, 10) },
				{ status: 400 }
			);
		}

		const validatedItems: HomebrewItemInput[] = parsed.data;

		const itemsToUpsert = validatedItems.map((item) => ({
			key: `homebrew-${item.type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
			name: item.name,
			type: item.type,
			source: 'homebrew' as const,
			description: item.summary,
			data: item.details,
			documentKey: null,
			documentName: null,
			gamesystemKey: null,
			gamesystemName: null,
			publisherKey: null,
			publisherName: null,
			createdBy: user.username
		}));

		const upsertedCount = await upsertItems(itemsToUpsert);

		return json({
			success: true,
			importedCount: upsertedCount
		});
	} catch (e) {
		return json({ error: 'Invalid JSON file' }, { status: 400 });
	}
};
