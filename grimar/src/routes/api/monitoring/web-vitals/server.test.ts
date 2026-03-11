import { beforeEach, describe, expect, it, vi } from 'vitest';

const recordMock = vi.fn();
const persistWebVitalMock = vi.fn().mockResolvedValue(undefined);
const flushQueuedWebVitalsMock = vi.fn().mockResolvedValue({ flushed: 0, remaining: 0 });
const getQueuedWebVitalCountMock = vi.fn().mockReturnValue(0);

vi.mock('$lib/server/utils/monitoring', () => ({
	PerformanceMonitor: {
		getInstance: () => ({
			record: recordMock
		})
	}
}));

vi.mock('$lib/server/repositories/web-vitals', () => ({
	persistWebVital: persistWebVitalMock,
	flushQueuedWebVitals: flushQueuedWebVitalsMock,
	getQueuedWebVitalCount: getQueuedWebVitalCountMock
}));

describe('POST /api/monitoring/web-vitals', () => {
	beforeEach(() => {
		recordMock.mockClear();
		persistWebVitalMock.mockReset();
		persistWebVitalMock.mockResolvedValue(undefined);
		flushQueuedWebVitalsMock.mockClear();
		getQueuedWebVitalCountMock.mockClear();
		getQueuedWebVitalCountMock.mockReturnValue(0);
	});

	it('persists each validated metric', async () => {
		const { POST } = await import('./+server');
		const request = new Request('http://localhost/api/monitoring/web-vitals', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify([
				{
					name: 'LCP',
					value: 1234.56,
					rating: 'good',
					pathname: '/compendium',
					navigationType: 'navigate',
					timestamp: Date.now()
				}
			])
		});

		const response = await POST({ request } as Parameters<typeof POST>[0]);
		const body = await response.json();

		expect(response.status).toBe(202);
		expect(flushQueuedWebVitalsMock).toHaveBeenCalledTimes(1);
		expect(recordMock).toHaveBeenCalledTimes(1);
		expect(persistWebVitalMock).toHaveBeenCalledTimes(1);
		expect(persistWebVitalMock).toHaveBeenCalledWith(
			expect.objectContaining({
				name: 'LCP',
				value: 1234.56,
				rating: 'good',
				pathname: '/compendium',
				navigationType: 'navigate'
			})
		);
		expect(body.recorded).toBe(1);
		expect(body.persisted).toBe(1);
	});

	it('queues metrics and returns 503 when persistence fails', async () => {
		const { POST } = await import('./+server');
		persistWebVitalMock.mockRejectedValueOnce(new Error('sqlite unavailable'));
		getQueuedWebVitalCountMock.mockReturnValue(1);

		const request = new Request('http://localhost/api/monitoring/web-vitals', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify([
				{
					name: 'LCP',
					value: 1234.56,
					rating: 'good',
					pathname: 'https://example.com/compendium?token=secret#fragment',
					navigationType: 'navigate',
					timestamp: Date.now()
				}
			])
		});

		const response = await POST({ request } as Parameters<typeof POST>[0]);
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(flushQueuedWebVitalsMock).toHaveBeenCalledTimes(1);
		expect(recordMock).toHaveBeenCalledTimes(1);
		expect(persistWebVitalMock).toHaveBeenCalledTimes(1);
		expect(body.queued).toBe(1);
		expect(Array.isArray(body.persistenceErrors)).toBe(true);
		expect(body.persistenceErrors).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'LCP',
					pathname: '/compendium',
					message: 'sqlite unavailable'
				})
			])
		);
	});
});
