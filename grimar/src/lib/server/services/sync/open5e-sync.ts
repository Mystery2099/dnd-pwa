import { z } from 'zod';
import { upsertItem, clearType, type CompendiumType } from '$lib/server/repositories/compendium';
import { createModuleLogger } from '$lib/server/logger';

const logger = createModuleLogger('open5e-sync');

const OPEN5E_BASE_URL = 'http://10.147.20.240:8888/v2';

export const SYNCABLE_TYPES: CompendiumType[] = [
	'spells',
	'creatures',
	'species',
	'magicitems',
	'classes',
	'weapons',
	'armor',
	'backgrounds',
	'feats',
	'skills',
	'languages',
	'alignments',
	'conditions',
	'abilities',
	'sizes',
	'damagetypes',
	'spellschools',
	'creaturetypes',
	'environments'
];

export interface SyncProgress {
	type: string;
	total: number;
	synced: number;
	percentage: number;
	status: 'pending' | 'syncing' | 'complete' | 'error';
	error?: string;
}

export interface SyncResult {
	type: CompendiumType;
	total: number;
	synced: number;
	errors: number;
	duration: number;
}

const Open5eDocumentSchema = z.object({
	name: z.string(),
	key: z.string(),
	publisher: z
		.object({
			name: z.string(),
			key: z.string()
		})
		.nullable(),
	gamesystem: z
		.object({
			name: z.string(),
			key: z.string()
		})
		.nullable()
});

const Open5eResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		count: z.number(),
		next: z.string().nullable(),
		previous: z.string().nullable(),
		results: z.array(itemSchema)
	});

async function fetchAllPages<T>(
	endpoint: string,
	itemSchema: z.ZodType<T>,
	onProgress?: (fetched: number, total: number) => void
): Promise<T[]> {
	const items: T[] = [];
	let nextUrl: string | null = `${OPEN5E_BASE_URL}/${endpoint}/?limit=100`;
	let total = 0;

	while (nextUrl) {
		try {
			const response: Response = await fetch(nextUrl);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data: { count?: number; next?: string | null; results?: unknown[] } = await response.json();
			total = data.count ?? total;

			for (const item of data.results ?? []) {
				try {
					const validated = itemSchema.parse(item);
					items.push(validated);
				} catch (err) {
					logger.warn({ err, itemKey: (item as Record<string, unknown>)?.key }, '[open5e] Failed to validate item');
				}
			}

			onProgress?.(items.length, total);
			nextUrl = data.next ?? null;
		} catch (err) {
			logger.error({ err, url: nextUrl }, '[open5e] Failed to fetch page');
			throw err;
		}
	}

	return items;
}

function extractKeyFromUrl(url: string): string {
	const parts = url.split('/').filter(Boolean);
	return parts[parts.length - 1] ?? '';
}

function transformToCompendiumItem<T extends Record<string, unknown>>(
	item: T,
	type: CompendiumType
) {
	const doc =
		typeof item.document === 'object' && item.document !== null
			? (item.document as {
					name?: string;
					key?: string;
					publisher?: { name: string; key: string };
					gamesystem?: { name: string; key: string };
			  })
			: undefined;

	const name = extractName(item, type);
	const key = (item.key as string | undefined) ?? (typeof item.url === 'string' ? extractKeyFromUrl(item.url) : name?.toLowerCase() ?? 'unknown');

	return {
		key,
		type,
		name,
		source: 'open5e',
		documentKey: doc?.key ?? '',
		documentName: doc?.name ?? '',
		gamesystemKey: doc?.gamesystem?.key ?? '',
		gamesystemName: doc?.gamesystem?.name ?? '',
		publisherKey: doc?.publisher?.key ?? '',
		publisherName: doc?.publisher?.name ?? '',
		description: extractDescription(item, type),
		data: item as Record<string, unknown>,
		createdBy: null
	};
}

function extractName(item: Record<string, unknown>, type: CompendiumType): string {
	if (type === 'alignments') {
		const shortName = item.short_name as string | undefined;
		if (shortName) return shortName;
		const morality = item.morality as string | undefined;
		const societalAttitude = item.societal_attitude as string | undefined;
		if (morality && societalAttitude) return `${morality} ${societalAttitude}`;
		return (item.key as string) ?? 'Unknown';
	}
	return (item.name as string) ?? (item.key as string) ?? 'Unknown';
}

function extractDescription(item: Record<string, unknown>, type: CompendiumType): string | null {
	switch (type) {
		case 'spells':
			return (item.desc as string) ?? null;
		case 'creatures':
			return null;
		case 'species':
			return (item.desc as string) ?? null;
		case 'classes':
			return (item.desc as string) ?? null;
		case 'backgrounds':
			return (item.desc as string) ?? null;
		case 'feats':
			return (item.desc as string) ?? null;
		case 'magicitems':
			return (item.desc as string) ?? null;
		default:
			return (item.desc as string) ?? null;
	}
}

export async function syncType(
	type: CompendiumType,
	onProgress?: (fetched: number, total: number) => void
): Promise<SyncResult> {
	const startTime = Date.now();
	let synced = 0;
	let errors = 0;

	logger.info({ type }, '[open5e] Starting sync');

	try {
		await clearType(type);

		const GenericItemSchema = z.record(z.string(), z.unknown());
		const items = await fetchAllPages(type, GenericItemSchema, onProgress);

		for (const item of items) {
			try {
				const compendiumItem = transformToCompendiumItem(item as Record<string, unknown>, type);
				await upsertItem(compendiumItem);
				synced++;
			} catch (err) {
				logger.error({ err, itemKey: item?.key }, '[open5e] Failed to upsert item');
				errors++;
			}
		}

		const duration = Date.now() - startTime;
		logger.info({ type, synced, errors, duration }, '[open5e] Sync complete');

		return {
			type,
			total: items.length,
			synced,
			errors,
			duration
		};
	} catch (err) {
		logger.error({ err, type }, '[open5e] Sync failed');
		throw err;
	}
}

export async function syncAllTypes(
	onTypeProgress?: (type: string, fetched: number, total: number) => void,
	onTypeComplete?: (result: SyncResult) => void
): Promise<SyncResult[]> {
	const results: SyncResult[] = [];

	for (const type of SYNCABLE_TYPES) {
		const result = await syncType(type, (fetched, total) => {
			onTypeProgress?.(type, fetched, total);
		});
		results.push(result);
		onTypeComplete?.(result);
	}

	return results;
}

export async function getApiStats(): Promise<Record<CompendiumType, number>> {
	const stats: Partial<Record<CompendiumType, number>> = {};

	for (const type of SYNCABLE_TYPES) {
		try {
			const response = await fetch(`${OPEN5E_BASE_URL}/${type}/?limit=1`);
			if (response.ok) {
				const data = await response.json();
				stats[type] = data.count ?? 0;
			}
		} catch {
			stats[type] = 0;
		}
	}

	return stats as Record<CompendiumType, number>;
}
