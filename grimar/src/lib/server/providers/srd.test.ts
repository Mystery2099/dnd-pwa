import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SrdProvider } from './srd';
import * as srdService from '$lib/server/services/compendium/srd';

describe('SrdProvider', () => {
	let provider: SrdProvider;

	beforeEach(() => {
		provider = new SrdProvider();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('fetchAllPages', () => {
		it('should fetch all spells via srd service', async () => {
			const mockSpells = [
				{ index: 'fireball', name: 'Fireball', level: 3, school: { name: 'Evocation' } }
			];
			vi.spyOn(srdService, 'getSpells').mockResolvedValue(mockSpells as any);

			const results = await provider.fetchAllPages('spell');

			expect(results).toHaveLength(1);
			expect(results[0]).toBe(mockSpells[0]);
			expect(srdService.getSpells).toHaveBeenCalledWith(500);
		});

		it('should fetch all monsters via srd service', async () => {
			const mockMonsters = [{ index: 'goblin', name: 'Goblin' }];
			// Mock the new getMonstersWithDetails function
			vi.spyOn(srdService, 'getMonstersWithDetails').mockResolvedValue(mockMonsters as any);

			const results = await provider.fetchAllPages('monster');

			expect(results).toHaveLength(1);
			expect(results[0]).toBe(mockMonsters[0]);
			expect(srdService.getMonstersWithDetails).toHaveBeenCalledWith(500);
		});
	});

	describe('transformItem', () => {
		it('should validate and transform spell', () => {
			const validSpell = {
				index: 'fireball',
				name: 'Fireball',
				level: 3,
				school: { name: 'Evocation' },
				desc: ['A bright streak...'],
				range: '150 feet',
				components: ['V', 'S', 'M'],
				ritual: false,
				duration: 'Instantaneous',
				concentration: false,
				casting_time: '1 action'
			};

			const result = provider.transformItem(validSpell, 'spell');
			expect(result.externalId).toBe('fireball');
			expect(result.spellLevel).toBe(3);
		});

		it('should throw on invalid spell', () => {
			const invalidSpell = { index: 'fireball', name: 'Fireball' }; // missing level, school etc

			expect(() => provider.transformItem(invalidSpell, 'spell')).toThrow(/Invalid SRD spell data/);
		});

		it('should validate and transform monster summary', () => {
			const validMonster = {
				index: 'goblin',
				name: 'Goblin',
				type: 'humanoid',
				size: 'Small',
				challenge_rating: 0.25
			};

			const result = provider.transformItem(validMonster, 'monster');
			expect(result.externalId).toBe('goblin');
			expect(result.challengeRating).toBe('0.25');
		});
	});
});
