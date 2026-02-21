ALTER TABLE `sync_metadata` RENAME COLUMN "items_synced" TO "item_count";--> statement-breakpoint
CREATE TABLE `compendium` (
	`key` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`source` text NOT NULL,
	`document_key` text,
	`document_name` text,
	`gamesystem_key` text,
	`gamesystem_name` text,
	`publisher_key` text,
	`publisher_name` text,
	`description` text,
	`data` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `compendium_type_idx` ON `compendium` (`type`);--> statement-breakpoint
CREATE INDEX `compendium_type_name_idx` ON `compendium` (`type`,`name`);--> statement-breakpoint
CREATE INDEX `compendium_source_idx` ON `compendium` (`source`);--> statement-breakpoint
CREATE INDEX `compendium_document_idx` ON `compendium` (`document_key`);--> statement-breakpoint
CREATE INDEX `compendium_gamesystem_idx` ON `compendium` (`gamesystem_key`);--> statement-breakpoint
CREATE INDEX `compendium_publisher_idx` ON `compendium` (`publisher_key`);--> statement-breakpoint
CREATE INDEX `compendium_name_idx` ON `compendium` (`name`);--> statement-breakpoint
DROP TABLE `abilities`;--> statement-breakpoint
DROP TABLE `alignments`;--> statement-breakpoint
DROP TABLE `background_metadata`;--> statement-breakpoint
DROP TABLE `class_metadata`;--> statement-breakpoint
DROP TABLE `compendium_cache`;--> statement-breakpoint
DROP TABLE `compendium_items`;--> statement-breakpoint
DROP TABLE `condition_metadata`;--> statement-breakpoint
DROP TABLE `creature_metadata`;--> statement-breakpoint
DROP TABLE `creature_types`;--> statement-breakpoint
DROP TABLE `damage_types`;--> statement-breakpoint
DROP TABLE `feat_metadata`;--> statement-breakpoint
DROP TABLE `item_metadata`;--> statement-breakpoint
DROP TABLE `race_metadata`;--> statement-breakpoint
DROP TABLE `sizes`;--> statement-breakpoint
DROP TABLE `skills`;--> statement-breakpoint
DROP TABLE `spell_metadata`;--> statement-breakpoint
DROP TABLE `spell_schools`;--> statement-breakpoint
DROP INDEX `sync_metadata_provider_id_idx`;--> statement-breakpoint
ALTER TABLE `sync_metadata` DROP COLUMN `last_sync_type`;