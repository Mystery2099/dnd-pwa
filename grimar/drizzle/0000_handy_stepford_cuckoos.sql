CREATE TABLE `characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`portrait_url` text,
	`stats` text NOT NULL,
	`inventory` text NOT NULL,
	`spells` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `characters_owner_idx` ON `characters` (`owner`);--> statement-breakpoint
CREATE INDEX `characters_name_idx` ON `characters` (`name`);--> statement-breakpoint
CREATE TABLE `compendium_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `compendium_cache_type_idx` ON `compendium_cache` (`type`);--> statement-breakpoint
CREATE TABLE `compendium_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`type` text NOT NULL,
	`external_id` text,
	`name` text NOT NULL,
	`summary` text,
	`details` text NOT NULL,
	`json_path` text,
	`spell_level` integer,
	`spell_school` text,
	`challenge_rating` text,
	`monster_size` text,
	`monster_type` text,
	`class_hit_die` integer,
	`race_size` text,
	`race_speed` integer,
	`background_feature` text,
	`background_skill_proficiencies` text,
	`feat_prerequisites` text,
	`created_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_items_external` ON `compendium_items` (`type`,`external_id`);--> statement-breakpoint
CREATE INDEX `compendium_items_type_idx` ON `compendium_items` (`type`);--> statement-breakpoint
CREATE INDEX `compendium_items_name_idx` ON `compendium_items` (`name`);--> statement-breakpoint
CREATE INDEX `compendium_items_type_name_idx` ON `compendium_items` (`type`,`name`);--> statement-breakpoint
CREATE INDEX `compendium_items_created_by_idx` ON `compendium_items` (`created_by`);--> statement-breakpoint
CREATE INDEX `compendium_items_spell_level_idx` ON `compendium_items` (`spell_level`);--> statement-breakpoint
CREATE INDEX `compendium_items_spell_school_idx` ON `compendium_items` (`spell_school`);--> statement-breakpoint
CREATE INDEX `compendium_items_type_level_school_idx` ON `compendium_items` (`type`,`spell_level`,`spell_school`);--> statement-breakpoint
CREATE INDEX `compendium_items_challenge_rating_idx` ON `compendium_items` (`challenge_rating`);--> statement-breakpoint
CREATE INDEX `compendium_items_monster_size_idx` ON `compendium_items` (`monster_size`);--> statement-breakpoint
CREATE INDEX `compendium_items_monster_type_idx` ON `compendium_items` (`monster_type`);--> statement-breakpoint
CREATE INDEX `compendium_items_class_hit_die_idx` ON `compendium_items` (`class_hit_die`);--> statement-breakpoint
CREATE INDEX `compendium_items_race_size_idx` ON `compendium_items` (`race_size`);--> statement-breakpoint
CREATE INDEX `compendium_items_background_feature_idx` ON `compendium_items` (`background_feature`);--> statement-breakpoint
CREATE INDEX `compendium_items_feat_prerequisites_idx` ON `compendium_items` (`feat_prerequisites`);--> statement-breakpoint
CREATE TABLE `sync_metadata` (
	`provider_id` text PRIMARY KEY NOT NULL,
	`last_sync_at` integer,
	`last_sync_type` text,
	`items_synced` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `sync_metadata_provider_id_idx` ON `sync_metadata` (`provider_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`settings` text NOT NULL
);
