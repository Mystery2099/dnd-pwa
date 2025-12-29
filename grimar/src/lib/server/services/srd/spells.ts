/**
 * SRD Spells API
 *
 * Spell-specific data fetching from the D&D 5e SRD API.
 * Uses GraphQL for bulk queries and REST for detail lookups.
 */

import { GRAPHQL_URL, BASE_URL, createGraphQLRequest } from './client';
import { SrdSpellSchema, validateData } from '$lib/types/compendium/schemas';
import { z } from 'zod';

export type SrdSpell = z.infer<typeof SrdSpellSchema>;

export async function getSpells(limit = 500): Promise<SrdSpell[]> {
	const query = `
        {
            spells(limit: ${limit}) {
                index name level school { name } classes { name }
                desc higher_level range components material ritual duration concentration casting_time
            }
        }`;

	try {
		const res = await fetch(GRAPHQL_URL, createGraphQLRequest(query));
		const json = await res.json();

		// Validate and parse each spell
		const rawSpells = json.data?.spells || [];
		const spells: SrdSpell[] = [];

		for (const spell of rawSpells) {
			try {
				const validated = validateData(SrdSpellSchema, spell, 'SRD spell');
				spells.push(validated);
			} catch (e) {
				console.warn('[srd] Skipping invalid spell:', e);
			}
		}

		return spells.sort((a, b) => a.name.localeCompare(b.name));
	} catch (e) {
		console.error('SRD Spells Fetch Error:', e);
		return [];
	}
}

export async function getSpellDetail(index: string): Promise<Record<string, unknown> | null> {
	try {
		const res = await fetch(`${BASE_URL}/spells/${index}`);
		if (!res.ok) throw new Error('Failed to fetch spell detail');
		return (await res.json()) as Record<string, unknown>;
	} catch (e) {
		console.error('SRD Spell Detail Error:', e);
		return null;
	}
}
