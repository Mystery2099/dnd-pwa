/**
 * SRD Spells API
 *
 * Spell-specific data fetching from the D&D 5e SRD API.
 * Uses GraphQL for bulk queries and REST for detail lookups.
 */

import { GRAPHQL_URL, BASE_URL, createGraphQLRequest } from './client';
import { SrdSpellSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('SRDSpells');

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
				log.warn({ spellName: spell.name, error: e }, 'Skipping invalid spell');
			}
		}

		return spells.sort((a, b) => a.name.localeCompare(b.name));
	} catch (e) {
		log.error({ error: e }, 'SRD Spells Fetch Error');
		return [];
	}
}

export async function getSpellDetail(index: string): Promise<Record<string, unknown> | null> {
	try {
		const res = await fetch(`${BASE_URL}/spells/${index}`);
		if (!res.ok) throw new Error('Failed to fetch spell detail');
		return (await res.json()) as Record<string, unknown>;
	} catch (e) {
		log.error({ error: e, spellIndex: index }, 'SRD Spell Detail Error');
		return null;
	}
}
