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
		getQueryBucketMock.mockReset();
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

	it('returns a controlled 500 response when the stats query fails', async () => {
		const { GET } = await import('../../../routes/api/compendium/stats/+server');
		getTypeCountsMock.mockRejectedValueOnce(new Error('db unavailable'));

		const response = await GET();
		const body = await response.json();

		expect(response.status).toBe(500);
		expect(body).toEqual({ error: 'Failed to load compendium stats' });
		expect(response.headers.get('Cache-Control')).toBeNull();
		expect(response.headers.get('Server-Timing')).toBeNull();
		expect(response.headers.get('X-Query-Bucket')).toBeNull();
	});
});
