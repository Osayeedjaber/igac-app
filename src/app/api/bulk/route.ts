import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// POST — Bulk actions on team members or events (admin only)
export async function POST(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const body = await request.json();
  const { action, entity_type, ids } = body;

  if (!action || !entity_type || !ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate that all IDs are strings (UUIDs)
  if (!ids.every((id: unknown) => typeof id === "string" && id.length > 0)) {
    return NextResponse.json({ error: "Invalid IDs: all must be non-empty strings" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const table = entity_type === "team" ? "team_members" : entity_type === "events" ? "events" : null;

  if (!table) {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }

  try {
    let result;

    switch (action) {
      case "delete":
        result = await supabase
          .from(table)
          .delete()
          .in("id", ids);
        break;

      case "hide":
        result = await supabase
          .from(table)
          .update({ is_visible: false })
          .in("id", ids);
        break;

      case "show":
        result = await supabase
          .from(table)
          .update({ is_visible: true })
          .in("id", ids);
        break;

      case "feature":
        if (entity_type !== "events") {
          return NextResponse.json({ error: "Feature action only applies to events" }, { status: 400 });
        }
        result = await supabase
          .from(table)
          .update({ featured: true })
          .in("id", ids);
        break;

      case "unfeature":
        if (entity_type !== "events") {
          return NextResponse.json({ error: "Unfeature action only applies to events" }, { status: 400 });
        }
        result = await supabase
          .from(table)
          .update({ featured: false })
          .in("id", ids);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      affected: ids.length,
      action,
      entity_type 
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
