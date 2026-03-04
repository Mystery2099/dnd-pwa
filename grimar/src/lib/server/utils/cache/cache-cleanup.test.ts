import { afterEach, describe, expect, it, vi } from 'vitest';
import { isCacheCleanupRunning, startCacheCleanup, stopCacheCleanup } from './cache-cleanup';

describe('cache-cleanup', () => {
	afterEach(() => {
		stopCacheCleanup();
		vi.restoreAllMocks();
	});

	it('starts only once until stopped', () => {
		const setIntervalSpy = vi.spyOn(globalThis, 'setInterval').mockReturnValue(123 as any);

		expect(startCacheCleanup(1_000)).toBe(true);
		expect(startCacheCleanup(1_000)).toBe(false);
		expect(isCacheCleanupRunning()).toBe(true);
		expect(setIntervalSpy).toHaveBeenCalledTimes(1);
	});

	it('can stop and start again', () => {
		const setIntervalSpy = vi.spyOn(globalThis, 'setInterval').mockReturnValue(456 as any);
		const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

		expect(startCacheCleanup(1_000)).toBe(true);
		expect(stopCacheCleanup()).toBe(true);
		expect(isCacheCleanupRunning()).toBe(false);
		expect(startCacheCleanup(1_000)).toBe(true);
		expect(setIntervalSpy).toHaveBeenCalledTimes(2);
		expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
	});
});
