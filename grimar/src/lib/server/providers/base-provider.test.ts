import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseProvider } from './base-provider';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import type { TransformResult, ProviderListResponse, FetchOptions } from './types';

// Concrete implementation for testing
class TestProvider extends BaseProvider {
	readonly id = 'test-provider';
	readonly name = 'Test Provider';
	readonly baseUrl = 'https://api.test.com';
	readonly supportedTypes = ['spell'] as const;

	protected getEndpoint(_type: CompendiumTypeName): string {
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

	async fetchList(
		__type: CompendiumTypeName,
		__options?: FetchOptions
	): Promise<ProviderListResponse> {
		return { items: [], total: 0 };
	}

	// Expose protected methods for testing
	public publicToTitleCase(str: string): string {
		return this.toTitleCase(str);
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
			expect(global.fetch).toHaveBeenCalledWith(
				'https://api.test.com',
				expect.objectContaining({ method: 'HEAD' })
			);
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
});
