/**
 * Provider Registry
 *
 * Central registry for managing compendium data providers.
 * Code-driven configuration with optional user overrides from providers.json.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { CompendiumProvider, ProviderHealthStatus } from './types';
import { Open5eProvider } from './open5e';
import { HomebrewProvider } from './homebrew';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('ProviderRegistry');

// =============================================================================
// Provider Definitions - Code-driven, type-safe
// =============================================================================

export interface ProviderDefinition {
	id: string;
	enabled: boolean;
	create: () => CompendiumProvider;
}

// Default provider configuration
const DEFAULT_PROVIDERS: ProviderDefinition[] = [
	{
		id: 'open5e',
		enabled: true,
		create: () => new Open5eProvider()
	},
	{
		id: 'homebrew',
		enabled: false,
		create: () => new HomebrewProvider('data/homebrew')
	}
];

export const PROVIDERS = DEFAULT_PROVIDERS;

// Primary provider for fallback lookups (now open5e since SRD is from GitHub)
export const PRIMARY_PROVIDER_ID = 'open5e';

// Sync configuration
export const SYNC_CONFIG = {
	maxConcurrency: 3,
	retryAttempts: 3,
	retryDelayMs: 1000
} as const;

// =============================================================================
// User Configuration - Optional overrides from providers.json
// =============================================================================

interface UserConfig {
	enabled?: Record<string, boolean>;
	primary?: string;
}

// Cached user config to avoid repeated file reads
let cachedUserConfig: UserConfig | null = null;

/**
 * Load user configuration from providers.json
 * Only overrides enabled status and primary provider
 */
function loadUserConfig(): UserConfig {
	if (cachedUserConfig !== null) {
		return cachedUserConfig;
	}

	const configPath = join(process.cwd(), 'providers.json');

	if (!existsSync(configPath)) {
		cachedUserConfig = {};
		return cachedUserConfig;
	}

	try {
		const content = readFileSync(configPath, 'utf-8');
		const config = JSON.parse(content) as UserConfig;
		log.info('Loaded user configuration from providers.json');
		cachedUserConfig = config;
		return config;
	} catch (error) {
		log.warn({ error }, 'Failed to load providers.json, using defaults');
		cachedUserConfig = {};
		return cachedUserConfig;
	}
}

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
	 * Initialize provider instances from static definitions with user overrides
	 */
	private initializeProviders(): void {
		const userConfig = loadUserConfig();

		for (const def of PROVIDERS) {
			// Apply user override for enabled status
			const isEnabled = userConfig.enabled?.[def.id] ?? def.enabled;

			if (!isEnabled) {
				log.debug({ providerId: def.id }, 'Provider disabled by user config');
				continue;
			}

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
	 * Get the primary provider (user-configured or default)
	 */
	getPrimaryProvider(): CompendiumProvider | undefined {
		// Try user-configured primary first
		const userConfig = loadUserConfig();
		if (userConfig.primary) {
			const primary = this.providers.get(userConfig.primary);
			if (primary) return primary;
		}
		// Fall back to default primary
		const primary = this.providers.get(PRIMARY_PROVIDER_ID);
		if (primary) return primary;
		// Last resort: first enabled
		return this.getEnabledProviders()[0];
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
