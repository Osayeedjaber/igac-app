import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET — Fetch all events (public)
export async function GET() {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST — Create a new event (admin only)
export async function POST(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const body = await request.json();

  // Validate required fields
  if (!body.title) {
    return NextResponse.json({ error: "Missing required field: title" }, { status: 400 });
  }

  // Only allow known columns
  const allowedFields = ['title', 'subtitle', 'date', 'year', 'month', 'location', 'image', 'description', 'division', 'tag', 'stats', 'highlights', 'sort_order', 'featured', 'is_visible'];
  const sanitized: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) sanitized[key] = body[key];
  }

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("events")
    .insert(sanitized)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
