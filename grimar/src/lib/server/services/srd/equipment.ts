/**
 * SRD Equipment API
 *
 * Equipment-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdEquipmentSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdEquipment = z.infer<typeof SrdEquipmentSchema>;

export async function getEquipment(limit = 500): Promise<SrdEquipment[]> {
	const query = `
        {
            equipment(limit: ${limit}) {
                index name equipment_category { index name }
                cost { quantity unit } weight desc rarity { name } requires_attunement
            }
        }`;

	return fetchSrdData(query, 'equipment', SrdEquipmentSchema, 'equipment', validateData);
}

export async function getEquipmentDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('equipment', index, 'equipment');
}
