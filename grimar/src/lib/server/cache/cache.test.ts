import { describe, it, expect } from 'vitest';
import { CacheKeys } from '$lib/server/cache/cache-keys';
import { getCacheTTL } from '$lib/server/cache/cache-ttl';
import type { CacheOptions } from '$lib/server/cache/cache-types';

describe('CacheKeys', () => {
	describe('compendiumList', () => {
		it('should generate minimal key for default options', () => {
			const options: CacheOptions = { limit: 50, offset: 0 };
			const key = CacheKeys.compendiumList('spell', options);

			// Defaults are normalized out, so only non-defaults appear
			expect(key).toBe('compendium:list:spell:{}');
		});

		it('should generate minimal key for monsters with defaults', () => {
			const options: CacheOptions = { limit: 50, offset: 0 };
			const key = CacheKeys.compendiumList('monster', options);

			expect(key).toBe('compendium:list:monster:{}');
		});

		it('should include filters in key', () => {
			const options: CacheOptions = { limit: 50, offset: 0, search: 'fire' };
			const key = CacheKeys.compendiumList('spell', options);

			expect(key).toContain('fire');
			expect(key).toContain('compendium:list:spell:');
		});

		it('should handle empty options', () => {
			const key = CacheKeys.compendiumList('spell', {});

			expect(key).toBe('compendium:list:spell:{}');
		});

		it('should be deterministic', () => {
			const options: CacheOptions = { limit: 25, offset: 50, search: 'dragon' };

			const key1 = CacheKeys.compendiumList('monster', options);
			const key2 = CacheKeys.compendiumList('monster', options);

			expect(key1).toBe(key2);
		});
	});

	describe('compendiumItem', () => {
		it('should generate correct key for item', () => {
			const key = CacheKeys.compendiumItem('spell', 'fireball');

			expect(key).toBe('compendium:item:spell:fireball');
		});

		it('should handle different types', () => {
			const spellKey = CacheKeys.compendiumItem('spell', 'fireball');
			const monsterKey = CacheKeys.compendiumItem('monster', 'ancient-red-dragon');

			expect(spellKey).toBe('compendium:item:spell:fireball');
			expect(monsterKey).toBe('compendium:item:monster:ancient-red-dragon');
		});

		it('should handle special characters in ID', () => {
			const key = CacheKeys.compendiumItem('spell', 'cure-wounds');

			expect(key).toBe('compendium:item:spell:cure-wounds');
		});
	});

	describe('compendiumSearch', () => {
		it('should generate correct key for search', () => {
			const key = CacheKeys.compendiumSearch('spell', 'fireball');

			expect(key).toBe('compendium:search:spell:fireball');
		});

		it('should handle empty query', () => {
			const key = CacheKeys.compendiumSearch('monster', '');

			expect(key).toBe('compendium:search:monster:');
		});

		it('should handle spaces in query', () => {
			const key = CacheKeys.compendiumSearch('spell', 'magic missile');

			expect(key).toBe('compendium:search:spell:magic missile');
		});
	});

	describe('compendiumCount', () => {
		it('should generate correct key for count', () => {
			const key = CacheKeys.compendiumCount('spell');

			expect(key).toBe('compendium:count:spell');
		});

		it('should handle different types', () => {
			const spellKey = CacheKeys.compendiumCount('spell');
			const monsterKey = CacheKeys.compendiumCount('monster');

			expect(spellKey).toBe('compendium:count:spell');
			expect(monsterKey).toBe('compendium:count:monster');
		});
	});
});

describe('getCacheTTL', () => {
	it('should return 10 minutes for compendium type', () => {
		const ttl = getCacheTTL('compendium');

		expect(ttl).toBe(600000); // 10 minutes in ms
	});

	it('should return 5 minutes for search type', () => {
		const ttl = getCacheTTL('search');

		expect(ttl).toBe(300000); // 5 minutes in ms
	});

	it('should return 5 minutes for unknown type', () => {
		const ttl = getCacheTTL('unknown');

		expect(ttl).toBe(300000);
	});

	it('should return 5 minutes for empty type', () => {
		const ttl = getCacheTTL('');

		expect(ttl).toBe(300000);
	});

	it('should return consistent values', () => {
		const compendium1 = getCacheTTL('compendium');
		const compendium2 = getCacheTTL('compendium');

		expect(compendium1).toBe(compendium2);
		expect(compendium1).toBe(600000);
	});

	describe('TTL conversion', () => {
		it('10 minutes equals 600000 ms', () => {
			expect(10 * 60 * 1000).toBe(600000);
		});

		it('5 minutes equals 300000 ms', () => {
			expect(5 * 60 * 1000).toBe(300000);
		});

		it('1 hour equals 3600000 ms', () => {
			expect(60 * 60 * 1000).toBe(3600000);
		});
	});
});

describe('Cache Key Patterns', () => {
	it('should have consistent prefix structure', () => {
		const patterns = [
			CacheKeys.compendiumList('spell', {}),
			CacheKeys.compendiumItem('spell', 'id'),
			CacheKeys.compendiumSearch('spell', 'query'),
			CacheKeys.compendiumCount('spell')
		];

		for (const key of patterns) {
			expect(key.startsWith('compendium:')).toBe(true);
		}
	});

	it('should differentiate between list and item keys', () => {
		const listKey = CacheKeys.compendiumList('spell', { limit: 50 });
		const itemKey = CacheKeys.compendiumItem('spell', 'fireball');
		const searchKey = CacheKeys.compendiumSearch('spell', 'fire');
		const countKey = CacheKeys.compendiumCount('spell');

		expect(listKey).not.toBe(itemKey);
		expect(listKey).not.toBe(searchKey);
		expect(listKey).not.toBe(countKey);
		expect(itemKey).not.toBe(searchKey);
	});

	it('should differentiate between types', () => {
		const spellKey = CacheKeys.compendiumList('spell', { limit: 50 });
		const monsterKey = CacheKeys.compendiumList('monster', { limit: 50 });

		expect(spellKey).not.toBe(monsterKey);
	});
});
