CREATE TABLE `sync_metadata` (
	`provider_id` text PRIMARY KEY NOT NULL,
	`last_sync_at` integer,
	`last_sync_type` text,
	`items_synced` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `sync_metadata_provider_id_idx` ON `sync_metadata` (`provider_id`);