ALTER TABLE `compendium_items` ADD `spell_level` integer;--> statement-breakpoint
ALTER TABLE `compendium_items` ADD `spell_school` text;--> statement-breakpoint
ALTER TABLE `compendium_items` ADD `challenge_rating` text;--> statement-breakpoint
ALTER TABLE `compendium_items` ADD `monster_size` text;--> statement-breakpoint
ALTER TABLE `compendium_items` ADD `monster_type` text;--> statement-breakpoint
CREATE INDEX `compendium_items_spell_level_idx` ON `compendium_items` (`spell_level`);--> statement-breakpoint
CREATE INDEX `compendium_items_spell_school_idx` ON `compendium_items` (`spell_school`);--> statement-breakpoint
CREATE INDEX `compendium_items_type_level_school_idx` ON `compendium_items` (`type`,`spell_level`,`spell_school`);--> statement-breakpoint
CREATE INDEX `compendium_items_challenge_rating_idx` ON `compendium_items` (`challenge_rating`);--> statement-breakpoint
CREATE INDEX `compendium_items_monster_size_idx` ON `compendium_items` (`monster_size`);--> statement-breakpoint
CREATE INDEX `compendium_items_monster_type_idx` ON `compendium_items` (`monster_type`);