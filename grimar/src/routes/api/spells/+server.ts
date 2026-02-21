import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { compendium } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SpellsAPI');

export const GET = async () => {
	try {
		const db = await getDb();

		// Get actual count of spells
		const result = await db.select({ count: count() }).from(compendium).where(eq(compendium.type, 'spells'));
		const spellCount = result[0]?.count ?? 0;

		return json({
			hasSpells: spellCount > 0,
			count: spellCount
		});
	} catch (error) {
		log.error({ error }, 'Error checking spells');
		return json(
			{
				hasSpells: false,
				count: 0,
				error: 'Database error'
			},
			{ status: 500 }
		);
	}
};
