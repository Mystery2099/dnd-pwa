/**
 * SRD Languages API
 *
 * Language-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdLanguageSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdLanguage = z.infer<typeof SrdLanguageSchema>;

export async function getLanguages(limit = 500): Promise<SrdLanguage[]> {
	const query = `
        {
            languages(limit: ${limit}) {
                index name typical_speakers script url
            }
        }`;

	return fetchSrdData(query, 'languages', SrdLanguageSchema, 'language', validateData);
}

export async function getLanguageDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('languages', index, 'language');
}
