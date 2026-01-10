ALTER TABLE `compendium_items` ADD `edition` text;
--> statement-breakpoint
ALTER TABLE `compendium_items` ADD `source_book` text;
--> statement-breakpoint
ALTER TABLE `compendium_items` ADD `data_version` text;
--> statement-breakpoint
CREATE INDEX `compendium_items_edition_idx` ON `compendium_items` (`edition`);
--> statement-breakpoint
CREATE INDEX `compendium_items_source_book_idx` ON `compendium_items` (`source_book`);
--> statement-breakpoint
CREATE INDEX `compendium_items_data_version_idx` ON `compendium_items` (`data_version`);
