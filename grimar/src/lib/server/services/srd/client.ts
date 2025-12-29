/**
 * SRD API Client
 *
 * Shared HTTP client configuration for the D&D 5e SRD API.
 * Provides GraphQL and REST endpoint URLs.
 */

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
