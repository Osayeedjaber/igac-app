import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET — Fetch activity logs (admin only)
export async function GET(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const entityType = searchParams.get("entity_type");

  let query = supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (entityType && entityType !== "all") {
    query = query.eq("target_type", entityType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map DB column names to what dashboard expects
  const mapped = (data || []).map((item: Record<string, unknown>) => ({
    id: item.id,
    action: (item.action as string) || "",
    entity_type: (item.target_type as string) || "",
    entity_id: (item.target_id as string) || "",
    entity_name: (item.target_name as string) || "",
    details: item.details || "",
    created_at: item.created_at,
  }));

  return NextResponse.json(mapped);
}

// POST — Log an activity (internal use)
export async function POST(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const body = await request.json();
  const supabase = getServiceSupabase();

  const logEntry = {
    action: body.action,
    target_type: body.entity_type || body.target_type,
    target_id: body.entity_id || body.target_id || "",
    target_name: body.entity_name || body.target_name || "",
    details: body.details || "",
  };

  const { data, error } = await supabase
    .from("activity_log")
    .insert(logEntry)
    .select()
    .single();

  if (error) {
    // Don't fail the request if logging fails
    console.error("Activity log error:", error.message);
    return NextResponse.json({ warning: "Failed to log activity" }, { status: 200 });
  }
  return NextResponse.json(data, { status: 201 });
}

// DELETE — Clear old logs (admin only)
export async function DELETE(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  
  const supabase = getServiceSupabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const { error, count } = await supabase
    .from("activity_log")
    .delete({ count: "exact" })
    .lt("created_at", cutoffDate.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: count || 0 });
}
