/**
 * SRD Rules API
 *
 * Rule-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdRuleSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdRule = z.infer<typeof SrdRuleSchema>;

export async function getRules(limit = 500): Promise<SrdRule[]> {
	const query = `
        {
            rules(limit: ${limit}) {
                index name subsections { index name url } url
            }
        }`;

	return fetchSrdData(query, 'rules', SrdRuleSchema, 'rule', validateData);
}

export async function getRuleDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('rules', index, 'rule');
}
