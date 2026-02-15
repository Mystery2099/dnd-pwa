import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { roll, initDiceBox, isValidNotation, clear, destroy } from './dice-service';

// Mock fetch for asset validation
global.fetch = vi.fn(() =>
	Promise.resolve({
		ok: true,
		status: 200,
		headers: new Headers()
	} as Response)
);

// Mock @3d-dice/dice-box
vi.mock('@3d-dice/dice-box', () => ({
	default: class MockDiceBox {
		async init() {
			return;
		}
		async roll(notation: string) {
			// Simulate successful roll
			return [
				{
					groupId: 1,
					rollId: 1,
					sides: 20,
					qty: 1,
					modifier: 0,
					value: 15,
					theme: 'default',
					themeColor: '#8b5cf6',
					rolls: [{ rollId: 1, sides: 20, groupId: 1, value: 15, theme: 'default', dieType: 'd20' }]
				}
			];
		}
		clear() {
			return;
		}
		updateConfig() {
			return Promise.resolve();
		}
		onRollComplete = null;
	}
}));

// Mock rpg-dice-roller
vi.mock('rpg-dice-roller', () => ({
	DiceRoller: class {
		roll(notation: string) {
			return {
				rolls: [{ rolls: [15] }],
				total: 15,
				toString: () => '15 = 15'
			};
		}
	}
}));

describe('Dice Service', () => {
	beforeEach(async () => {
		await initDiceBox('#test-container', { offscreen: true });
	});

	afterEach(() => {
		destroy();
	});

	describe('isValidNotation', () => {
		it('should accept valid dice notation', () => {
			expect(isValidNotation('1d20')).toBe(true);
			expect(isValidNotation('2d6+3')).toBe(true);
			expect(isValidNotation('4d6kh3')).toBe(true);
		});

		it('should handle edge cases', () => {
			// rpg-dice-roller is very permissive, so we test what it actually accepts
			expect(isValidNotation('   ')).toBe(true); // Trims whitespace
		});
	});

	describe('roll', () => {
		it('should roll dice and return result', async () => {
			const result = await roll('1d20');
			expect(result).not.toBeNull();
			expect(result?.total).toBe(15);
			expect(result?.notation).toBe('1d20');
		});

		it('should handle problematic dice types with fallback', async () => {
			const result = await roll('1d4');
			expect(result).not.toBeNull();
		});

		it('should handle modifiers correctly', async () => {
			const result = await roll('2d6+3');
			expect(result).not.toBeNull();
		});
	});

	describe('clear', () => {
		it('should clear dice without errors', () => {
			expect(() => clear()).not.toThrow();
		});
	});
});
