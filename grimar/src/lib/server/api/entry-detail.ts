import { getDb } from '$lib/server/db';
import { compendium } from '$lib/server/db/schema';
import type { CompendiumItem } from '$lib/core/types/compendium';
import { eq } from 'drizzle-orm';
import { MemoryCache, CacheKeys } from '$lib/server/utils/cache';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('EntryDetail');

export type EntryType =
	| 'creature'
	| 'spell'
	| 'item'
	| 'race'
	| 'class'
	| 'feat'
	| 'background'
	| 'condition'
	| 'feature'
	| 'subclass'
	| 'subrace';

export interface EntryDetailResponse {
	data: Record<string, unknown>;
	key: string;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function getEntryDetail(
	type: EntryType,
	slug: string
): Promise<CompendiumItem | null> {
	const cache = MemoryCache.getInstance();
	const cacheKey = CacheKeys.compendiumItem(type, slug);

	// Check cache first
	const cached = cache.get(cacheKey);
	if (cached) {
		return cached as CompendiumItem;
	}

	const db = await getDb();

	// Try to find by key first
	let item = await db.query.compendium.findFirst({
		where: eq(compendium.key, slug)
	});

	// If not found by key, try by name (case-insensitive)
	if (!item) {
		const searchName = slug.toLowerCase().replace(/-/g, ' ');
		const results = await db.select().from(compendium).where(eq(compendium.type, type));

		const found = results.find((i) => i.name.toLowerCase() === searchName);
		if (found) {
			item = found;
		}
	}

	// Cache result if found
	if (item) {
		cache.set(cacheKey, item, CACHE_TTL_MS);
	}

	return (item as CompendiumItem | undefined) ?? null;
}

export function formatEntryResponse(item: CompendiumItem): EntryDetailResponse {
	return {
		data: item.data,
		key: item.key
	};
}

export async function handleEntryDetail(
	type: EntryType,
	slug: string
): Promise<{ data: EntryDetailResponse | null; error?: string; status?: number }> {
	if (!slug) {
		return { data: null, error: `${type} slug is required`, status: 400 };
	}

	try {
		const item = await getEntryDetail(type, slug);

		if (!item) {
			return { data: null, error: `${type} not found`, status: 404 };
		}

		return { data: formatEntryResponse(item) };
	} catch (error) {
		log.error({ error, slug, type }, `Error fetching ${type} detail`);
		return { data: null, error: 'Internal server error', status: 500 };
	}
}
