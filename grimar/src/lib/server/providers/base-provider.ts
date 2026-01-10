/**
 * Abstract Base Provider
 *
 * Common utilities and functionality shared across all compendium providers.
 * Reduces code duplication by extracting common patterns:
 * - Health checks with timeout
 * - Title case conversion
 * - Paginated API fetching
 * - Endpoint resolution
 */

import type {
	CompendiumProvider,
	FetchOptions,
	ProviderListResponse,
	TransformResult
} from './types';
import type { CompendiumTypeName } from '$lib/core/types/compendium';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('BaseProvider');

/**
 * Abstract base class for all compendium providers.
 * Provides common implementations for shared functionality.
 */
export abstract class BaseProvider implements CompendiumProvider {
	abstract readonly id: string;
	abstract readonly name: string;
	abstract readonly baseUrl: string;
	supportedTypes: readonly CompendiumTypeName[];

	constructor(supportedTypes?: readonly CompendiumTypeName[]) {
		this.supportedTypes = supportedTypes ?? [];
	}

	/**
	 * Check provider health with timeout protection
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			const response = await fetch(this.baseUrl, {
				signal: controller.signal,
				method: 'HEAD'
			});

			clearTimeout(timeoutId);
			return response.ok;
		} catch {
			return false;
		}
	}

	/**
	 * Convert string to title case (first letter uppercase, rest lowercase)
	 */
	protected toTitleCase(str: string): string {
		if (!str) return str;
		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}

	/**
	 * Fetch all items from an endpoint with automatic pagination
	 * Common implementation for providers with paginated APIs
	 */
	protected async fetchAllPagesPaginated(
		endpoint: string,
		limit: number = 100,
		responseKey: string = 'results',
		nextKey: string = 'next'
	): Promise<unknown[]> {
		let nextUrl: string | null = `${this.baseUrl}${endpoint}?limit=${limit}`;
		const allItems: unknown[] = [];

		while (nextUrl) {
			log.debug({ providerId: this.id, url: nextUrl }, 'Fetching page');

			const response = await fetch(nextUrl);
			if (!response.ok) {
				const text = await response.text();
				throw new Error(
					`${this.name} API error: ${response.status} ${response.statusText} - ${text.slice(0, 200)}`
				);
			}

			const rawData = await response.json();
			const data = rawData as Record<string, unknown>;
			const results = data[responseKey] as unknown[];
			const next = data[nextKey] as string | null;

			log.debug(
				{ providerId: this.id, itemCount: results.length, hasMore: next !== null },
				'Received items'
			);
			allItems.push(...results);
			nextUrl = next;
		}

		log.info({ providerId: this.id, totalItems: allItems.length }, 'Total items fetched');
		return allItems;
	}

	/**
	 * Abstract method - subclasses must implement
	 * Get the API endpoint for a given type
	 */
	protected abstract getEndpoint(type: CompendiumTypeName): string;

	/**
	 * Abstract method - subclasses must implement
	 * Transform raw provider data to standard format
	 */
	abstract transformItem(rawItem: unknown, type: CompendiumTypeName): TransformResult;

	/**
	 * Abstract method - subclasses must implement
	 * Fetch a list of items (lightweight data for list views)
	 */
	abstract fetchList(
		type: CompendiumTypeName,
		options?: FetchOptions
	): Promise<ProviderListResponse>;

	/**
	 * Optional - fetch complete details for a single item
	 */
	async fetchDetail?(
		type: CompendiumTypeName,
		externalId: string
	): Promise<Record<string, unknown>>;

	/**
	 * Optional - fetch all items (helper for sync)
	 */
	async fetchAllPages?(type: CompendiumTypeName): Promise<unknown[]>;
}
