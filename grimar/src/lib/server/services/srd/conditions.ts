/**
 * SRD Conditions API
 *
 * Condition-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdConditionSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdCondition = z.infer<typeof SrdConditionSchema>;

export async function getConditions(limit = 500): Promise<SrdCondition[]> {
	const query = `
        {
            conditions(limit: ${limit}) {
                index name desc url
            }
        }`;

	return fetchSrdData(query, 'conditions', SrdConditionSchema, 'condition', validateData);
}

export async function getConditionDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('conditions', index, 'condition');
}
