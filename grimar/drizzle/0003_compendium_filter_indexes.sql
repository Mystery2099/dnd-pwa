CREATE INDEX IF NOT EXISTS compendium_type_spell_level_name_idx ON compendium (type, json_extract(data, '$.level'), name);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS compendium_type_spell_school_name_idx ON compendium (type, LOWER(json_extract(data, '$.school')), name);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS compendium_type_creature_type_name_idx ON compendium (type, LOWER(COALESCE(json_extract(data, '$.type.key'), json_extract(data, '$.type.name'), json_extract(data, '$.type'))), name);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS compendium_type_challenge_rating_name_idx ON compendium (type, CAST(json_extract(data, '$.challenge_rating_decimal') AS REAL), name);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS compendium_type_subclass_name_idx ON compendium (type, json_extract(data, '$.subclass_of'), name);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS compendium_type_created_at_idx ON compendium (type, created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS compendium_type_updated_at_idx ON compendium (type, updated_at);
