/**
 * SRD Alignments API
 *
 * Alignment-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdAlignmentSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdAlignment = z.infer<typeof SrdAlignmentSchema>;

export async function getAlignments(limit = 500): Promise<SrdAlignment[]> {
	const query = `
        {
            alignments(limit: ${limit}) {
                index name abbreviation desc
            }
        }`;

	return fetchSrdData(query, 'alignments', SrdAlignmentSchema, 'alignment', validateData);
}

export async function getAlignmentDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('alignments', index, 'alignment');
}
