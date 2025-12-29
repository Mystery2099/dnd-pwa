import { getDb } from '$lib/server/db';
import { createCharacter, getCharacter, listByOwner } from '$lib/server/repositories/characters';

export async function listUserCharacters(owner: string) {
	const db = await getDb();
	return listByOwner(db, owner);
}

export async function loadCharacter(id: number, owner?: string) {
	const db = await getDb();
	return getCharacter(db, id, owner);
}

export async function createUserCharacter(
	owner: string,
	payload: Parameters<typeof createCharacter>[1]
) {
	const db = await getDb();
	return createCharacter(db, { ...payload, owner });
}
