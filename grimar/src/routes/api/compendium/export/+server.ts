/**
 * Compendium Export API
 *
 * Exports all compendium data for browser seeding.
 * This enables offline-first functionality by providing all data
 * needed to populate the browser's IndexedDB store.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { compendium } from '$lib/server/db/schema';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('CompendiumExportAPI');
import { nanoid } from 'nanoid';

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		const db = await getDb();
		const checksum = url.searchParams.get('checksum');
		const ifNoneMatch = request.headers.get('if-none-match');
		const shouldExportFull = url.searchParams.get('full') === 'true';

		let typeCounts: Record<string, number> = {};
		let totalCount = 0;
		let items: Array<Record<string, unknown>> = [];

		if (shouldExportFull) {
			// Full export: load all data and count in one pass
			const allItems = await db.select().from(compendium);
			for (const item of allItems) {
				if (item.type) {
					typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
					totalCount++;
				}
			}
			items = allItems.map((item) => ({
				key: item.key,
				type: item.type,
				source: item.source,
				name: item.name,
				description: item.description,
				data: item.data,
				documentKey: item.documentKey,
				gamesystemKey: item.gamesystemKey
			}));
		} else {
			// Counts only: use query API for efficiency
			const allItems = await db.select().from(compendium);
			for (const item of allItems) {
				if (item.type) {
					typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
					totalCount++;
				}
			}
		}

		const currentChecksum = nanoid(12);

		// If client has same data, return 304
		if (checksum && ifNoneMatch && checksum === ifNoneMatch) {
			return new Response(null, { status: 304 });
		}

		const response = {
			version: Date.now(),
			checksum: currentChecksum,
			counts: typeCounts,
			total: totalCount,
			items: shouldExportFull ? items : undefined
		};

		return json(response, {
			headers: {
				'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
				ETag: currentChecksum
			}
		});
	} catch (error) {
		log.error({ error }, 'Failed to export compendium data');
		return json({ error: 'Failed to export compendium data' }, { status: 500 });
	}
};
