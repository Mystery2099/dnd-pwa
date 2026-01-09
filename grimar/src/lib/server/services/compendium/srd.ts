/**
 * SRD Service Index
 *
 * D&D 5e SRD API integration for spells and monsters.
 * Re-exports from srd/ subdirectory:
 * - srd/client.ts - Shared HTTP client
 * - srd/spells.ts - Spell API
 * - srd/monsters.ts - Monster API
 * - srd/subclasses.ts - Subclass API
 * - srd/subraces.ts - Subrace API
 * - srd/traits.ts - Trait API
 * - srd/conditions.ts - Condition API
 * - srd/features.ts - Feature API
 * - srd/skills.ts - Skill API
 * - srd/languages.ts - Language API
 * - srd/alignments.ts - Alignment API
 * - srd/proficiencies.ts - Proficiency API
 * - srd/ability-scores.ts - Ability Score API
 * - srd/damage-types.ts - Damage Type API
 * - srd/magic-schools.ts - Magic School API
 * - srd/equipment.ts - Equipment API
 * - srd/weapon-properties.ts - Weapon Property API
 * - srd/equipment-categories.ts - Equipment Category API
 * - srd/vehicles.ts - Vehicle API
 * - srd/monster-types.ts - Monster Type API
 * - srd/rule-sections.ts - Rule Section API
 * - srd/rules.ts - Rule API
 */

export * from '../srd/client';
export * from '../srd/spells';
export * from '../srd/monsters';
export * from '../srd/subclasses';
export * from '../srd/subraces';
export * from '../srd/traits';
export * from '../srd/conditions';
export * from '../srd/features';
export * from '../srd/skills';
export * from '../srd/languages';
export * from '../srd/alignments';
export * from '../srd/proficiencies';
export * from '../srd/ability-scores';
export * from '../srd/damage-types';
export * from '../srd/magic-schools';
export * from '../srd/equipment';
export * from '../srd/weapon-properties';
export * from '../srd/equipment-categories';
export * from '../srd/vehicles';
export * from '../srd/monster-types';
export * from '../srd/rule-sections';
export * from '../srd/rules';
export type { SrdSpell } from '../srd/spells';
export type { SrdMonsterSummary } from '../srd/monsters';
