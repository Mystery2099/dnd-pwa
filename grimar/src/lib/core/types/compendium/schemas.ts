/**
 * Zod Validation Schemas
 *
 * Runtime validation for API responses and data transformations.
 * Used to validate external data before processing.
 */

import { z } from 'zod';

// ============================================================================
// Open5e API Schemas
// ============================================================================

export const Open5eSpellSchema = z.object({
	slug: z.string(),
	name: z.string(),
	desc: z.union([z.string(), z.array(z.string())]).optional(),
	higher_level: z.union([z.string(), z.array(z.string())]).optional(),
	level: z.union([z.number(), z.string()]).optional(),
	level_int: z.number().optional(),
	school: z.union([z.string(), z.object({ name: z.string() })]).optional(),
	components: z.union([z.array(z.string()), z.string()]).optional(),
	requires_verbal_components: z.boolean().optional(),
	requires_somatic_components: z.boolean().optional(),
	requires_material_components: z.boolean().optional(),
	material: z.string().optional(),
	can_be_cast_as_ritual: z.boolean().optional(),
	ritual: z.union([z.boolean(), z.string()]).optional(),
	duration: z.string().optional(),
	concentration: z.union([z.boolean(), z.string()]).optional(),
	requires_concentration: z.union([z.boolean(), z.string()]).optional(),
	casting_time: z.string().optional(),
	range: z.string().optional(),
	target_range_sort: z.number().optional(),
	spell_level: z.number().optional(),
	dnd_class: z.string().optional(),
	spell_lists: z.array(z.string()).optional()
});

export const Open5eMonsterSchema = z.object({
	slug: z.string(),
	name: z.string(),
	size: z.string(),
	type: z.string(),
	subtype: z.string().optional(),
	group: z.string().nullable().optional(),
	alignment: z.string().optional(),
	armor_class: z.union([z.number(), z.array(z.object({ type: z.string(), value: z.number() }))]),
	armor_desc: z.string().nullable().optional(),
	hit_points: z.number(),
	hit_dice: z.string(),
	speed: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
	strength: z.number(),
	dexterity: z.number(),
	constitution: z.number(),
	intelligence: z.number(),
	wisdom: z.number(),
	charisma: z.number(),
	skills: z.record(z.string(), z.number()).optional(),
	damage_vulnerabilities: z.string().optional(),
	damage_resistances: z.string().optional(),
	damage_immunities: z.string().optional(),
	condition_immunities: z.string().optional(),
	senses: z.string().optional(),
	languages: z.string().optional(),
	cr: z.number().optional(),
	challenge_rating: z.union([z.number(), z.string()]).optional(),
	actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage_dice: z.string().optional(),
				damage: z.record(z.string(), z.string()).optional()
			})
		)
		.nullable()
		.optional(),
	special_abilities: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional()
			})
		)
		.nullable()
		.optional(),
	legendary_actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional()
			})
		)
		.nullable()
		.optional()
});

export const Open5eItemSchema = z.object({
	slug: z.string(),
	name: z.string(),
	type: z.string().optional(),
	rarity: z.string().optional(),
	description: z.string().optional()
});

export const Open5eListResponseSchema = z.object({
	results: z.array(z.unknown()),
	next: z.string().nullable()
});

// ============================================================================
// SRD GraphQL Schemas
// ============================================================================

export const SrdSpellSchema = z.object({
	index: z.string(),
	name: z.string(),
	level: z.number(),
	school: z.object({ name: z.string() }),
	classes: z.array(z.object({ name: z.string() })).optional(),
	desc: z.array(z.string()),
	higher_level: z.array(z.string()).nullable().optional(),
	range: z.string(),
	components: z.array(z.string()),
	material: z.string().nullable().optional(),
	ritual: z.boolean(),
	duration: z.string(),
	concentration: z.boolean(),
	casting_time: z.string()
});

export const SrdMonsterSummarySchema = z.object({
	index: z.string(),
	name: z.string(),
	type: z.string(),
	size: z.string(),
	challenge_rating: z.number()
});

export const SrdMonsterDetailSchema = SrdMonsterSummarySchema.extend({
	alignment: z.string().optional(),
	subtype: z.string().optional(),
	armor_class: z
		.union([z.number(), z.array(z.object({ type: z.string(), value: z.number() }))])
		.optional(),
	armor_desc: z.string().nullable().optional(),
	hit_points: z.number().optional(),
	hit_dice: z.string().optional(),
	speed: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
	strength: z.number().optional(),
	dexterity: z.number().optional(),
	constitution: z.number().optional(),
	intelligence: z.number().optional(),
	wisdom: z.number().optional(),
	charisma: z.number().optional(),
	skills: z.record(z.string(), z.number()).optional(),
	damage_vulnerabilities: z.string().optional(),
	damage_resistances: z.string().optional(),
	damage_immunities: z.string().optional(),
	condition_immunities: z.string().optional(),
	senses: z.string().optional(),
	languages: z.string().optional(),
	actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage_dice: z.string().optional()
			})
		)
		.optional(),
	special_abilities: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional()
			})
		)
		.optional(),
	legendary_actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional()
			})
		)
		.optional()
});

// ============================================================================
// Homebrew Schema
// ============================================================================

export const HomebrewItemSchema = z.object({
	slug: z.string().optional(),
	index: z.string().optional(),
	id: z.string().optional(),
	name: z.string(),
	level: z.union([z.number(), z.string()]).optional(),
	school: z.union([z.string(), z.object({ name: z.string() })]).optional(),
	size: z.string().optional(),
	type: z.string().optional(),
	challenge_rating: z.union([z.number(), z.string()]).optional()
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Safely parse data with a Zod schema
 * Returns parsed data or throws with descriptive error
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
	const result = schema.safeParse(data);
	if (!result.success) {
		const error = result.error;
		// Note: This is a utility function that may be called from both client and server
		// For server-side validation, use logger directly in the calling code
		throw new Error(`Invalid ${context} data: ${error.message}`);
	}
	return result.data;
}

/**
 * Optional validation - returns null on failure instead of throwing
 */
export function tryValidate<T>(schema: z.ZodType<T>, data: unknown, context: string): T | null {
	const result = schema.safeParse(data);
	if (!result.success) {
		console.warn(`[validation] ${context} validation failed, using raw data`);
		return null;
	}
	return result.data;
}

// ============================================================================
// Type Exports (derived from Zod schemas)
// These are the source of truth for TypeScript types
// ============================================================================

export type Open5eSpell = z.infer<typeof Open5eSpellSchema>;
export type Open5eMonster = z.infer<typeof Open5eMonsterSchema>;
export type Open5eItem = z.infer<typeof Open5eItemSchema>;
export type Open5eListResponse = z.infer<typeof Open5eListResponseSchema>;
export type SrdSpell = z.infer<typeof SrdSpellSchema>;
export type SrdMonsterSummary = z.infer<typeof SrdMonsterSummarySchema>;
export type SrdMonsterDetail = z.infer<typeof SrdMonsterDetailSchema>;
export type HomebrewItem = z.infer<typeof HomebrewItemSchema>;
