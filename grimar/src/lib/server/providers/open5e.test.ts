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
			const page1 = {
				count: 400,
				results: [{ key: 'item1', name: 'Item 1' }],
				next: 'https://api.open5e.com/v2/spells/?limit=1&page=2'
			};
			const page2 = { count: 400, results: [{ key: 'item2', name: 'Item 2' }], next: null };

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
			expect(results[0]).toMatchObject({ key: 'item1' });
			expect(results[1]).toMatchObject({ key: 'item2' });
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});
	});

	describe('transformItem', () => {
		it('should transform feat correctly', () => {
			const validFeat = {
				key: 'alert',
				name: 'Alert',
				prerequisites: ['Level 4'],
				description: 'Always on the lookout...'
			};

			const result = provider.transformItem(validFeat, 'feat');
			expect(result.externalId).toBe('alert');
			expect(result.name).toBe('Alert');
			expect(result.featBenefits).toEqual(['Always on the lookout...']);
			expect(result.featPrerequisites).toBe('Level 4');
		});

		it('should transform creature correctly', () => {
			const validCreature = {
				key: 'ancient-red-dragon',
				name: 'Ancient Red Dragon',
				type: { name: 'Dragon', key: 'dragon' },
				size: { name: 'Gargantuan', key: 'gargantuan' },
				challenge_rating_text: '24'
			};

			const result = provider.transformItem(validCreature, 'monster');
			expect(result.externalId).toBe('ancient-red-dragon');
			expect(result.name).toBe('Ancient Red Dragon');
			expect(result.monsterSize).toBe('Gargantuan');
			expect(result.monsterType).toBe('Dragon');
			expect(result.challengeRating).toBe('24');
		});

		it('should transform spell correctly', () => {
			const validSpell = {
				key: 'fireball',
				name: 'Fireball',
				level: 3,
				school: { name: 'Evocation', key: 'evocation' },
				verbal: true,
				somatic: true,
				material: true,
				concentration: false,
				ritual: false,
				casting_time: '1 action',
				duration: 'Instantaneous'
			};

			const result = provider.transformItem(validSpell, 'spell');
			expect(result.externalId).toBe('fireball');
			expect(result.name).toBe('Fireball');
			expect(result.spellLevel).toBe(3);
			expect(result.spellSchool).toBe('Evocation');
		});

		it('should transform species correctly', () => {
			const validSpecies = {
				key: 'elf',
				name: 'Elf',
				desc: 'Elves are magical people...'
			};

			const result = provider.transformItem(validSpecies, 'race');
			expect(result.externalId).toBe('elf');
			expect(result.name).toBe('Elf');
		});
	});
});
