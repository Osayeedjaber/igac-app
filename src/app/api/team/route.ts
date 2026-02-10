import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET — Fetch all team members (public)
export async function GET() {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST — Create a new team member (admin only)
export async function POST(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const body = await request.json();

  // Validate required fields
  if (!body.name || !body.role || !body.category) {
    return NextResponse.json({ error: "Missing required fields: name, role, category" }, { status: 400 });
  }

  const validCategories = ['governing_body', 'core_panel', 'head', 'deputy', 'executive', 'ctg_core', 'ctg_head', 'ctg_deputy', 'ctg_executive'];
  if (!validCategories.includes(body.category)) {
    return NextResponse.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
  }

  // Only allow known columns
  const allowedFields = ['name', 'role', 'image', 'department', 'quote', 'description', 'category', 'sort_order', 'socials', 'is_visible'];
  const sanitized: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) sanitized[key] = body[key];
  }

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("team_members")
    .insert(sanitized)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
