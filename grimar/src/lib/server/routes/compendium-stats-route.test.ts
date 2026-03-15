import { beforeEach, describe, expect, it, vi } from 'vitest';

const getTypeCountsMock = vi.fn();
const getQueryBucketMock = vi.fn().mockReturnValue('fast');

vi.mock('$lib/server/repositories/compendium', () => ({
	getTypeCounts: getTypeCountsMock
}));

vi.mock('$lib/server/utils/query-performance', () => ({
	getQueryBucket: getQueryBucketMock
}));

describe('GET /api/compendium/stats', () => {
	beforeEach(() => {
		getTypeCountsMock.mockReset();
		getQueryBucketMock.mockClear();
		getQueryBucketMock.mockReturnValue('fast');
	});

	it('returns type counts with cache and timing headers', async () => {
		const { GET } = await import('../../../routes/api/compendium/stats/+server');
		getTypeCountsMock.mockResolvedValueOnce({
			spells: 120,
			creatures: 340
		});

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			spells: 120,
			creatures: 340
		});
		expect(getTypeCountsMock).toHaveBeenCalledTimes(1);
		expect(getQueryBucketMock).toHaveBeenCalledTimes(1);
		expect(response.headers.get('Cache-Control')).toBe(
			'public, max-age=30, stale-while-revalidate=120'
		);
		expect(response.headers.get('X-Query-Bucket')).toBe('fast');
		expect(response.headers.get('X-Query-Time-Ms')).toMatch(/^\d+(\.\d+)?$/);
		expect(response.headers.get('Server-Timing')).toMatch(/^compendium-stats;dur=\d+(\.\d+)?$/);
	});
});
