import { describe, it, expect, beforeEach } from 'vitest';
import { diceState, QUICK_ROLLS } from './dice-store.svelte';
import { createRollResult } from '../utils/roll-result';

describe('Dice Store', () => {
	beforeEach(() => {
		diceState.clearHistory();
	});

	describe('addRoll', () => {
		it('should add roll to history', () => {
			const result = createRollResult('1d20', 15, '15 = 15');
			diceState.addRoll(result);
			expect(diceState.count).toBe(1);
		});

		it('should trim history to max size (50)', () => {
			for (let i = 0; i < 60; i++) {
				diceState.addRoll(createRollResult('1d6', i, `${i} = ${i}`));
			}
			expect(diceState.count).toBe(50);
		});

		it('should maintain order (newest first)', () => {
			const roll1 = createRollResult('1d20', 10, '10 = 10');
			const roll2 = createRollResult('1d20', 15, '15 = 15');
			diceState.addRoll(roll1);
			diceState.addRoll(roll2);
			const history = diceState.getHistoryItems();
			expect(history[0].total).toBe(15);
			expect(history[1].total).toBe(10);
		});
	});

	describe('tray state', () => {
		it('should toggle tray open/close', () => {
			expect(diceState.open).toBe(false);
			diceState.toggleTray();
			expect(diceState.open).toBe(true);
			diceState.toggleTray();
			expect(diceState.open).toBe(false);
		});

		it('should open tray', () => {
			diceState.openTray();
			expect(diceState.open).toBe(true);
		});

		it('should close tray', () => {
			diceState.openTray();
			diceState.closeTray();
			expect(diceState.open).toBe(false);
		});
	});

	describe('roll removal', () => {
		it('should remove specific roll from history', () => {
			const roll = createRollResult('1d20', 15, '15 = 15');
			diceState.addRoll(roll);
			expect(diceState.count).toBe(1);
			diceState.removeRoll(roll.id);
			expect(diceState.count).toBe(0);
		});
	});

	describe('QUICK_ROLLS', () => {
		it('should have standard dice types', () => {
			expect(QUICK_ROLLS.length).toBeGreaterThan(0);
			expect(QUICK_ROLLS.some((r) => r.notation === '1d20')).toBe(true);
		});
	});
});
