/**
 * Sync Progress Events
 *
 * Types for real-time progress tracking during compendium sync.
 */

import type { CompendiumTypeName } from '$lib/core/types/compendium';

export type SyncProgressPhase =
	| 'provider:start'
	| 'provider:complete'
	| 'fetch:start'
	| 'fetch:complete'
	| 'transform:start'
	| 'transform:progress'
	| 'transform:complete'
	| 'insert:start'
	| 'insert:progress'
	| 'insert:complete'
	| 'error';

export interface SyncProgressEvent {
	/** Current phase of the sync operation */
	phase: SyncProgressPhase;
	/** Provider identifier (e.g., 'open5e', 'srd') */
	providerId: string;
	/** Human-readable provider name */
	providerName: string;
	/** Compendium type being processed */
	type?: CompendiumTypeName;
	/** Current count (items processed so far) */
	current?: number;
	/** Total count (expected items) */
	total?: number;
	/** Error message if phase is 'error' */
	error?: string;
	/** Timestamp of the event */
	timestamp: Date;
}

export type SyncProgressCallback = (event: SyncProgressEvent) => void | Promise<void>;
