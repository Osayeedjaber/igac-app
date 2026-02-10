-- ============================================
-- IGAC Team Members Insert/Update
-- Run this in your Supabase SQL Editor
-- ============================================

-- ═══════════════════════════════════════════
-- 0. First, allow "executive" category
-- ═══════════════════════════════════════════

-- Drop the old constraint
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_category_check;

-- Add new constraint with "executive" included
ALTER TABLE team_members ADD CONSTRAINT team_members_category_check
CHECK (category IN ('governing_body', 'core_panel', 'head', 'deputy', 'executive', 'ctg_core', 'ctg_head', 'ctg_deputy', 'ctg_executive'));

-- ═══════════════════════════════════════════
-- 1. UPDATE existing core panel descriptions
-- ═══════════════════════════════════════════

UPDATE team_members
SET description = 'I am basically all over IGAC. Usually I am a very chill person and hate to talk but when it comes to work I am a different person.'
WHERE name = 'Miftahul Jannat Muntaha' AND category = 'core_panel';

UPDATE team_members
SET description = 'I oversee the overall operations of all departments and ensure effective coordination among them.'
WHERE name = 'Arefin Abir Saad' AND category = 'core_panel';

-- ═══════════════════════════════════════════
-- 2. UPDATE existing deputies descriptions
-- ═══════════════════════════════════════════

UPDATE team_members
SET description = 'Dedicated to my role at IGAC. Beyond my professional commitments, I am passionate about contributing to the well-being of others, exemplifying a strong commitment to service.'
WHERE name ILIKE '%Sheikh Shafqat%' AND category = 'deputy';

UPDATE team_members
SET description = 'I am a motivated and responsible individual with a strong interest in leadership and professional growth. I work well in team environments and value clear communication, discipline, and consistency. I am always eager to learn, improve my skills, and contribute positively to my organization.'
WHERE name ILIKE '%Faizaan Safwan%' AND category = 'deputy';

-- ═══════════════════════════════════════════
-- 3. INSERT new deputies
-- ═══════════════════════════════════════════

INSERT INTO team_members (name, role, image, department, description, category, sort_order, is_visible, socials)
VALUES
(
  'Istihad Islam',
  'Deputy Head of Marketing',
  '/Team/istihadmarketing.jpeg',
  'Marketing',
  'Just the Deputy of Marketing.',
  'deputy',
  (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM team_members WHERE category = 'deputy'),
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
),
(
  'Mehraj Islam',
  'Deputy Head of Public Relations',
  '/Team/mehraj.jpeg',
  'Public Relations',
  'I am a committed and hardworking individual who approaches responsibilities with strategic thinking, organization, and calmness under pressure. I am a confident public speaker who adapts quickly to new environments and works effectively with other people. I value reliability, responsibility, and continuous improvement.',
  'deputy',
  (SELECT COALESCE(MAX(sort_order), 0) + 2 FROM team_members WHERE category = 'deputy'),
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
),
(
  'Mohona',
  'Deputy Head of Delegate Affairs',
  '/Team/mohona.jpeg',
  'Delegate Affairs',
  'I have been working in IGAC for over 2 years and I believe it is truly such an amazing place. I love meeting new people!',
  'deputy',
  (SELECT COALESCE(MAX(sort_order), 0) + 3 FROM team_members WHERE category = 'deputy'),
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
),
(
  'Mahiat Islam Natasha',
  'Deputy Head of Academics',
  '/Team/natasha.jpeg',
  'Academics',
  'Not someone who talks much about what I do, I prefer my work to speak for me. I believe sincerity and consistency matter more than words so I try to reflect that through my work. Values over Vanity.',
  'deputy',
  (SELECT COALESCE(MAX(sort_order), 0) + 4 FROM team_members WHERE category = 'deputy'),
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
);

-- ═══════════════════════════════════════════
-- 4. INSERT new executives
-- First ensure the category is supported
-- ═══════════════════════════════════════════

INSERT INTO team_members (name, role, image, department, description, category, sort_order, is_visible, socials)
VALUES
(
  'Sania Zafor',
  'Executive of Public Relations',
  '/Team/sania.jpeg',
  'Public Relations',
  'I am a curious and motivated individual who enjoys learning, connecting with people, and growing through new experiences.',
  'executive',
  1,
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
),
(
  'Samiya Azad',
  'Executive of Corporate Affairs',
  '/Team/samiya.jpeg',
  'Corporate Affairs',
  'I believe in rebirth not of the soul, but through the lessons life leaves behind. I value honesty, depth, and thoughtful simplicity.',
  'executive',
  2,
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
),
(
  'Ayman Imam',
  'Executive of Delegate Affairs',
  '/Team/ayman.jpeg',
  'Delegate Affairs',
  'I serve as the Executive of Delegate Affairs, overseeing delegate coordination, performance, and engagement. I am committed to maintaining accountability, strengthening communication, and fostering a disciplined, high-performing environment.',
  'executive',
  3,
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
),
(
  'Tahsin Hossain Tabib',
  'Executive of Marketing',
  '/Team/tabib.jpeg',
  'Marketing',
  'IGAC has always been a place where I redefined myself and found my enthusiasm. I am always grateful towards this organization and as a part of this family I wish everyone all the best who are joining us in this journey.',
  'executive',
  4,
  true,
  '{"facebook": "", "instagram": ""}'::jsonb
);

-- ═══════════════════════════════════════════
-- 5. Refresh schema cache
-- ═══════════════════════════════════════════

NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════
-- VERIFY inserts
-- ═══════════════════════════════════════════

SELECT name, role, category, is_visible FROM team_members ORDER BY category, sort_order;
