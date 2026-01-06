/**
 * Provider Registry
 *
 * Central registry for managing compendium data providers.
 * Loads configuration from providers.json and provides access to enabled providers.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
	CompendiumProvider,
	ProviderConfig,
	ProviderSettings,
	ProviderHealthStatus
} from './types';
import { Open5eProvider } from './open5e';
import { FiveEBitsProvider } from './5ebits';
import { SrdProvider } from './srd';
import { HomebrewProvider } from './homebrew';
import { createModuleLogger } from '$lib/server/logger';

const log = createModuleLogger('ProviderRegistry');

/**
 * Provider Registry - Singleton pattern
 *
 * Manages provider lifecycle, configuration, and health status.
 * Follows existing codebase pattern (e.g., MemoryCache)
 */
class ProviderRegistryClass {
	private providers = new Map<string, CompendiumProvider>();
	private config: ProviderConfig;
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
		this.config = this.loadConfig();
		this.initializeProviders();
	}

	/**
	 * Load provider configuration from providers.json
	 * Falls back to default configuration if file doesn't exist
	 */
	private loadConfig(): ProviderConfig {
		const configPath = join(process.cwd(), 'providers.json');

		if (existsSync(configPath)) {
			try {
				const content = readFileSync(configPath, 'utf-8');
				const config = JSON.parse(content) as ProviderConfig;
				log.info('Loaded configuration from providers.json');
				return config;
			} catch (error) {
				log.error({ error }, 'Failed to load providers.json');
			}
		}

		// Default configuration
		const defaultConfig: ProviderConfig = {
			primaryProvider: 'open5e',
			providers: [
				{
					id: 'open5e',
					name: 'Open5e',
					enabled: true,
					type: 'open5e',
					baseUrl: 'https://api.open5e.com',
					supportedTypes: ['spell', 'monster', 'item']
				},
				{
					id: 'srd',
					name: 'D&D 5e SRD',
					enabled: false,
					type: 'srd',
					baseUrl: 'https://www.dnd5eapi.co/api',
					supportedTypes: ['spell', 'monster']
				},
				{
					id: 'homebrew',
					name: 'Homebrew',
					enabled: true,
					type: 'homebrew',
					baseUrl: '',
					supportedTypes: ['spell', 'monster'],
					options: {
						dataPath: 'data/homebrew'
					}
				}
			],
			sync: {
				maxConcurrency: 3,
				retryAttempts: 3,
				retryDelayMs: 1000
			}
		};

		log.info('Using default provider configuration');
		return defaultConfig;
	}

	/**
	 * Initialize provider instances from configuration
	 */
	private initializeProviders(): void {
		for (const settings of this.config.providers) {
			if (!settings.enabled) continue;

			const provider = this.createProvider(settings);
			if (provider) {
				this.providers.set(settings.id, provider);
				log.info({ providerId: settings.id, providerName: provider.name }, 'Registered provider');
			}
		}

		this.initialized = true;
	}

	/**
	 * Create a provider instance from settings
	 */
	private createProvider(settings: ProviderSettings): CompendiumProvider | null {
		try {
			switch (settings.type) {
				case 'open5e':
					return new Open5eProvider(settings.baseUrl || 'https://api.open5e.com');

				case '5e-bits':
					return new FiveEBitsProvider(settings.baseUrl || 'https://api.5e-bits.com');

				case 'srd':
					return new SrdProvider();

				case 'homebrew':
					return new HomebrewProvider(settings.options?.dataPath as string);

				default:
					log.warn({ providerType: settings.type }, 'Unknown provider type');
					return null;
			}
		} catch (error) {
			log.error({ providerId: settings.id, error }, 'Failed to create provider');
			return null;
		}
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
	 * Get the primary provider (first enabled or configured primary)
	 */
	getPrimaryProvider(): CompendiumProvider | undefined {
		// Try configured primary
		if (this.config.primaryProvider) {
			const primary = this.providers.get(this.config.primaryProvider);
			if (primary) return primary;
		}
		// Fall back to first enabled
		return this.getEnabledProviders()[0];
	}

	/**
	 * Get sync configuration
	 */
	getSyncConfig() {
		return (
			this.config.sync || {
				maxConcurrency: 3,
				retryAttempts: 3,
				retryDelayMs: 1000
			}
		);
	}

	/**
	 * Reload configuration from file
	 */
	reloadConfig(): void {
		this.providers.clear();
		this.config = this.loadConfig();
		this.initializeProviders();
		log.info('Configuration reloaded');
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
