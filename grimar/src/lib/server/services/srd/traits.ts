/**
 * SRD Traits API
 *
 * Trait-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdTraitSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdTrait = z.infer<typeof SrdTraitSchema>;

export async function getTraits(limit = 500): Promise<SrdTrait[]> {
	const query = `
        {
            traits(limit: ${limit}) {
                index name desc races { index name }
            }
        }`;

	return fetchSrdData(query, 'traits', SrdTraitSchema, 'trait', validateData);
}

export async function getTraitDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('traits', index, 'trait');
}
