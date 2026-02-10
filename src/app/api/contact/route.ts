import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET — Fetch contact submissions (admin only)
export async function GET(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map DB schema to what dashboard expects
  const mapped = (data || []).map((item: Record<string, unknown>) => {
    const nameParts = ((item.name as string) || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return {
      id: item.id,
      first_name: firstName,
      last_name: lastName,
      email: item.email,
      phone: '',
      subject: item.subject || 'General Inquiry',
      message: item.message,
      status: item.status || 'unread',
      notes: '',
      created_at: item.created_at,
    };
  });

  return NextResponse.json(mapped);
}

// POST — Create a new contact submission (public)
export async function POST(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const supabase = getServiceSupabase();

  // Validate required fields - support both formats
  const name = body.name || `${body.first_name || ''} ${body.last_name || ''}`.trim();
  if (!name || !body.email || !body.message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const submission = {
    name: name,
    email: body.email,
    subject: body.subject || "General Inquiry",
    message: body.message,
    status: "unread",
  };

  const { data, error } = await supabase
    .from("contact_submissions")
    .insert(submission)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
