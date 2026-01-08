import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import type { CompendiumItem } from '$lib/core/types/compendium';
import { eq } from 'drizzle-orm';
import { MemoryCache, CacheKeys } from '$lib/server/utils/cache';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('MonsterDetailAPI');

export const GET = async ({ params }: { params: { slug: string } }) => {
	const { slug } = params;

	if (!slug) {
		return json({ error: 'Monster slug is required' }, { status: 400 });
	}

	try {
		// Check cache first
		const cache = MemoryCache.getInstance();
		const cacheKey = CacheKeys.compendiumItem('monster', slug);
		const cached = cache.get(cacheKey);

		if (cached) {
			const cachedItem = cached as CompendiumItem;
			return json({
				...(cachedItem.details as Record<string, unknown>),
				externalId: cachedItem.externalId,
				__rowId: cachedItem.id
			});
		}

		const db = await getDb();

		// Try to find by externalId first, then by name fallback
		let monster = await db.query.compendiumItems.findFirst({
			where: eq(compendiumItems.externalId, slug)
		});

		// If not found by externalId, try by name (case-insensitive)
		if (!monster) {
			const results = await db
				.select()
				.from(compendiumItems)
				.where(eq(compendiumItems.type, 'monster'));

			const searchName = slug.toLowerCase().replace(/-/g, ' ');
			monster = results.find((item) => item.name.toLowerCase() === searchName);
		}

		if (!monster) {
			return json({ error: 'Monster not found' }, { status: 404 });
		}

		// Cache result for 15 minutes
		cache.set(cacheKey, monster, 15 * 60 * 1000);

		return json({
			...(monster.details as Record<string, unknown>),
			externalId: monster.externalId,
			__rowId: monster.id
		});
	} catch (error) {
		log.error({ error, slug }, 'Error fetching monster detail');
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
