import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SpellsAPI');

export const GET = async () => {
	try {
		const db = await getDb();

		// Get actual count of spells using $count()
		const count = await db.$count(compendiumItems, eq(compendiumItems.type, 'spell'));

		return json({
			hasSpells: count > 0,
			count
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
