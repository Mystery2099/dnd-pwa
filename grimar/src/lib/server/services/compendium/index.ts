// Compendium Service Layer
// Re-exports for convenient importing

export { compendiumService, type CompendiumServiceInterface } from './service';
export {
	transformToUnified,
	transformToUnifiedSpell,
	transformToUnifiedCreature,
	transformToUnifiedFeat,
	transformToUnifiedBackground,
	transformToUnifiedRace,
	transformToUnifiedClass,
	transformToUnifiedItem
} from './transformers';
export type {
	UnifiedCompendiumItem,
	UnifiedSpell,
	UnifiedCreature,
	UnifiedFeat,
	UnifiedBackground,
	UnifiedRace,
	UnifiedClass,
	UnifiedItem,
	PaginatedUnifiedResult,
	NavigationResult,
	SpellFilters,
	CreatureFilters,
	CompendiumFilters
} from '$lib/core/types/compendium/unified';
