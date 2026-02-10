-- Add statistics columns to site_settings
-- Run this in Supabase SQL Editor

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_events TEXT DEFAULT '5+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_delegates TEXT DEFAULT '4000+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_years_active TEXT DEFAULT '3+';

-- Update the main settings row with default values
UPDATE site_settings
SET
  stat_total_events = COALESCE(stat_total_events, '5+'),
  stat_total_delegates = COALESCE(stat_total_delegates, '4000+'),
  stat_years_active = COALESCE(stat_years_active, '3+')
WHERE id = 'main';

SELECT 'Statistics columns added successfully!' AS result;
