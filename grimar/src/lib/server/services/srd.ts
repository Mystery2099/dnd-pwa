/**
 * SRD Service Index
 *
 * D&D 5e SRD API integration for spells and monsters.
 * Re-exports from srd/ subdirectory:
 * - srd/client.ts - Shared HTTP client
 * - srd/spells.ts - Spell API
 * - srd/monsters.ts - Monster API
 */

export * from './srd/client';
export * from './srd/spells';
export * from './srd/monsters';
export type { SrdSpell } from './srd/spells';
export type { SrdMonsterSummary } from './srd/monsters';
