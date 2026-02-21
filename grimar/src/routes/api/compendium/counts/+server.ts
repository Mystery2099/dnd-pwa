import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendium } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const db = await getDb();

	const counts = await db
		.select({
			type: compendium.type,
			count: sql<number>`count(*)`
		})
		.from(compendium)
		.groupBy(compendium.type);

	const result = counts.reduce(
		(acc: Record<string, number>, row: { type: string; count: number }) => {
			acc[`/compendium/${row.type}`] = row.count;
			return acc;
		},
		{} as Record<string, number>
	);

	return json(result);
};
