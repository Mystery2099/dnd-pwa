/**
 * SRD Rule Sections API
 *
 * Rule section-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdRuleSectionSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdRuleSection = z.infer<typeof SrdRuleSectionSchema>;

export async function getRuleSections(limit = 500): Promise<SrdRuleSection[]> {
	const query = `
        {
            rule-sections(limit: ${limit}) {
                index name desc
            }
        }`;

	return fetchSrdData(query, 'rule-sections', SrdRuleSectionSchema, 'rule-section', validateData);
}

export async function getRuleSectionDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('rule-sections', index, 'rule-section');
}
