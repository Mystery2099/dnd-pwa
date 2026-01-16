import { getDb } from '$lib/server/db';
import { compendiumItems } from '$lib/server/db/schema';
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
	details: Record<string, unknown>;
	externalId: string | null;
	__rowId: number;
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

	// Try to find by externalId first
	let item = await db.query.compendiumItems.findFirst({
		where: eq(compendiumItems.externalId, slug)
	});

	// If not found by externalId, try by name (case-insensitive)
	if (!item) {
		const searchName = slug.toLowerCase().replace(/-/g, ' ');
		const results = await db.select().from(compendiumItems).where(eq(compendiumItems.type, type));

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
	const details = item.details as Record<string, unknown>;
	return {
		details,
		externalId: item.externalId,
		__rowId: item.id
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
