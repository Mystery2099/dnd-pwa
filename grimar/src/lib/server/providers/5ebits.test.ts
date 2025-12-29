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

	describe('transformItem', () => {
		it('should throw error when data fails validation', () => {
			const invalidSpell = { index: 'invalid', name: 123 }; // name should be string

			expect(() => provider.transformItem(invalidSpell, 'spell')).toThrow('Invalid spell data from 5e-bits API');
		});

		it('should transform valid spell correctly', () => {
			const validSpell = {
				index: 'fireball',
				name: 'Fireball',
				desc: ['A bright streak...'],
				higher_level: null,
				range: '150 feet',
				components: ['V', 'S', 'M'],
				material: 'A tiny ball of bat guano and sulfur.',
				ritual: false,
				duration: 'Instantaneous',
				concentration: false,
				casting_time: '1 action',
				level: 3,
				school: { index: 'evocation', name: 'Evocation' },
				classes: [{ index: 'wizard', name: 'Wizard' }],
				subclasses: []
			};

			const result = provider.transformItem(validSpell, 'spell');
			expect(result.externalId).toBe('fireball');
			expect(result.name).toBe('Fireball');
			expect(result.spellLevel).toBe(3);
			expect(result.spellSchool).toBe('Evocation');
		});
	});
});
