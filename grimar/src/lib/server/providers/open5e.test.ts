import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Open5eProvider } from './open5e';

describe('Open5eProvider', () => {
	let provider: Open5eProvider;

	beforeEach(() => {
		provider = new Open5eProvider();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('fetchAllPages', () => {
		it('should fetch all pages using pagination', async () => {
			const page1 = { results: [{ slug: 'item1', name: 'Item 1' }], next: 'https://api.open5e.com/next' };
			const page2 = { results: [{ slug: 'item2', name: 'Item 2' }], next: null };

			(global.fetch as any)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => page1
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => page2
				});

			// Mock validateData by bypassing it or ensuring mock data passes schema
			// Since validateData is internal, we provide valid data structure
			// Note: Open5eProvider uses Zod validation internally. We need to match the schema.
			// Simplified test: We assume Zod validation passes if structure is correct.

			const results = await provider.fetchAllPages('spell');

			expect(results).toHaveLength(2);
			expect(results[0]).toMatchObject({ slug: 'item1' });
			expect(results[1]).toMatchObject({ slug: 'item2' });
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});
	});

	describe('transformItem', () => {
		it('should transform feat correctly', () => {
			const validFeat = {
				slug: 'alert',
				name: 'Alert',
				prerequisites: ['Level 4'],
				description: ['Always on the lookout...']
			};

			const result = provider.transformItem(validFeat, 'feat');
			expect(result.externalId).toBe('alert');
			expect(result.name).toBe('Alert');
			expect(result.featBenefits).toEqual(['Always on the lookout...']);
			expect(result.featPrerequisites).toBe('Level 4');
		});
	});
});
