-- ============================================================
-- IGAC Supabase Migration
-- Run this in the Supabase SQL Editor to sync DB with app code
-- ============================================================

-- 1. Add missing categories to team_members
-- Drop and recreate the check constraint to include 'executive' and 'ctg_executive'
-- First check if there's an enum or check constraint on category
ALTER TABLE team_members
  DROP CONSTRAINT IF EXISTS team_members_category_check;

-- If category uses an enum type, alter it:
DO $$
BEGIN
  -- Try adding values to enum if it exists
  ALTER TYPE team_member_category ADD VALUE IF NOT EXISTS 'executive';
  ALTER TYPE team_member_category ADD VALUE IF NOT EXISTS 'ctg_executive';
EXCEPTION WHEN undefined_object THEN
  -- Enum doesn't exist, it's likely a text column with a check constraint
  NULL;
END $$;

-- If it's a text column with CHECK constraint, re-add it with all values
-- (This is safe to run even if the above enum approach worked)
DO $$
BEGIN
  ALTER TABLE team_members
    ADD CONSTRAINT team_members_category_check
    CHECK (category IN (
      'governing_body', 'core_panel', 'head', 'deputy', 'executive',
      'ctg_core', 'ctg_head', 'ctg_deputy', 'ctg_executive'
    ));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 2. Add missing columns to site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_tagline TEXT DEFAULT 'International Global Affairs Council';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_description TEXT DEFAULT 'The biggest Model United Nations conference in South East Asia.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'intlglobalaffairscouncil@gmail.com';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+880 18153-53082';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS contact_address TEXT DEFAULT 'Dhaka, Bangladesh';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_facebook TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_instagram TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_linkedin TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_twitter TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS social_youtube TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/logo.png';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#d4af37';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_events TEXT DEFAULT '5+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_delegates TEXT DEFAULT '4000+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_years_active TEXT DEFAULT '3+';

-- 3. Create gallery_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  filename TEXT DEFAULT 'unknown',
  folder TEXT DEFAULT 'general',
  alt_text TEXT DEFAULT '',
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  width INTEGER,
  height INTEGER,
  used_in JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ensure site_settings has the default "main" row
INSERT INTO site_settings (id, site_name)
VALUES ('main', 'IGAC')
ON CONFLICT (id) DO NOTHING;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_category ON team_members(category);
CREATE INDEX IF NOT EXISTS idx_team_members_visible ON team_members(is_visible);
CREATE INDEX IF NOT EXISTS idx_team_members_sort ON team_members(sort_order);
CREATE INDEX IF NOT EXISTS idx_events_sort ON events(sort_order);
CREATE INDEX IF NOT EXISTS idx_events_visible ON events(is_visible);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_folder ON gallery_images(folder);

-- 6. Enable RLS on gallery_images (match other tables)
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (dashboard uses service role key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gallery_images' AND policyname = 'Service role full access on gallery_images'
  ) THEN
    CREATE POLICY "Service role full access on gallery_images"
      ON gallery_images
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

SELECT 'Migration complete!' AS result;
