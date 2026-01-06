import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDbWithRetry } from './db-retry';

// Mock the db-connection module
const { mockGetDb } = vi.hoisted(() => {
	return {
		mockGetDb: vi.fn()
	};
});

vi.mock('./db-connection', () => ({
	getDb: mockGetDb
}));

describe('db-retry', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe('getDbWithRetry', () => {
		it('should return database connection on first attempt', async () => {
			const mockDb = {} as any;
			mockGetDb.mockResolvedValue(mockDb);

			const result = await getDbWithRetry(3);

			expect(result).toBe(mockDb);
			expect(mockGetDb).toHaveBeenCalledTimes(1);
		});

		it('should retry on failure and succeed', async () => {
			const mockDb = {} as any;
			mockGetDb
				.mockRejectedValueOnce(new Error('Connection refused'))
				.mockRejectedValueOnce(new Error('Connection refused'))
				.mockResolvedValue(mockDb);

			const resultPromise = getDbWithRetry(3);

			// Advance through the retry delays (100ms + 200ms)
			await vi.advanceTimersByTimeAsync(300);

			const result = await resultPromise;

			expect(result).toBe(mockDb);
			expect(mockGetDb).toHaveBeenCalledTimes(3);
		});

		it('should fail after max retries', async () => {
			const testError = new Error('Connection refused');
			mockGetDb.mockRejectedValue(testError);

			const resultPromise = getDbWithRetry(3).catch((e) => e);

			// Advance through both retry delays
			await vi.advanceTimersByTimeAsync(100);
			await vi.advanceTimersByTimeAsync(200);

			const result = await resultPromise;
			expect(result).toBe(testError);
			expect(mockGetDb).toHaveBeenCalledTimes(3);
		});

		it('should use exponential backoff', async () => {
			const mockDb = {} as any;
			mockGetDb.mockRejectedValueOnce(new Error('Fail 1')).mockResolvedValue(mockDb);

			const resultPromise = getDbWithRetry(3);

			// Advance past the first delay (100ms)
			await vi.advanceTimersByTimeAsync(100);

			const result = await resultPromise;
			expect(result).toBe(mockDb);
			expect(mockGetDb).toHaveBeenCalledTimes(2);
		});

		it('should respect custom maxRetries parameter', async () => {
			const mockDb = {} as any;
			mockGetDb.mockRejectedValueOnce(new Error('Fail')).mockResolvedValue(mockDb);

			const resultPromise = getDbWithRetry(2); // Only 2 retries

			await vi.advanceTimersByTimeAsync(100);

			const result = await resultPromise;

			expect(result).toBe(mockDb);
			expect(mockGetDb).toHaveBeenCalledTimes(2);
		});
	});
});
