/**
 * SRD API Client
 *
 * Shared HTTP client configuration for D&D 5e SRD API.
 * Provides GraphQL and REST endpoint URLs.
 */

import { createModuleLogger } from '$lib/server/logger';
import { z } from 'zod';

export const BASE_URL = 'https://www.dnd5eapi.co/api';
export const GRAPHQL_URL = 'https://www.dnd5eapi.co/graphql';

/**
 * Shared fetch options for GraphQL requests
 */
export function createGraphQLRequest(query: string): RequestInit {
	return {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query })
	};
}

/**
 * Generic SRD detail fetch with error handling
 * Used for fetching individual items from REST API
 */
export async function fetchSrdDetail(
	endpoint: string,
	index: string,
	resourceType: string
): Promise<Record<string, unknown> | null> {
	const log = createModuleLogger('SRDClient');
	try {
		const res = await fetch(`${BASE_URL}/${endpoint}/${index}`);
		if (!res.ok) throw new Error(`Failed to fetch ${resourceType} detail`);
		return (await res.json()) as Record<string, unknown>;
	} catch (e) {
		log.error({ error: e, index, resourceType }, `SRD ${resourceType} Detail Error`);
		return null;
	}
}

export async function fetchSrdData<T extends { name: string }>(
	query: string,
	dataKey: string,
	schema: z.ZodType<T>,
	resourceName: string,
	validateData: (schema: z.ZodType<T>, data: unknown, context: string) => T
): Promise<T[]> {
	const log = createModuleLogger('SRDClient');
	try {
		const res = await fetch(GRAPHQL_URL, createGraphQLRequest(query));
		const json = await res.json();

		const rawData = json.data?.[dataKey] || [];
		const validData: T[] = [];

		for (const item of rawData) {
			try {
				const validated = validateData(schema, item, `SRD ${resourceName}`);
				validData.push(validated);
			} catch (e) {
				log.warn({ itemName: item.name, error: e }, `Skipping invalid ${resourceName}`);
			}
		}

		return validData.sort((a, b) => a.name.localeCompare(b.name));
	} catch (e) {
		log.error({ error: e }, `SRD ${resourceName} Fetch Error`);
		return [];
	}
}
