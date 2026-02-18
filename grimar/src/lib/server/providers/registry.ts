/**
 * Provider Registry
 *
 * Manages compendium data providers.
 * Currently supports Open5e (main data source) and Homebrew (user content).
 */

import type { CompendiumProvider, ProviderHealthStatus } from './types';
import { Open5eProvider } from './open5e';
import { HomebrewProvider } from './homebrew';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('ProviderRegistry');

// =============================================================================
// Provider Definitions
// =============================================================================

export interface ProviderDefinition {
	id: string;
	create: () => CompendiumProvider;
}

const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
	{
		id: 'open5e',
		create: () => new Open5eProvider()
	},
	{
		id: 'homebrew',
		create: () => new HomebrewProvider('data/homebrew')
	}
];

// Primary provider for fallback lookups
export const PRIMARY_PROVIDER_ID = 'open5e';

// Sync configuration
export const SYNC_CONFIG = {
	maxConcurrency: 3,
	retryAttempts: 3,
	retryDelayMs: 1000
} as const;

// =============================================================================
// Provider Registry - Singleton pattern
// =============================================================================

class ProviderRegistryClass {
	private providers = new Map<string, CompendiumProvider>();
	private initialized = false;

	/**
	 * Get the singleton instance
	 */
	static getInstance(): ProviderRegistryClass {
		if (!globalThis.__providerRegistryInstance) {
			globalThis.__providerRegistryInstance = new ProviderRegistryClass();
		}
		return globalThis.__providerRegistryInstance;
	}

	private constructor() {
		this.initializeProviders();
	}

	/**
	 * Initialize provider instances
	 */
	private initializeProviders(): void {
		for (const def of PROVIDER_DEFINITIONS) {
			try {
				const provider = def.create();
				this.providers.set(def.id, provider);
				log.info({ providerId: def.id, providerName: provider.name }, 'Registered provider');
			} catch (error) {
				log.error({ providerId: def.id, error }, 'Failed to create provider');
			}
		}

		this.initialized = true;
		log.info({ count: this.providers.size }, 'Provider registry initialized');
	}

	/**
	 * Get all enabled providers
	 */
	getEnabledProviders(): CompendiumProvider[] {
		return Array.from(this.providers.values());
	}

	/**
	 * Get a specific provider by ID
	 */
	getProvider(id: string): CompendiumProvider | undefined {
		return this.providers.get(id);
	}

	/**
	 * Get providers that support a specific type
	 */
	getProvidersForType(type: string): CompendiumProvider[] {
		return this.getEnabledProviders().filter((p) => p.supportedTypes.includes(type as any));
	}

	/**
	 * Get the primary provider
	 */
	getPrimaryProvider(): CompendiumProvider | undefined {
		return this.providers.get(PRIMARY_PROVIDER_ID) ?? this.getEnabledProviders()[0];
	}

	/**
	 * Check health of all registered providers
	 */
	async healthCheckAll(): Promise<ProviderHealthStatus[]> {
		const results: ProviderHealthStatus[] = [];

		for (const [id, provider] of this.providers) {
			const startTime = Date.now();
			try {
				const healthy = await provider.healthCheck();
				results.push({
					providerId: id,
					healthy,
					latency: Date.now() - startTime
				});
			} catch (error) {
				results.push({
					providerId: id,
					healthy: false,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		}

		return results;
	}

	/**
	 * Check if registry has been initialized
	 */
	isInitialized(): boolean {
		return this.initialized;
	}
}

// Extend global type for singleton storage
declare global {
	var __providerRegistryInstance: ProviderRegistryClass | undefined;
}

// Export singleton instance
export const providerRegistry = ProviderRegistryClass.getInstance();

// Export class for type access
export { ProviderRegistryClass as ProviderRegistry };
