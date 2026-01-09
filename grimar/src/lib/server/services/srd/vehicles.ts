/**
 * SRD Vehicles API
 *
 * Vehicle-specific data fetching from the D&D 5e SRD API.
 */

import { fetchSrdData, fetchSrdDetail } from './client';
import { SrdVehicleSchema, validateData } from '$lib/core/types/compendium/schemas';
import { z } from 'zod';

export type SrdVehicle = z.infer<typeof SrdVehicleSchema>;

export async function getVehicles(limit = 500): Promise<SrdVehicle[]> {
	const query = `
        {
            vehicles(limit: ${limit}) {
                index name vehicle_category { index name } capacity speed { quantity unit } desc url
            }
        }`;

	return fetchSrdData(query, 'vehicles', SrdVehicleSchema, 'vehicle', validateData);
}

export async function getVehicleDetail(index: string): Promise<Record<string, unknown> | null> {
	return fetchSrdDetail('vehicles', index, 'vehicle');
}
