import { z } from 'zod';

export const FiveEBitsSpellSchema = z.object({
	index: z.string(),
	name: z.string(),
	desc: z.array(z.string()).optional(),
	higher_level: z.string().nullable().optional(),
	range: z.string().optional(),
	components: z.array(z.string()).optional(),
	material: z.string().nullable().optional(),
	ritual: z.boolean().optional(),
	duration: z.string().optional(),
	concentration: z.boolean().optional(),
	casting_time: z.string().optional(),
	level: z.number(),
	school: z
		.object({
			index: z.string(),
			name: z.string()
		})
		.optional(),
	classes: z
		.array(
			z.object({
				index: z.string(),
				name: z.string()
			})
		)
		.optional(),
	subclasses: z
		.array(
			z.object({
				index: z.string(),
				name: z.string()
			})
		)
		.nullable()
		.optional()
});

export const FiveEBitsMonsterSchema = z.object({
	index: z.string(),
	name: z.string(),
	size: z.string().optional(),
	type: z.string().optional(),
	subtype: z.string().nullable().optional(),
	alignment: z.string().optional(),
	armor_class: z.array(z.object({ type: z.string(), value: z.number() })).optional(),
	hit_points: z.number().optional(),
	hit_dice: z.string().optional(),
	speed: z.record(z.string(), z.string()).optional(),
	strength: z.number().optional(),
	dexterity: z.number().optional(),
	constitution: z.number().optional(),
	intelligence: z.number().optional(),
	wisdom: z.number().optional(),
	charisma: z.number().optional(),
	proficiencies: z.array(
		z.object({
			proficiency: z.object({ index: z.string(), name: z.string() }),
			value: z.number()
		})
	).optional(),
	damage_vulnerabilities: z.array(z.string()).optional(),
	damage_resistances: z.array(z.string()).optional(),
	damage_immunities: z.array(z.string()).optional(),
	condition_immunities: z.array(z.string()).optional(),
	senses: z.record(z.string(), z.string()).optional(),
	languages: z.string().optional(),
	challenge_rating: z.string().optional(),
	xp: z.number().optional(),
	special_abilities: z.array(
		z.object({
			name: z.string(),
			desc: z.string(),
			attack_bonus: z.number().optional(),
			damage: z
				.array(
					z.object({
						damage_type: z.object({ index: z.string(), name: z.string() }),
						damage_dice: z.string()
					})
				)
				.optional()
		})
	).optional(),
	actions: z.array(
		z.object({
			name: z.string(),
			desc: z.string(),
			attack_bonus: z.number().optional(),
			damage: z
				.array(
					z.object({
						damage_type: z.object({ index: z.string(), name: z.string() }),
						damage_dice: z.string()
					})
				)
				.optional(),
			multiattack: z.object({ action_name: z.string(), count: z.number() }).optional()
		})
	).optional(),
	legendary_actions: z
		.array(
			z.object({
				name: z.string(),
				desc: z.string(),
				attack_bonus: z.number().optional(),
				damage: z
					.array(
						z.object({
							damage_type: z.object({ index: z.string(), name: z.string() }),
							damage_dice: z.string()
						})
					)
					.optional()
			})
		)
		.optional(),
	reactions: z.array(z.object({ name: z.string(), desc: z.string() })).optional()
});;

export const FiveEBitsFeatSchema = z.object({
	index: z.string(),
	name: z.string(),
	prerequisites: z.array(z.string()).optional(),
	description: z.array(z.string()).optional(),
	ability_score_increases: z
		.array(
			z.object({
				ability_score: z.object({ index: z.string(), name: z.string() }),
				increase: z.number()
			})
		)
		.optional()
});

export const FiveEBitsBackgroundSchema = z.object({
	index: z.string(),
	name: z.string(),
	description: z.array(z.string()).optional(),
	feature: z
		.object({
			name: z.string(),
			description: z.string()
		})
		.optional(),
	skill_proficiencies: z.array(z.string()).optional(),
	tool_proficiencies: z.array(z.string()).optional()
});

export const FiveEBitsRaceSchema = z.object({
	index: z.string(),
	name: z.string(),
	size: z.string().optional(),
	speed: z.number().optional(),
	ability_bonuses: z
		.array(
			z.object({
				ability_score: z.object({ index: z.string(), name: z.string() }),
				bonus: z.number()
			})
		)
		.optional(),
	traits: z.array(z.string()).optional(),
	languages: z.array(z.string()).optional(),
	subraces: z.array(z.string()).optional()
});

export const FiveEBitsClassSchema = z.object({
	index: z.string(),
	name: z.string(),
	hit_die: z.number().optional(),
	proficiency_choices: z
		.array(
			z.object({
				type: z.string(),
				choose: z.number(),
				from: z.array(z.object({ index: z.string(), name: z.string() }))
			})
		)
		.optional(),
	proficiencies: z.array(z.object({ index: z.string(), name: z.string() })).optional(),
	saving_throws: z.array(z.object({ index: z.string(), name: z.string() })).optional(),
	spellcasting: z
		.object({
			level: z.number(),
			ability: z.object({ index: z.string(), name: z.string() }),
			dc: z.number(),
			mod: z.number()
		})
		.optional(),
	subclasses: z.array(z.string()).optional()
});
