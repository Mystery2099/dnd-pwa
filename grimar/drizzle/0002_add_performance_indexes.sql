-- Add performance indexes for compendium queries
CREATE INDEX IF NOT EXISTS `characters_owner_idx` ON `characters` (`owner`);
CREATE INDEX IF NOT EXISTS `characters_name_idx` ON `characters` (`name`);
CREATE INDEX IF NOT EXISTS `compendium_items_type_idx` ON `compendium_items` (`type`);
CREATE INDEX IF NOT EXISTS `compendium_items_name_idx` ON `compendium_items` (`name`);
CREATE INDEX IF NOT EXISTS `compendium_items_type_name_idx` ON `compendium_items` (`type`,`name`);
CREATE INDEX IF NOT EXISTS `compendium_items_created_by_idx` ON `compendium_items` (`created_by`);
CREATE INDEX IF NOT EXISTS `compendium_cache_type_idx` ON `compendium_cache` (`type`);