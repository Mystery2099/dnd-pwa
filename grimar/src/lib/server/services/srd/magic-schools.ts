/**
 * SRD Magic Schools API
 *
 * Magic school-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdMagicSchoolSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdMagicSchool = z.infer<typeof SrdMagicSchoolSchema>;

export async function getMagicSchools(limit = 500): Promise<SrdMagicSchool[]> {
	const query = `
        {
            magic-schools(limit: ${limit}) {
                index name desc url
            }
        }`;

	return fetchSrdData(query, 'magic-schools', SrdMagicSchoolSchema, 'magic-school', validateData);
}

export async function getMagicSchoolDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('magic-schools', index, 'magic-school');
}
