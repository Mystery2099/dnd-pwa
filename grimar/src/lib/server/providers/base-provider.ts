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
