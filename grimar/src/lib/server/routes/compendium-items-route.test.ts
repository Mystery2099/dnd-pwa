import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPaginatedItemsMock = vi.fn();
const getQueryBucketMock = vi.fn().mockReturnValue('fast');

vi.mock('$lib/server/repositories/compendium', () => ({
	getPaginatedItems: getPaginatedItemsMock
}));

vi.mock('$lib/server/utils/query-performance', () => ({
	getQueryBucket: getQueryBucketMock
}));

describe('GET /api/compendium/items', () => {
	beforeEach(() => {
		getPaginatedItemsMock.mockReset();
		getQueryBucketMock.mockClear();
		getQueryBucketMock.mockReturnValue('fast');
	});

	it('returns 400 when type is missing', async () => {
		const { GET } = await import('../../../routes/api/compendium/items/+server');
		const response = await GET({
			url: new URL('http://localhost/api/compendium/items')
		} as Parameters<typeof GET>[0]);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual({ error: 'Type parameter is required' });
	});

	it('returns 400 for invalid compendium types', async () => {
		const { GET } = await import('../../../routes/api/compendium/items/+server');
		const response = await GET({
			url: new URL('http://localhost/api/compendium/items?type=bad-type')
		} as Parameters<typeof GET>[0]);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual({ error: 'Invalid compendium type' });
	});

	it('normalizes list parameters before querying the repository', async () => {
		const { GET } = await import('../../../routes/api/compendium/items/+server');
		getPaginatedItemsMock.mockResolvedValueOnce({
			items: [],
			total: 0,
			page: 2,
			pageSize: 25,
			totalPages: 0,
			hasMore: false,
			resultsTruncated: false
		});

		const response = await GET({
			url: new URL(
				'http://localhost/api/compendium/items?type=spells&page=2&limit=25&sortBy=createdAt&sortOrder=desc&spellLevel=3&spellSchool=evocation'
			)
		} as Parameters<typeof GET>[0]);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			listSchemaVersion: 1,
			items: [],
			total: 0,
			page: 2,
			pageSize: 25,
			totalPages: 0,
			hasMore: false,
			resultsTruncated: false
		});
		expect(getPaginatedItemsMock).toHaveBeenCalledWith('spells', {
			page: 2,
			pageSize: 25,
			maxPageSize: 100,
			skipTotalCount: false,
			filters: {
				search: undefined,
				gamesystem: undefined,
				document: undefined,
				source: undefined,
				sortBy: 'created_at',
				sortOrder: 'desc',
				creatureType: undefined,
				spellLevel: 3,
				spellSchool: 'evocation',
				challengeRating: undefined,
				includeSubclasses: undefined,
				onlySubclasses: undefined
			}
		});
	});

	it('returns normalized list presentation instead of raw row parsing details', async () => {
		const { GET } = await import('../../../routes/api/compendium/items/+server');
		getPaginatedItemsMock.mockResolvedValueOnce({
			items: [
				{
					key: 'major-image',
					type: 'spells',
					name: 'Major Image',
					source: 'open5e',
					documentKey: 'srd',
					documentName: 'System Reference Document',
					gamesystemKey: null,
					gamesystemName: null,
					publisherKey: null,
					publisherName: null,
					description: 'A convincing illusion.',
					data: {
						level: 3,
						school: { name: 'Illusion' },
						damage_types: ['psychic'],
						target_type: '20-foot sphere'
					},
					createdAt: new Date(),
					updatedAt: new Date(),
					createdBy: null
				}
			],
			total: 1,
			page: 1,
			pageSize: 50,
			totalPages: 1,
			hasMore: false,
			resultsTruncated: false
		});

		const response = await GET({
			url: new URL('http://localhost/api/compendium/items?type=spells')
		} as Parameters<typeof GET>[0]);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			listSchemaVersion: 1,
			items: [
				{
					item: expect.objectContaining({
						key: 'major-image',
						type: 'spells',
						name: 'Major Image'
					}),
					presentation: {
						description: 'A convincing illusion.',
						documentLabel: 'System Reference Document',
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

	it('uses unbounded pagination when all=true is requested', async () => {
		const { GET } = await import('../../../routes/api/compendium/items/+server');
		getPaginatedItemsMock.mockResolvedValueOnce({
			items: [],
			total: 0,
			page: 1,
			pageSize: Number.MAX_SAFE_INTEGER,
			totalPages: 0,
			hasMore: false,
			resultsTruncated: false
		});

		const response = await GET({
			url: new URL('http://localhost/api/compendium/items?type=classes&all=true')
		} as Parameters<typeof GET>[0]);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			listSchemaVersion: 1,
			items: [],
			total: 0,
			page: 1,
			pageSize: Number.MAX_SAFE_INTEGER,
			totalPages: 0,
			hasMore: false,
			resultsTruncated: false
		});
		expect(getPaginatedItemsMock).toHaveBeenCalledWith('classes', {
			page: 1,
			pageSize: Number.MAX_SAFE_INTEGER,
			maxPageSize: undefined,
			skipTotalCount: false,
			filters: {
				search: undefined,
				gamesystem: undefined,
				document: undefined,
				source: undefined,
				sortBy: 'name',
				sortOrder: 'asc',
				creatureType: undefined,
				spellLevel: undefined,
				spellSchool: undefined,
				challengeRating: undefined,
				includeSubclasses: undefined,
				onlySubclasses: undefined
			}
		});
	});
});
