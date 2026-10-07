import { z } from 'zod';
import { abilities, defaultSheet } from './rules';

const integer = (min: number, max: number) => z.number().int().min(min).max(max);
const text = z.string().max(200);
export const sheetSchema = z
	.object({
		level: integer(1, 20),
		className: text,
		species: text,
		background: text,
		abilities: z.object({
			strength: integer(1, 30),
			dexterity: integer(1, 30),
			constitution: integer(1, 30),
			intelligence: integer(1, 30),
			wisdom: integer(1, 30),
			charisma: integer(1, 30)
		}),
		saves: z.array(z.enum(abilities)).max(6),
		skills: z.record(z.string(), integer(0, 2)),
		armorClass: integer(0, 100),
		speed: integer(0, 1000),
		initiativeBonus: integer(-100, 100),
		maxHp: integer(1, 10000),
		hp: integer(0, 10000),
		tempHp: integer(0, 10000),
		hitDie: z.enum(['d6', 'd8', 'd10', 'd12']),
		hitDiceRemaining: integer(0, 20),
		deathSuccesses: integer(0, 3),
		deathFailures: integer(0, 3),
		inspiration: z.boolean(),
		castingAbility: z.enum(['none', ...abilities]),
		slots: z.array(z.object({ max: integer(0, 20), used: integer(0, 20) })).length(9),
		attacks: z
			.array(
				z.object({
					name: text,
					ability: z.enum(abilities),
					proficient: z.boolean(),
					bonus: integer(-100, 100),
					damage: z.string().max(40)
				})
			)
			.max(30),
		equipment: z.string().max(20000),
		spells: z.string().max(20000),
		notes: z.string().max(40000)
	})
	.refine(
		(s) =>
			s.hp <= s.maxHp &&
			s.hitDiceRemaining <= s.level &&
			s.slots.every((slot) => slot.used <= slot.max),
		'Current resources cannot exceed their maximums'
	);
export type Sheet = z.infer<typeof sheetSchema>;
export const characterSchema = z.object({
	name: z.string().trim().min(1).max(200),
	sheet: sheetSchema
});
export function readSheet(stats: unknown): Sheet {
	const record = stats && typeof stats === 'object' ? (stats as Record<string, unknown>) : {};
	const saved = sheetSchema.safeParse(record.sheet);
	if (saved.success) return saved.data;
	const sheet = defaultSheet();
	if (typeof record.level === 'number' && record.level >= 1 && record.level <= 20)
		sheet.level = Math.floor(record.level);
	if (typeof record.class === 'string') sheet.className = record.class.slice(0, 200);
	sheet.hitDiceRemaining = sheet.level;
	return sheet;
}
