/**
 * SRD Proficiencies API
 *
 * Proficiency-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdProficiencySchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdProficiency = z.infer<typeof SrdProficiencySchema>;

export async function getProficiencies(limit = 500): Promise<SrdProficiency[]> {
	const query = `
        {
            proficiencies(limit: ${limit}) {
                index name type
            }
        }`;

	return fetchSrdData(query, 'proficiencies', SrdProficiencySchema, 'proficiency', validateData);
}

export async function getProficiencyDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('proficiencies', index, 'proficiency');
}
