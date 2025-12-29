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
import { compendiumItems } from '$lib/server/db/schema';
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
			const allItems = await db.select().from(compendiumItems);
			for (const item of allItems) {
				if (item.type) {
					typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
					totalCount++;
				}
			}
			items = allItems.map((item) => ({
				type: item.type,
				source: item.source,
				externalId: item.externalId,
				name: item.name,
				summary: item.summary,
				details: item.details,
				spellLevel: item.spellLevel,
				spellSchool: item.spellSchool,
				challengeRating: item.challengeRating,
				monsterSize: item.monsterSize,
				monsterType: item.monsterType
			}));
		} else {
			// Counts only: use query API for efficiency
			const spells = await db.$count(compendiumItems, undefined);
			const monsters = await db.$count(compendiumItems, undefined);
			typeCounts = { spell: spells, monster: monsters };
			totalCount = spells + monsters;
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
		console.error('[compendium/export] Error:', error);
		return json({ error: 'Failed to export compendium data' }, { status: 500 });
	}
};
