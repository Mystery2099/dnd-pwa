export interface CompendiumProvider {
	name: string;
	displayName: string;
	description: string;
	sync: () => Promise<SyncResult>;
	getStats: () => Promise<ProviderStats>;
}

export interface SyncResult {
	success: boolean;
	itemsSynced: number;
	errors: string[];
	duration: number;
}

export interface ProviderStats {
	totalItems: number;
	itemsByType: Record<string, number>;
	lastSync?: Date;
}

export type SyncProgressEvent = {
	provider: string;
	type: string;
	status: 'starting' | 'fetching' | 'transforming' | 'saving' | 'complete' | 'error';
	itemsProcessed: number;
	totalItems?: number;
	message?: string;
	error?: string;
};

export type SyncProgressCallback = (event: SyncProgressEvent) => void;
