import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { MemoryCache, CacheKeys } from '$lib/server/cache';

export const GET = async ({ params }: { params: { slug: string } }) => {
	const { slug } = params;

	if (!slug) {
		return json({ error: 'Spell slug is required' }, { status: 400 });
	}

	try {
		// Check cache first
		const cache = MemoryCache.getInstance();
		const cacheKey = CacheKeys.compendiumItem('spell', slug);
		const cached = cache.get(cacheKey);

		if (cached) {
			const cachedItem = cached as any;
			return json({
				...cachedItem.details,
				externalId: cachedItem.externalId,
				__rowId: cachedItem.id
			});
		}

		const db = await getDb();

		// Try to find by externalId first, then by name fallback
		let spell = await db.query.compendiumItems.findFirst({
			where: eq(compendiumItems.externalId, slug)
		});

		// If not found by externalId, try by name (case-insensitive)
		if (!spell) {
			const results = await db
				.select()
				.from(compendiumItems)
				.where(eq(compendiumItems.type, 'spell'));

			spell = results.find(
				(item) => item.name.toLowerCase() === slug.toLowerCase().replace(/-/g, ' ')
			);
		}

		if (!spell) {
			return json({ error: 'Spell not found' }, { status: 404 });
		}

		// Cache result for 15 minutes
		cache.set(cacheKey, spell, 15 * 60 * 1000);

		return json({
			...(spell as any).details,
			externalId: spell.externalId,
			__rowId: spell.id
		});
	} catch (error) {
		console.error('Error fetching spell detail:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
