ALTER TABLE delegates ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS sheetdb_url text;
