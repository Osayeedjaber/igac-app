import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// PUT — Update a contact submission (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const supabase = getServiceSupabase();

  // Only update columns that exist in the actual database
  const allowedColumns = ['name', 'email', 'subject', 'message', 'status'];
  const updateData: Record<string, unknown> = {};

  for (const col of allowedColumns) {
    if (body[col] !== undefined) {
      updateData[col] = body[col];
    }
  }

  // Handle first_name/last_name from dashboard -> name in DB
  if (body.first_name !== undefined || body.last_name !== undefined) {
    updateData.name = `${body.first_name || ''} ${body.last_name || ''}`.trim();
  }

  const { data, error } = await supabase
    .from("contact_submissions")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map response back to dashboard format
  const nameParts = ((data?.name as string) || '').split(' ');
  return NextResponse.json({
    id: data?.id,
    first_name: nameParts[0] || '',
    last_name: nameParts.slice(1).join(' ') || '',
    email: data?.email,
    phone: '',
    subject: data?.subject || 'General Inquiry',
    message: data?.message,
    status: data?.status || 'unread',
    notes: '',
    created_at: data?.created_at,
  });
}

// DELETE — Delete a contact submission (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const { id } = await params;
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from("contact_submissions")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
