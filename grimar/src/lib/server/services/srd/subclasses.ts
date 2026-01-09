/**
 * SRD Subclasses API
 *
 * Subclass-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdSubclassSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdSubclass = z.infer<typeof SrdSubclassSchema>;

export async function getSubclasses(limit = 500): Promise<SrdSubclass[]> {
	const query = `
        {
            subclasses(limit: ${limit}) {
                index name class { index name } subclass_flavor desc features { index name level }
            }
        }`;

	return fetchSrdData(query, 'subclasses', SrdSubclassSchema, 'subclass', validateData);
}

export async function getSubclassDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('subclasses', index, 'subclass');
}
