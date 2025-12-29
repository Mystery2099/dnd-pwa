/**
 * SRD Monsters API
 *
 * Monster-specific data fetching from the D&D 5e SRD API.
 * Uses GraphQL for bulk queries and REST for detail lookups.
 */

import { GRAPHQL_URL, BASE_URL, createGraphQLRequest } from './client';
import { SrdMonsterSummarySchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdMonsterSummary = z.infer<typeof SrdMonsterSummarySchema>;

export async function getMonsters(limit = 500): Promise<SrdMonsterSummary[]> {
	const query = `
        {
            monsters(limit: ${limit}) {
                index name type size challenge_rating
            }
        }`;

	try {
		const res = await fetch(GRAPHQL_URL, createGraphQLRequest(query));
		const json = await res.json();

		// Validate and parse each monster
		const rawMonsters = json.data?.monsters || [];
		const monsters: SrdMonsterSummary[] = [];

		for (const monster of rawMonsters) {
			try {
				const validated = validateData(SrdMonsterSummarySchema, monster, 'SRD monster');
				monsters.push(validated);
			} catch (e) {
				console.warn('[srd] Skipping invalid monster:', e);
			}
		}

		return monsters.sort((a, b) => a.name.localeCompare(b.name));
	} catch (e) {
		console.error('SRD Monsters Fetch Error:', e);
		return [];
	}
}

export async function getMonsterDetail(index: string): Promise<Record<string, unknown> | null> {
	try {
		const res = await fetch(`${BASE_URL}/monsters/${index}`);
		if (!res.ok) throw new Error('Failed to fetch monster detail');
		return (await res.json()) as Record<string, unknown>;
	} catch (e) {
		console.error('SRD Monster Detail Error:', e);
		return null;
	}
}
