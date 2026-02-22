import { open5eProvider } from './open5e';
import type { CompendiumProvider } from './types';

export const providers: Record<string, CompendiumProvider> = {
	open5e: open5eProvider
};

export function getProvider(name: string): CompendiumProvider | undefined {
	return providers[name];
}

export function getAllProviders(): CompendiumProvider[] {
	return Object.values(providers);
}

export { open5eProvider } from './open5e';
export type {
	CompendiumProvider,
	SyncResult,
	ProviderStats,
	SyncProgressEvent,
	SyncProgressCallback
} from './types';
