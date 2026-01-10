// Compendium Service Layer
// Re-exports for convenient importing

export { compendiumService, type CompendiumServiceInterface } from './service';
export {
	transformToUnified,
	transformToUnifiedSpell,
	transformToUnifiedMonster,
	transformToUnifiedFeat,
	transformToUnifiedBackground,
	transformToUnifiedRace,
	transformToUnifiedClass,
	transformToUnifiedItem
} from './transformers';
export type {
	UnifiedCompendiumItem,
	UnifiedSpell,
	UnifiedMonster,
	UnifiedFeat,
	UnifiedBackground,
	UnifiedRace,
	UnifiedClass,
	UnifiedItem,
	PaginatedUnifiedResult,
	NavigationResult,
	SpellFilters,
	MonsterFilters,
	CompendiumFilters
} from '$lib/core/types/compendium/unified';
