import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { upsertItem } from '$lib/server/repositories/compendium';

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
		const data = JSON.parse(text);

		const items = Array.isArray(data) ? data : [data];

		let successCount = 0;
		let errorCount = 0;
		const errors: string[] = [];

		for (const item of items) {
			if (!item.name) {
				errorCount++;
				errors.push('Item missing name');
				continue;
			}

			const type = determineType(item);
			if (!type) {
				errorCount++;
				errors.push(`Could not determine type for: ${item.name}`);
				continue;
			}

			try {
				const { name, desc, ...rest } = item;
				await upsertItem({
					key: `homebrew-${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
					name,
					type,
					source: 'homebrew',
					description: desc || '',
					data: rest,
					documentKey: null,
					documentName: null,
					gamesystemKey: null,
					gamesystemName: null,
					publisherKey: null,
					publisherName: null,
					createdBy: user.username
				});
				successCount++;
			} catch (e) {
				errorCount++;
				errors.push(`Failed to create: ${item.name}`);
			}
		}

		return json({
			success: true,
			successCount,
			errorCount,
			errors: errors.slice(0, 10)
		});
	} catch (e) {
		return json({ error: 'Invalid JSON file' }, { status: 400 });
	}
};

function determineType(item: Record<string, unknown>): string | null {
	if (item.level !== undefined || item.school !== undefined || item.range !== undefined) {
		return 'spell';
	}
	if (item.hit_die !== undefined || item.spellcasting !== undefined || item.proficiencies !== undefined) {
		return 'class';
	}
	if (item.size !== undefined || item.type !== undefined || item.hp !== undefined) {
		return 'creature';
	}
	if (item.prerequisites !== undefined || item.ability_score_improvement !== undefined) {
		return 'race';
	}
	if (item.feature !== undefined || item.skill_proficiencies !== undefined) {
		return 'background';
	}
	if (item.prerequisite !== undefined) {
		return 'feat';
	}
	if (item.rarity !== undefined || item.type !== undefined || item.attunement !== undefined) {
		return 'item';
	}
	return null;
}
