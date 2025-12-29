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
	`created_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_items_external` ON `compendium_items` (`type`,`external_id`);--> statement-breakpoint
CREATE INDEX `compendium_items_type_idx` ON `compendium_items` (`type`);--> statement-breakpoint
CREATE INDEX `compendium_items_name_idx` ON `compendium_items` (`name`);--> statement-breakpoint
CREATE INDEX `compendium_items_type_name_idx` ON `compendium_items` (`type`,`name`);--> statement-breakpoint
CREATE INDEX `compendium_items_created_by_idx` ON `compendium_items` (`created_by`);--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`settings` text NOT NULL
);
