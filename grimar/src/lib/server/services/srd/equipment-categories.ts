/**
 * SRD Equipment Categories API
 *
 * Equipment category-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdEquipmentCategorySchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdEquipmentCategory = z.infer<typeof SrdEquipmentCategorySchema>;

export async function getEquipmentCategories(limit = 500): Promise<SrdEquipmentCategory[]> {
	const query = `
        {
            equipment-categories(limit: ${limit}) {
                index name url
            }
        }`;

	return fetchSrdData(
		query,
		'equipment-categories',
		SrdEquipmentCategorySchema,
		'equipment-category',
		validateData
	);
}

export async function getEquipmentCategoryDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('equipment-categories', index, 'equipment-category');
}
