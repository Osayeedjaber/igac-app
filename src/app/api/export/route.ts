import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    const str = JSON.stringify(val);
    return `"${str.replace(/"/g, '""')}"`;
  }
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET — Export data as JSON or CSV (admin only)
export async function GET(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const type = searchParams.get("type") || "all";

  try {
    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      version: "1.0",
    };

    // Fetch requested data
    if (type === "all" || type === "team") {
      const { data: team } = await supabase
        .from("team_members")
        .select("*")
        .order("sort_order");
      exportData.team_members = team || [];
    }

    if (type === "all" || type === "events") {
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .order("sort_order");
      exportData.events = events || [];
    }

    if (type === "all" || type === "contacts") {
      const { data: contacts } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      exportData.contact_submissions = contacts || [];
    }

    if (type === "all" || type === "settings") {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      exportData.site_settings = settings || null;
    }

    if (format === "csv") {
      // Convert to CSV format
      let csvContent = "";
      
      if (type === "team" || type === "all") {
        const team = exportData.team_members as Record<string, unknown>[];
        if (team && team.length > 0) {
          const headers = Object.keys(team[0]);
          csvContent += "--- TEAM MEMBERS ---\n";
          csvContent += headers.join(",") + "\n";
          team.forEach((row) => {
            csvContent += headers.map((h) => escapeCsvField(row[h])).join(",") + "\n";
          });
          csvContent += "\n";
        }
      }

      if (type === "events" || type === "all") {
        const events = exportData.events as Record<string, unknown>[];
        if (events && events.length > 0) {
          const headers = Object.keys(events[0]);
          csvContent += "--- EVENTS ---\n";
          csvContent += headers.join(",") + "\n";
          events.forEach((row) => {
            csvContent += headers.map((h) => escapeCsvField(row[h])).join(",") + "\n";
          });
        }
      }

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="igac-export-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Default: JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="igac-export-${type}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
