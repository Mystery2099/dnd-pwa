/**
 * SRD Features API
 *
 * Class feature-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdFeatureSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdFeature = z.infer<typeof SrdFeatureSchema>;

export async function getFeatures(limit = 500): Promise<SrdFeature[]> {
	const query = `
        {
            features(limit: ${limit}) {
                index name level description class { index name } subclass { index name }
                feature_flags granters { index name type }
            }
        }`;

	return fetchSrdData(query, 'features', SrdFeatureSchema, 'feature', validateData);
}

export async function getFeatureDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('features', index, 'feature');
}
