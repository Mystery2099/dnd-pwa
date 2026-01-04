/**
 * SRD Monsters API
 *
 * Monster-specific data fetching from the D&D 5e SRD API.
 * Uses GraphQL for bulk queries and REST for detail lookups.
 */

import { GRAPHQL_URL, BASE_URL, createGraphQLRequest } from './client';
import { SrdMonsterSummarySchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdMonsterSummary = z.infer<typeof SrdMonsterSummarySchema>;

// Full monster detail type from SRD REST API
export interface SrdMonsterDetail extends SrdMonsterSummary {
	alignment?: string;
	subtype?: string;
	armor_class?: number | { type: string; value: number }[];
	armor_desc?: string;
	hit_points?: number;
	hit_dice?: string;
	speed?: Record<string, string | number>;
	strength?: number;
	dexterity?: number;
	constitution?: number;
	intelligence?: number;
	wisdom?: number;
	charisma?: number;
	skills?: Record<string, number>;
	damage_vulnerabilities?: string;
	damage_resistances?: string;
	damage_immunities?: string;
	condition_immunities?: string;
	senses?: string;
	languages?: string;
	actions?: Array<{
		name: string;
		desc: string;
		attack_bonus?: number;
		damage_dice?: string;
	}>;
	special_abilities?: Array<{
		name: string;
		desc: string;
		attack_bonus?: number;
	}>;
	legendary_actions?: Array<{
		name: string;
		desc: string;
		attack_bonus?: number;
	}>;
	reactions?: Array<{
		name: string;
		desc: string;
	}>;
}

export async function getMonsters(limit = 500): Promise<SrdMonsterSummary[]> {
	const query = `
        {
            monsters(limit: ${limit}) {
                index name type size challenge_rating
            }
        }`;

	try {
		const res = await fetch(GRAPHQL_URL, createGraphQLRequest(query));
		const json = await res.json();

		// Validate and parse each monster
		const rawMonsters = json.data?.monsters || [];
		const monsters: SrdMonsterSummary[] = [];

		for (const monster of rawMonsters) {
			try {
				const validated = validateData(SrdMonsterSummarySchema, monster, 'SRD monster');
				monsters.push(validated);
			} catch (e) {
				console.warn('[srd] Skipping invalid monster:', e);
			}
		}

		return monsters.sort((a, b) => a.name.localeCompare(b.name));
	} catch (e) {
		console.error('SRD Monsters Fetch Error:', e);
		return [];
	}
}

/**
 * Fetch all monsters with full details (for sync)
 * Fetches summary list first, then fetches detail for each monster
 */
export async function getMonstersWithDetails(limit = 500): Promise<SrdMonsterDetail[]> {
	// Get summary list
	const summaries = await getMonsters(limit);

	console.info(`[srd] Fetching full details for ${summaries.length} monsters...`);

	// Fetch detail for each monster in parallel with concurrency limit
	const BATCH_SIZE = 10;
	const details: SrdMonsterDetail[] = [];

	for (let i = 0; i < summaries.length; i += BATCH_SIZE) {
		const batch = summaries.slice(i, i + BATCH_SIZE);
		const batchNum = Math.floor(i / BATCH_SIZE) + 1;
		const totalBatches = Math.ceil(summaries.length / BATCH_SIZE);

		console.info(`[srd] Fetching details batch ${batchNum}/${totalBatches}...`);

		const results = await Promise.all(
			batch.map(async (monster) => {
				const detail = await getMonsterDetail(monster.index);
				if (detail) {
					// Merge summary fields with detail
					return {
						...monster,
						...detail
					} as SrdMonsterDetail;
				}
				// Fallback to summary if detail fetch fails
				return monster as SrdMonsterDetail;
			})
		);

		details.push(...results);
	}

	console.info(`[srd] Fetched full details for ${details.length} monsters`);
	return details;
}

export async function getMonsterDetail(index: string): Promise<Record<string, unknown> | null> {
	try {
		const res = await fetch(`${BASE_URL}/monsters/${index}`);
		if (!res.ok) throw new Error('Failed to fetch monster detail');
		return (await res.json()) as Record<string, unknown>;
	} catch (e) {
		console.error('SRD Monster Detail Error:', e);
		return null;
	}
}
