/**
 * SRD Skills API
 *
 * Skill-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdSkillSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdSkill = z.infer<typeof SrdSkillSchema>;

export async function getSkills(limit = 500): Promise<SrdSkill[]> {
	const query = `
        {
            skills(limit: ${limit}) {
                index name ability_score { index name } desc
            }
        }`;

	return fetchSrdData(query, 'skills', SrdSkillSchema, 'skill', validateData);
}

export async function getSkillDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('skills', index, 'skill');
}
