/**
 * SRD Damage Types API
 *
 * Damage type-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdDamageTypeSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdDamageType = z.infer<typeof SrdDamageTypeSchema>;

export async function getDamageTypes(limit = 500): Promise<SrdDamageType[]> {
	const query = `
        {
            damage-types(limit: ${limit}) {
                index name desc
            }
        }`;

	return fetchSrdData(query, 'damage-types', SrdDamageTypeSchema, 'damage-type', validateData);
}

export async function getDamageTypeDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('damage-types', index, 'damage-type');
}
