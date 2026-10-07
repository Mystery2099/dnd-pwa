import type { Sheet } from './schema';
export type { Sheet } from './schema';
export const abilities = [
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma'
] as const;
export type Ability = (typeof abilities)[number];
export const skills = {
	acrobatics: 'dexterity',
	animalHandling: 'wisdom',
	arcana: 'intelligence',
	athletics: 'strength',
	deception: 'charisma',
	history: 'intelligence',
	insight: 'wisdom',
	intimidation: 'charisma',
	investigation: 'intelligence',
	medicine: 'wisdom',
	nature: 'intelligence',
	perception: 'wisdom',
	performance: 'charisma',
	persuasion: 'charisma',
	religion: 'intelligence',
	sleightOfHand: 'dexterity',
	stealth: 'dexterity',
	survival: 'wisdom'
} as const;
export function defaultSheet(): Sheet {
	return {
		level: 1,
		className: '',
		species: '',
		background: '',
		abilities: {
			strength: 10,
			dexterity: 10,
			constitution: 10,
			intelligence: 10,
			wisdom: 10,
			charisma: 10
		},
		saves: [],
		skills: {},
		armorClass: 10,
		speed: 30,
		initiativeBonus: 0,
		maxHp: 10,
		hp: 10,
		tempHp: 0,
		hitDie: 'd8',
		hitDiceRemaining: 1,
		deathSuccesses: 0,
		deathFailures: 0,
		inspiration: false,
		castingAbility: 'none',
		slots: Array.from({ length: 9 }, () => ({ max: 0, used: 0 })),
		attacks: [],
		equipment: '',
		spells: '',
		notes: ''
	};
}
export const modifier = (score: number) => Math.floor((score - 10) / 2);
export const proficiency = (level: number) => 2 + Math.floor((level - 1) / 4);
export const signed = (value: number) => (value >= 0 ? `+${value}` : String(value));
export const label = (value: string) =>
	value.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
export function damage(sheet: Sheet, amount: number): Sheet {
	const absorbed = Math.min(sheet.tempHp, amount);
	return {
		...sheet,
		tempHp: sheet.tempHp - absorbed,
		hp: Math.max(0, sheet.hp - (amount - absorbed))
	};
}
export function heal(sheet: Sheet, amount: number): Sheet {
	const hp = Math.min(sheet.maxHp, sheet.hp + amount);
	return {
		...sheet,
		hp,
		deathSuccesses: hp > 0 ? 0 : sheet.deathSuccesses,
		deathFailures: hp > 0 ? 0 : sheet.deathFailures
	};
}
export function longRest(sheet: Sheet): Sheet {
	return {
		...heal(sheet, sheet.maxHp),
		tempHp: 0,
		hitDiceRemaining: Math.min(
			sheet.level,
			sheet.hitDiceRemaining + Math.max(1, Math.floor(sheet.level / 2))
		),
		slots: sheet.slots.map((slot) => ({ ...slot, used: 0 }))
	};
}
/** Bounded dice notation; no evaluation of executable expressions. */
export function rollDice(
	expression: string,
	mode: 'normal' | 'advantage' | 'disadvantage' = 'normal'
) {
	const match = /^(\d{1,2})d(4|6|8|10|12|20|100)([+-]\d{1,4})?$/.exec(
		expression.replace(/\s/g, '').toLowerCase()
	);
	if (!match || Number(match[1]) < 1 || Number(match[1]) > 30)
		throw new Error('Use 1–30 dice: e.g. 1d20+5 or 2d6+3.');
	const count = Number(match[1]),
		sides = Number(match[2]),
		bonus = Number(match[3] || 0);
	const die = () => {
		const limit = Math.floor(4294967296 / sides) * sides;
		const buffer = new Uint32Array(1);
		do {
			crypto.getRandomValues(buffer);
		} while (buffer[0] >= limit);
		return (buffer[0] % sides) + 1;
	};
	const rolls = Array.from(
		{ length: count === 1 && sides === 20 && mode !== 'normal' ? 2 : count },
		die
	);
	const base =
		rolls.length === 2 && count === 1 && sides === 20
			? mode === 'advantage'
				? Math.max(...rolls)
				: Math.min(...rolls)
			: rolls.reduce((a, b) => a + b, 0);
	return { total: base + bonus, rolls, bonus };
}
