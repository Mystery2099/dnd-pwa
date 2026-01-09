/**
 * SRD Weapon Properties API
 *
 * Weapon property-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdWeaponPropertySchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdWeaponProperty = z.infer<typeof SrdWeaponPropertySchema>;

export async function getWeaponProperties(limit = 500): Promise<SrdWeaponProperty[]> {
	const query = `
        {
            weapon-properties(limit: ${limit}) {
                index name desc url
            }
        }`;

	return fetchSrdData(
		query,
		'weapon-properties',
		SrdWeaponPropertySchema,
		'weapon-property',
		validateData
	);
}

export async function getWeaponPropertyDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('weapon-properties', index, 'weapon-property');
}
