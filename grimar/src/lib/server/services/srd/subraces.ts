/**
 * SRD Subraces API
 *
 * Subrace-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdSubraceSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdSubrace = z.infer<typeof SrdSubraceSchema>;

export async function getSubraces(limit = 500): Promise<SrdSubrace[]> {
	const query = `
        {
            subraces(limit: ${limit}) {
                index name race { index name } desc
                ability_bonuses { ability_score { index name } bonus }
                traits { index name } starting_proficiencies { index name type }
            }
        }`;

	return fetchSrdData(query, 'subraces', SrdSubraceSchema, 'subrace', validateData);
}

export async function getSubraceDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('subraces', index, 'subrace');
}
