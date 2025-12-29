import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { characters } from '$lib/server/db/schema';

export type CharacterRecord = typeof characters.$inferSelect;
export type CharacterCreateInput = Omit<CharacterRecord, 'id'>;

export async function listByOwner(db: Db, owner: string) {
	return db.query.characters.findMany({
		where: eq(characters.owner, owner),
		orderBy: (model, { desc }) => desc(model.id)
	});
}

export async function getCharacter(db: Db, id: number, owner?: string) {
	return db.query.characters.findFirst({
		where: owner
			? (model, { and }) => and(eq(model.id, id), eq(model.owner, owner))
			: (model) => eq(model.id, id)
	});
}

export async function createCharacter(db: Db, input: CharacterCreateInput) {
	const inserted = await db.insert(characters).values(input).returning();
	return inserted[0];
}
