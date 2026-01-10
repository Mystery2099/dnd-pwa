/**
 * SRD Monster Types API
 *
 * Monster type-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdMonsterTypeSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdMonsterType = z.infer<typeof SrdMonsterTypeSchema>;

export async function getMonsterTypes(limit = 500): Promise<SrdMonsterType[]> {
	const query = `
        {
            monster-types(limit: ${limit}) {
                index name desc symbol
            }
        }`;

	return fetchSrdData(query, 'monster-types', SrdMonsterTypeSchema, 'monster-type', validateData);
}

export async function getMonsterTypeDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('monster-types', index, 'monster-type');
}
