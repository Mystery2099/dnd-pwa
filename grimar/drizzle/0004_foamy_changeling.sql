ALTER TABLE `compendium_items` RENAME COLUMN "json_path" TO "json_data";--> statement-breakpoint
ALTER TABLE `compendium_items` ADD `source_publisher` text;--> statement-breakpoint
CREATE INDEX `compendium_items_source_publisher_idx` ON `compendium_items` (`source_publisher`);