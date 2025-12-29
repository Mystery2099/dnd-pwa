/**
 * Compendium Server Loader Utility
 *
 * Generic server-side loader for all compendium types.
 */

import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq, and, sql, desc, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { CompendiumItem } from '$lib/core/types/compendium';
import type { LoaderOptions, NavigationResult } from '$lib/core/types/compendium/loader';

export async function loadCompendiumItem(options: LoaderOptions): Promise<NavigationResult> {
	const { slug, type, typeLabel } = options;
	const db = await getDb();

	// 1. Find by externalId
	let item = await db.query.compendiumItems.findFirst({
		where: and(eq(compendiumItems.externalId, slug), eq(compendiumItems.type, type))
	});

	// 2. Fallback: name-based lookup
	if (!item) {
		const searchName = slug.toLowerCase().replace(/-/g, ' ');

		// Fetch minimal data for fallback search
		const allMinimal = await db
			.select()
			.from(compendiumItems)
			.where(eq(compendiumItems.type, type));

		const foundByName = allMinimal.find((i) => i.name.toLowerCase() === searchName);

		if (foundByName) {
			const fullItems = await db
				.select()
				.from(compendiumItems)
				.where(eq(compendiumItems.id, foundByName.id));
			item = fullItems[0] ?? null;
		}

		if (!item) {
			error(404, `${typeLabel} not found`);
		}
	}

	// 3. Get prev/next items efficiently (only 2 queries instead of loading all)
	const currentName = item.name;

	// Get prev item using raw SQL for comparison
	const prevItems = await db
		.select()
		.from(compendiumItems)
		.where(and(eq(compendiumItems.type, type), sql`name < ${currentName}`))
		.orderBy(desc(compendiumItems.name))
		.limit(1);

	const prevItem = (prevItems[0] as CompendiumItem) ?? null;

	// Get next item
	const nextItems = await db
		.select()
		.from(compendiumItems)
		.where(and(eq(compendiumItems.type, type), sql`name > ${currentName}`))
		.orderBy(asc(compendiumItems.name))
		.limit(1);

	const nextItem = (nextItems[0] as CompendiumItem) ?? null;

	// Get total count
	const totalCount = await db.$count(compendiumItems, eq(compendiumItems.type, type));

	// Get current index
	const itemsBefore = await db.$count(
		compendiumItems,
		and(eq(compendiumItems.type, type), sql`name < ${currentName}`)
	);
	const currentIndex = itemsBefore + 1;

	// Transform helper
	const transformItem = (i: CompendiumItem | null): CompendiumItem | null => {
		if (!i) return null;
		return i; // Already a CompendiumItem from DB
	};

	return {
		item: item! as CompendiumItem,
		navigation: {
			prev: transformItem(prevItem),
			next: transformItem(nextItem),
			currentIndex,
			total: totalCount
		}
	};
}
