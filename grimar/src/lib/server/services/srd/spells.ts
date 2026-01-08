/**
 * SRD Spells API
 *
 * Spell-specific data fetching from the D&D 5e SRD API.
 * Uses GraphQL for bulk queries and REST for detail lookups.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdSpellSchema, validateData } from '$lib/core/types/compendium/schemas';
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

	return fetchSrdData(query, 'spells', SrdSpellSchema, 'spell', validateData);
}

export async function getSpellDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('spells', index, 'spell');
}
