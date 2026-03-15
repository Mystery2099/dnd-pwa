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
