import { readSheet, sheetSchema } from './schema';
import { describe, it, expect } from 'vitest';
import { defaultSheet, modifier, proficiency, damage, heal, longRest, rollDice } from './rules';

describe('Character rules', () => {
	it('calculates core bonuses and resource recovery without over-healing', () => {
		expect([modifier(7), modifier(10), modifier(19)]).toEqual([-2, 0, 4]);
		expect([1, 4, 5, 8, 9, 12, 13, 16, 17, 20].map(proficiency)).toEqual([
			2, 2, 3, 3, 4, 4, 5, 5, 6, 6
		]);
		const sheet = {
			...defaultSheet(),
			level: 5,
			maxHp: 30,
			hp: 20,
			tempHp: 7,
			hitDiceRemaining: 0,
			deathFailures: 2
		};
		const wounded = damage(sheet, 12);
		expect([wounded.hp, wounded.tempHp]).toEqual([15, 0]);
		expect(heal(wounded, 100).hp).toBe(30);
		expect(heal(wounded, 1).deathFailures).toBe(0);
		const rested = longRest({
			...sheet,
			slots: sheet.slots.map((s) => ({ ...s, max: 3, used: 2 }))
		});
		expect([rested.hp, rested.tempHp, rested.hitDiceRemaining]).toEqual([30, 0, 2]);
		expect(rested.slots.every((s) => s.used === 0)).toBe(true);
		expect(readSheet({ level: 8, class: 'Wizard' }).className).toBe('Wizard');
		expect(sheetSchema.safeParse({ ...sheet, hp: 31 }).success).toBe(false);
	});
	it('bounds dice expressions and applies d20 advantage/disadvantage to one selected die', () => {
		for (const expression of ['0d20', '31d6', '1d0', '1d7', 'alert(1)', '999999d20'])
			expect(() => rollDice(expression)).toThrow();
		for (const mode of ['advantage', 'disadvantage'] as const) {
			const result = rollDice('1d20+3', mode);
			expect(result.rolls).toHaveLength(2);
			expect(result.total).toBe(
				(mode === 'advantage' ? Math.max(...result.rolls) : Math.min(...result.rolls)) + 3
			);
		}
		const result = rollDice('2d6-1', 'advantage');
		expect(result.total).toBe(result.rolls.reduce((a, b) => a + b, 0) - 1);
		expect(result.rolls.every((d) => d >= 1 && d <= 6)).toBe(true);
	});
});
