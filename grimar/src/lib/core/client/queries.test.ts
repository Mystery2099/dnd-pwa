import { describe, it, expect, vi } from 'vitest';
import { apiFetch, fetchCompendiumDetail, fetchCompendiumList } from './queries';

// Mock global fetch
const globalFetch = vi.fn();
global.fetch = globalFetch;

describe('apiFetch', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should return data on successful fetch', async () => {
		const mockData = { items: [{ id: 1, name: 'Test' }] };
		globalFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
			headers: new Headers({ 'content-type': 'application/json' })
		});

		const result = await apiFetch('/api/test');
		expect(result).toEqual(mockData);
	});

	it('should throw ApiError on failed fetch with status', async () => {
		globalFetch.mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found',
			text: async () => 'Not Found'
		});

		await expect(apiFetch('/api/test')).rejects.toThrow('Not Found');
	});

	it('should throw ApiError on network error', async () => {
		globalFetch.mockRejectedValueOnce(new TypeError('Network error'));

		await expect(apiFetch('/api/test')).rejects.toThrow('Network error');
	});

	it('should throw ApiError.offline when navigator is offline', async () => {
		const originalOnline = navigator.onLine;
		Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

		globalFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({})
		});

		await expect(apiFetch('/api/test')).rejects.toThrow('Device is offline');

		Object.defineProperty(navigator, 'onLine', { value: originalOnline, configurable: true });
	});

	it('rejects compendium list responses with an unexpected schema version', async () => {
		globalFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				listSchemaVersion: 2,
				items: [],
				total: 0,
				page: 1,
				pageSize: 20,
				totalPages: 0,
				hasMore: false,
				resultsTruncated: false
			}),
			headers: new Headers({ 'content-type': 'application/json' })
		});

		await expect(fetchCompendiumList('spells')).rejects.toThrow('Invalid compendium list response');
	});

	it('rejects compendium detail responses with an unexpected schema version', async () => {
		globalFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				detailSchemaVersion: 2,
				item: {},
				presentation: {},
				fields: [],
				sections: []
			}),
			headers: new Headers({ 'content-type': 'application/json' })
		});

		await expect(fetchCompendiumDetail('spells', 'fireball')).rejects.toThrow(
			'Invalid compendium detail response'
		);
	});

	it('rejects malformed v1 compendium list responses', async () => {
		globalFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				listSchemaVersion: 1,
				items: {},
				total: '0'
			}),
			headers: new Headers({ 'content-type': 'application/json' })
		});

		await expect(fetchCompendiumList('spells')).rejects.toThrow('Invalid compendium list response');
	});

	it('rejects malformed v1 compendium detail responses', async () => {
		globalFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				detailSchemaVersion: 1,
				item: [],
				presentation: null,
				fields: {},
				sections: []
			}),
			headers: new Headers({ 'content-type': 'application/json' })
		});

		await expect(fetchCompendiumDetail('spells', 'fireball')).rejects.toThrow(
			'Invalid compendium detail response'
		);
	});
});
