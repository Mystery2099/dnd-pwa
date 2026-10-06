import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryCache } from './memory-cache';

describe('MemoryCache resource limits', () => {
	afterEach(() => vi.useRealTimers());

	it('evicts the least recently used fresh entry at capacity', () => {
		const cache = new MemoryCache({ maxSize: 2 });
		cache.set('a', 1);
		cache.set('b', 2);
		expect(cache.get('a')).toBe(1);
		cache.set('c', 3);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBeNull();
		expect(cache.get('c')).toBe(3);
	});

	it('updates at capacity without evicting another entry', () => {
		const cache = new MemoryCache({ maxSize: 2 });
		cache.set('a', 1);
		cache.set('b', 2);
		cache.set('b', 3);
		expect(cache.get('a')).toBe(1);
		expect(cache.get('b')).toBe(3);
	});

	it('enforces the byte budget and rejects oversized values', () => {
		const cache = new MemoryCache({ maxMemory: 30 });
		cache.set('a', 'x'.repeat(20));
		cache.set('b', 'x'.repeat(20));
		expect(cache.get('a')).toBeNull();
		expect(cache.getCacheStats().used).toBeLessThanOrEqual(30);
		cache.set('huge', 'x'.repeat(100));
		expect(cache.get('huge')).toBeNull();
		expect(cache.get('b')).toBe('x'.repeat(20));
	});

	it('reclaims expired entries and keeps byte accounting correct', () => {
		vi.useFakeTimers();
		const cache = new MemoryCache();
		cache.set('expired', { value: 'é' }, 100);
		cache.set('fresh', { value: 'live' }, 1000);
		vi.advanceTimersByTime(101);
		cache.pruneExpired();
		expect(cache.get('expired')).toBeNull();
		expect(cache.get('fresh')).toEqual({ value: 'live' });
		cache.invalidatePattern('fresh');
		expect(cache.getCacheStats().used).toBe(0);
		cache.set('new', 1);
		cache.clear();
		expect(cache.getCacheStats().used).toBe(0);
	});

	it('reads statistics without serializing the cache again', () => {
		const cache = new MemoryCache();
		const toJSON = vi.fn(() => 'value');
		cache.set('key', { toJSON });
		cache.getCacheStats();
		cache.getCacheStats();
		expect(toJSON).toHaveBeenCalledTimes(1);
	});
});
