import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseProvider } from './base-provider';
import type { CompendiumTypeName } from '$lib/types/compendium';
import type { TransformResult, ProviderListResponse, FetchOptions } from './types';

// Concrete implementation for testing
class TestProvider extends BaseProvider {
	readonly id = 'test-provider';
	readonly name = 'Test Provider';
	readonly baseUrl = 'https://api.test.com';
	readonly supportedTypes = ['spell'] as const;

	protected getEndpoint(type: CompendiumTypeName): string {
		return '/test-endpoint';
	}

	transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult {
		return {
			id: 'test-id',
			name: 'Test Item',
			type,
			data: rawItem as Record<string, unknown>
		};
	}

	async fetchList(type: CompendiumTypeName, options?: FetchOptions): Promise<ProviderListResponse> {
		return { items: [], total: 0 };
	}

	// Expose protected methods for testing
	public publicToTitleCase(str: string): string {
		return this.toTitleCase(str);
	}

	public async publicFetchAllPagesPaginated(endpoint: string, limit?: number): Promise<unknown[]> {
		return this.fetchAllPagesPaginated(endpoint, limit);
	}
}

describe('BaseProvider', () => {
	let provider: TestProvider;

	beforeEach(() => {
		provider = new TestProvider();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('toTitleCase', () => {
		it('should capitalize the first letter and lowercase the rest', () => {
			expect(provider.publicToTitleCase('hello')).toBe('Hello');
			expect(provider.publicToTitleCase('HELLO')).toBe('Hello');
			expect(provider.publicToTitleCase('hELLO')).toBe('Hello');
		});

		it('should handle empty strings', () => {
			expect(provider.publicToTitleCase('')).toBe('');
		});
	});

	describe('healthCheck', () => {
		it('should return true when API returns 200 OK', async () => {
			(global.fetch as any).mockResolvedValue({
				ok: true
			});

			const result = await provider.healthCheck();
			expect(result).toBe(true);
			expect(global.fetch).toHaveBeenCalledWith('https://api.test.com', expect.objectContaining({ method: 'HEAD' }));
		});

		it('should return false when API returns error status', async () => {
			(global.fetch as any).mockResolvedValue({
				ok: false
			});

			const result = await provider.healthCheck();
			expect(result).toBe(false);
		});

		it('should return false on network error', async () => {
			(global.fetch as any).mockRejectedValue(new Error('Network error'));

			const result = await provider.healthCheck();
			expect(result).toBe(false);
		});
	});

	describe('fetchAllPagesPaginated', () => {
		it('should fetch all pages until next is null', async () => {
			const page1 = { results: [{ id: 1 }], next: 'https://api.test.com/next' };
			const page2 = { results: [{ id: 2 }], next: null };

			(global.fetch as any)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => page1
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => page2
				});

			const results = await provider.publicFetchAllPagesPaginated('/items');

			expect(results).toHaveLength(2);
			expect(results).toEqual([{ id: 1 }, { id: 2 }]);
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});
	});
});
