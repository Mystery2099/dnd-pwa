import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FiveEBitsProvider } from './5ebits';

describe('FiveEBitsProvider', () => {
	let provider: FiveEBitsProvider;

	beforeEach(() => {
		provider = new FiveEBitsProvider();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('fetchAllPages', () => {
		it('should fetch all pages using pagination', async () => {
			const page1 = { results: [{ index: 'item1', name: 'Item 1' }], next: 'https://api.5e-bits.com/next' };
			const page2 = { results: [{ index: 'item2', name: 'Item 2' }], next: null };

			(global.fetch as any)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => page1
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => page2
				});

			const results = await provider.fetchAllPages('spell');

			expect(results).toHaveLength(2);
			expect(results[0]).toMatchObject({ index: 'item1' });
			expect(results[1]).toMatchObject({ index: 'item2' });
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});
	});
});
