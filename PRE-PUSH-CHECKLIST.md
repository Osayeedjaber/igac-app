# Pre-Push Checklist ✅

## Database Migration Required

**CRITICAL:** Run these SQL commands in Supabase SQL Editor **before** deploying:

```sql
-- Run the full migration (recommended)
-- Copy and paste the entire content of supabase-migration.sql

-- OR run just the new columns:
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_events TEXT DEFAULT '5+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_total_delegates TEXT DEFAULT '4000+';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS stat_years_active TEXT DEFAULT '3+';

-- Verify the columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'site_settings' AND column_name LIKE 'stat_%';
```

## Environment Variables

Ensure these are set in your deployment environment (Vercel/Railway/etc.):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ADMIN_PASSWORD=your_secure_password
```

## Admin Dashboard Access

⚠️ **IMPORTANT:** After deploying, you MUST log out and log back into the admin dashboard because the authentication system changed from plaintext to SHA-256 hashed tokens.

1. Go to `/admin`
2. Log out if already logged in
3. Log in with your `ADMIN_PASSWORD`
4. The new token will be generated

## What Was Fixed/Added

### Security Fixes
- ✅ Fixed critical auth bypass (missing `await` on `verifyAdmin` in 3 routes)
- ✅ Changed from plaintext password to SHA-256 hashed tokens
- ✅ Added rate limiting to admin login (5 attempts per 15 minutes)
- ✅ Added input validation on all API routes
- ✅ Added CSV field escaping for exports
- ✅ Sanitized API inputs with allowedFields whitelists

### Database Schema Fixes
- ✅ Added missing categories: `executive`, `ctg_executive`
- ✅ Added `gallery_images` table support
- ✅ Added extended `site_settings` columns (social links, contact info, stats)
- ✅ Added `announcement` column to site_settings
- ✅ Made all DB queries resilient to missing columns

### Features Added
- ✅ **Editable Statistics** — Dashboard can now edit Total Events, Total Delegates, Years Active
- ✅ **Event Sort Order** — Events now have full priority management (up/down arrows, manual sort_order, reindex button)
- ✅ **Events Display** — Events page now respects database sort_order (not hardcoded by year)
- ✅ **Hardcoded President** — Homepage always shows Al Rashidus Sabru Farabi regardless of DB
- ✅ **Activity Logging** — All dashboard actions are now logged properly
- ✅ **Maintenance Mode** — Fully functional, redirects all public pages when enabled

### Bug Fixes
- ✅ Fixed "Cannot read properties of undefined (reading 'replace')" in activity logs
- ✅ Fixed settings save errors ("Could not find 'announcement' column")
- ✅ Fixed "HQ Global" → changed to "Dhaka" for events
- ✅ Fixed social links from "#" to real IGAC URLs
- ✅ Fixed external Link tags to use <a> tags instead
- ✅ Fixed event image path from "/past events/" to "/past-events/"
- ✅ Fixed team members and events to use Supabase data (not static files)

## Pages Using Supabase Data

All these pages now fetch from Supabase (with static fallbacks):
- ✅ Homepage (team, stats)
- ✅ About page (team, president)
- ✅ Team page (all team members)
- ✅ Events page (events, stats, sort_order)
- ✅ CTG page (CTG team)
- ✅ Settings (maintenance mode, stats, social links)

## Testing After Deploy

1. **Public Pages**
   - [ ] Homepage loads and shows correct president
   - [ ] Events page shows events in correct sort_order
   - [ ] Stats display correctly (configurable from dashboard)

2. **Admin Dashboard**
   - [ ] Log in with new token system
   - [ ] Team member CRUD works
   - [ ] Event reordering works (up/down, manual sort_order)
   - [ ] Settings save works (stats, social links, maintenance mode)
   - [ ] Activity log shows all actions

3. **Maintenance Mode**
   - [ ] Enable maintenance mode in dashboard settings
   - [ ] Visit homepage → should redirect to /maintenance
   - [ ] Admin dashboard still accessible at /admin
   - [ ] Disable maintenance mode → homepage works again

## Known Issues / Notes

- Old activity log entries may have null `action` or `entity_type` — these are now handled gracefully
- If you see "Supabase unavailable" console warnings, the app falls back to static data (check your env vars)
- The `gallery_images` table is optional — dashboard won't crash if it doesn't exist yet

## Files to Commit

Key new/modified files:
- `middleware.ts` (maintenance mode)
- `src/lib/admin-auth.ts` (new SHA-256 auth)
- `src/lib/data.ts` (Supabase-first data layer)
- `src/lib/database.types.ts` (updated types)
- `src/app/api/` (all routes have security fixes)
- `src/app/admin/dashboard/page.tsx` (event reordering, stats UI)
- `src/app/events/EventsClient.tsx` (sort_order support)
- `src/components/sections/impact.tsx` (stats from DB)
- `supabase-migration.sql` (full DB migration)
- `add-stats-columns.sql` (quick stats columns only)

## Build Status

✅ TypeScript: No errors
✅ Production build: Success
✅ All routes compile successfully

---

**Ready to push!** Just remember to run the SQL migration after deploying.
