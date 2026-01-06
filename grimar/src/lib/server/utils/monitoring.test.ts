import { describe, it, expect, vi } from 'vitest';
import { measureDb, createRequestLogger } from '$lib/server/utils/monitoring';
import type { Handle } from '@sveltejs/kit';

describe('monitoring', () => {
	describe('measureDb', () => {
		it('should measure synchronous database operation', () => {
			const result = measureDb('db-test', () => {
				return { rows: [], count: 0 };
			});

			expect(result).toEqual({ rows: [], count: 0 });
		});

		it('should rethrow errors after recording', () => {
			expect(() =>
				measureDb('db-error', () => {
					throw new Error('DB connection failed');
				})
			).toThrow('DB connection failed');
		});
	});

	describe('createRequestLogger', () => {
		it('should return a handle function', () => {
			const handler = createRequestLogger();
			expect(typeof handler).toBe('function');
		});

		it('should return a valid SvelteKit handle', async () => {
			const handler = createRequestLogger();

			// Create mock event
			const mockEvent = {
				request: new Request('http://localhost:3000/test', {
					method: 'GET',
					headers: new Headers({ 'user-agent': 'test-agent' })
				}),
				locals: {}
			};

			// Create mock resolve function
			const mockResolve = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }));

			// Call the handler
			await handler({ event: mockEvent, resolve: mockResolve });

			// Verify it calls resolve
			expect(mockResolve).toHaveBeenCalled();
		});
	});
});
