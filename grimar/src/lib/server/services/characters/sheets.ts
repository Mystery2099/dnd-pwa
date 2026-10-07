import { error } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { characters } from '$lib/server/db/schema';
import { characterRepository } from '$lib/server/repositories/characters';
import { ensureUserSettings } from '$lib/server/repositories/users';
import { defaultSheet } from '$lib/features/characters/rules';
import { characterSchema } from '$lib/features/characters/schema';

export function characterId(value: string) {
	const id = Number(value);
	if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(id)) error(400, 'Invalid character ID');
	return id;
}
export function revision(stats: unknown): number {
	const value = (stats as Record<string, unknown> | null)?._sheetRevision;
	return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
export async function createSheet(owner: string, name: string) {
	const parsed = characterSchema.safeParse({ name, sheet: defaultSheet() });
	if (!parsed.success) error(400, 'Enter a character name (1–200 characters).');
	const db = await getDb();
	await ensureUserSettings(db, owner);
	return characterRepository.createCharacter(db, {
		owner,
		name: parsed.data.name,
		portraitUrl: null,
		stats: { sheet: parsed.data.sheet, _sheetRevision: 0 },
		inventory: [],
		spells: []
	});
}
export async function saveSheet(
	id: number,
	owner: string,
	input: unknown,
	expectedRevision: number
) {
	const parsed = characterSchema.safeParse(input);
	if (!parsed.success) return { kind: 'invalid' as const };
	const db = await getDb();
	// Read uncached state and compare revisions atomically so another tab cannot silently overwrite it.
	const current = await db.query.characters.findFirst({
		where: and(eq(characters.id, id), eq(characters.owner, owner))
	});
	if (!current) error(404, 'Character not found');
	const stats = current.stats as Record<string, unknown>;
	const updated = await db
		.update(characters)
		.set({
			name: parsed.data.name,
			stats: {
				...stats,
				sheet: parsed.data.sheet,
				level: parsed.data.sheet.level,
				class: parsed.data.sheet.className,
				_sheetRevision: expectedRevision + 1
			}
		})
		.where(
			and(
				eq(characters.id, id),
				eq(characters.owner, owner),
				sql`COALESCE(json_extract(${characters.stats}, '$._sheetRevision'), 0) = ${expectedRevision}`
			)
		)
		.returning();
	if (!updated.length) return { kind: 'conflict' as const };
	await characterRepository.invalidateCharacter(db, id, owner);
	return { kind: 'saved' as const };
}
export async function deleteSheet(id: number, owner: string, expectedRevision: number) {
	const db = await getDb();
	const removed = await db
		.delete(characters)
		.where(
			and(
				eq(characters.id, id),
				eq(characters.owner, owner),
				sql`COALESCE(json_extract(${characters.stats}, '$._sheetRevision'), 0) = ${expectedRevision}`
			)
		)
		.returning();
	if (!removed.length) return false;
	await characterRepository.invalidateCharacter(db, id, owner);
	return true;
}
