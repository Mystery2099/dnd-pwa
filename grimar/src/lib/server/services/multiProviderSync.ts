/**
 * Multi-Provider Sync Service
 *
 * Syncs compendium data from all enabled providers into the local database.
 * Uses the provider registry to manage multiple data sources (Open5e, SRD, Homebrew).
 *
 * This module re-exports from the sync/ subdirectory for backward compatibility.
 * See individual files for implementation details:
 * - sync/orchestrator.ts - Main sync orchestration
 * - sync/retry.ts - Exponential backoff retry logic
 * - sync/metrics.ts - Sync metrics tracking
 */

// Re-export from sync subdirectory
export * from './sync/orchestrator';
export * from './sync/retry';
export * from './sync/metrics';

// Types for external consumers
export type { SyncMetrics } from './sync/metrics';
