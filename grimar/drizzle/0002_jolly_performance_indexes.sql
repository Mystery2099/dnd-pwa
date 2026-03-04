CREATE INDEX IF NOT EXISTS `compendium_class_subclass_null_idx`
ON `compendium` (`type`)
WHERE json_extract(`data`, '$.subclass_of') IS NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `compendium_class_subclass_not_null_idx`
ON `compendium` (`type`)
WHERE json_extract(`data`, '$.subclass_of') IS NOT NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `compendium_creature_type_idx`
ON `compendium` (`type`, LOWER(json_extract(`data`, '$.type')));--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `compendium_spell_level_idx`
ON `compendium` (`type`, CAST(json_extract(`data`, '$.level') AS INTEGER));--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `compendium_spell_school_idx`
ON `compendium` (`type`, LOWER(json_extract(`data`, '$.school')));--> statement-breakpoint

CREATE INDEX IF NOT EXISTS `compendium_creature_cr_decimal_idx`
ON `compendium` (`type`, CAST(json_extract(`data`, '$.challenge_rating_decimal') AS REAL));
