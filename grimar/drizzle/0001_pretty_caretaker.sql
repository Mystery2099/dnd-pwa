DROP INDEX `compendium_items_external`;--> statement-breakpoint
CREATE UNIQUE INDEX `compendium_items_external` ON `compendium_items` (`type`,`source`,`external_id`);