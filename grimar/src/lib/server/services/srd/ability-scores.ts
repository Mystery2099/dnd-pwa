/**
 * SRD Ability Scores API
 *
 * Ability score-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdAbilityScoreSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdAbilityScore = z.infer<typeof SrdAbilityScoreSchema>;

export async function getAbilityScores(limit = 500): Promise<SrdAbilityScore[]> {
	const query = `
        {
            ability-scores(limit: ${limit}) {
                index name abbreviation desc full_name url
            }
        }`;

	return fetchSrdData(query, 'ability-scores', SrdAbilityScoreSchema, 'ability-score', validateData);
}

export async function getAbilityScoreDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('ability-scores', index, 'ability-score');
}
