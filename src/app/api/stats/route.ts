import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type TeamRow = { id: string; is_visible: boolean; category: string };
type EventRow = { id: string; is_visible: boolean; featured: boolean };
type ContactRow = { id: string; status: string };

// GET — Fetch dashboard stats (admin only)
export async function GET(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const supabase = getServiceSupabase();

  try {
    // Fetch all stats in parallel
    const [
      teamResult,
      eventsResult,
      contactsResult,
      activityResult,
    ] = await Promise.all([
      supabase.from("team_members").select("id, is_visible, category", { count: "exact" }),
      supabase.from("events").select("id, is_visible, featured", { count: "exact" }),
      supabase.from("contact_submissions").select("id, status", { count: "exact" }),
      supabase.from("activity_log").select("id", { count: "exact" }).limit(1),
    ]);

    // Gallery table may not exist yet — query separately
    let galleryCount = 0;
    try {
      const galleryResult = await supabase.from("gallery_images").select("id", { count: "exact" }).limit(1);
      galleryCount = galleryResult.count || 0;
    } catch {
      // gallery_images table doesn't exist yet
    }

    const team = (teamResult.data || []) as TeamRow[];
    const events = (eventsResult.data || []) as EventRow[];
    const contacts = (contactsResult.data || []) as ContactRow[];

    // Calculate stats
    const stats = {
      team: {
        total: team.length,
        visible: team.filter((t) => t.is_visible).length,
        hidden: team.filter((t) => !t.is_visible).length,
        byCategory: {
          governing_body: team.filter((t) => t.category === "governing_body").length,
          core_panel: team.filter((t) => t.category === "core_panel").length,
          head: team.filter((t) => t.category === "head").length,
          deputy: team.filter((t) => t.category === "deputy").length,
          executive: team.filter((t) => t.category === "executive").length,
          ctg_core: team.filter((t) => t.category === "ctg_core").length,
          ctg_head: team.filter((t) => t.category === "ctg_head").length,
          ctg_deputy: team.filter((t) => t.category === "ctg_deputy").length,
          ctg_executive: team.filter((t) => t.category === "ctg_executive").length,
        },
      },
      events: {
        total: events.length,
        visible: events.filter((e) => e.is_visible).length,
        hidden: events.filter((e) => !e.is_visible).length,
        featured: events.filter((e) => e.featured).length,
      },
      contacts: {
        total: contacts.length,
        unread: contacts.filter((c) => c.status === "unread").length,
        read: contacts.filter((c) => c.status === "read").length,
        replied: contacts.filter((c) => c.status === "replied").length,
        archived: contacts.filter((c) => c.status === "archived").length,
      },
      activity: {
        total: activityResult.count || 0,
      },
      gallery: {
        total: galleryCount,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
