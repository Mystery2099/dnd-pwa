import { describe, expect, it } from 'vitest';
import { buildCompendiumListItem, buildCompendiumListResult } from './list';
import type { CompendiumItem } from '$lib/server/db/schema';

function createItem(overrides: Partial<CompendiumItem>): CompendiumItem {
	return {
		key: 'test-item',
		type: 'spells',
		name: 'Test Item',
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

describe('buildCompendiumListItem', () => {
	it('builds normalized spell list presentation', () => {
		const item = createItem({
			type: 'spells',
			description: 'A convincing illusion.',
			documentName: 'Player Handbook',
			data: {
				level: 3,
				school: { name: 'Illusion' },
				damage_types: ['psychic'],
				target_type: '20-foot sphere'
			}
		});

		expect(buildCompendiumListItem(item)).toEqual({
			item,
			presentation: {
				description: 'A convincing illusion.',
				documentLabel: 'Player Handbook',
				cardIcon: { family: 'spell-school', value: 'illusion' },
				badges: [
					{ label: 'Level 3', variant: 'solid' },
					{
						label: 'Illusion',
						variant: 'outline',
						icon: { family: 'spell-school', value: 'illusion' }
					},
					{
						label: 'psychic',
						variant: 'outline',
						icon: { family: 'damage-type', value: 'psychic' }
					},
					{
						label: '20-foot sphere',
						variant: 'outline',
						icon: { family: 'aoe', value: 'sphere' }
					}
				]
			}
		});
	});

	it('wraps paginated repository results in the normalized list contract', () => {
		const item = createItem({
			type: 'images',
			data: {
				file_url: '/images/griffon.png',
				alt_text: 'A griffon in flight',
				attribution: 'Open5e'
			}
		});

		expect(
			buildCompendiumListResult({
				items: [item],
				total: 1,
				page: 1,
				pageSize: 50,
				totalPages: 1,
				hasMore: false,
				resultsTruncated: false
			})
		).toEqual({
			listSchemaVersion: 1,
			items: [
				{
					item,
					presentation: {
						description: 'A griffon in flight',
						documentLabel: undefined,
						cardIcon: undefined,
						badges: [
							{ label: 'Image', variant: 'solid' },
							{ label: 'Artwork credit', variant: 'outline' }
						]
					}
				}
			],
			total: 1,
			page: 1,
			pageSize: 50,
			totalPages: 1,
			hasMore: false,
			resultsTruncated: false
		});
	});
});
