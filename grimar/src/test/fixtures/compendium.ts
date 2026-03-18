import type { CompendiumItem } from '$lib/server/db/schema';

export const INFERNAL_LANGUAGE_URL = 'http://10.147.20.240:8888/v2/languages/infernal/';

export function makeCompendiumItem(overrides: Partial<CompendiumItem> = {}): CompendiumItem {
	return {
		key: 'common',
		type: 'languages',
		name: 'Common',
		source: 'open5e',
		documentKey: null,
		documentName: null,
		gamesystemKey: null,
		gamesystemName: null,
		publisherKey: null,
		publisherName: null,
		description: null,
		data: {},
		createdAt: new Date(),
		updatedAt: new Date(),
		createdBy: null,
		...overrides
	};
}
