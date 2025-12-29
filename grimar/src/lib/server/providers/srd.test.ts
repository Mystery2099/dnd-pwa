import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SrdProvider } from './srd';
import * as srdService from '$lib/server/services/srd';

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
			const mockSpells = [{ index: 'fireball', name: 'Fireball', level: 3, school: { name: 'Evocation' } }];
			vi.spyOn(srdService, 'getSpells').mockResolvedValue(mockSpells as any);

			const results = await provider.fetchAllPages('spell');

			expect(results).toHaveLength(1);
			expect(results[0]).toBe(mockSpells[0]);
			expect(srdService.getSpells).toHaveBeenCalledWith(500);
		});

		it('should fetch all monsters via srd service', async () => {
			const mockMonsters = [{ index: 'goblin', name: 'Goblin' }];
			vi.spyOn(srdService, 'getMonsters').mockResolvedValue(mockMonsters as any);

			const results = await provider.fetchAllPages('monster');

			expect(results).toHaveLength(1);
			expect(results[0]).toBe(mockMonsters[0]);
			expect(srdService.getMonsters).toHaveBeenCalledWith(500);
		});
	});
});
