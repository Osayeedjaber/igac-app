import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET — Fetch gallery images (admin only)
export async function GET(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  let query = supabase
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (folder && folder !== "all") {
    query = query.eq("folder", folder);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("Gallery fetch error:", error.message);
    return NextResponse.json({ error: "Gallery not available" }, { status: 503 });
  }
  return NextResponse.json(data);
}

// POST — Add image metadata to gallery
export async function POST(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const body = await request.json();
  const supabase = getServiceSupabase();

  const imageData = {
    url: body.url,
    filename: body.filename || body.url.split("/").pop() || "unknown",
    folder: body.folder || "general",
    alt_text: body.alt_text || "",
    file_size: body.file_size || 0,
    mime_type: body.mime_type || "image/jpeg",
    width: body.width || null,
    height: body.height || null,
    used_in: body.used_in || [],
  };

  const { data, error } = await supabase
    .from("gallery_images")
    .insert(imageData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// DELETE — Delete image from gallery
export async function DELETE(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "Missing image ID" }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // Try to delete from storage if it's a Supabase URL
  const { data: imageData } = await supabase
    .from("gallery_images")
    .select("url")
    .eq("id", id)
    .single();

  if (imageData?.url?.includes("supabase")) {
    // Extract path and delete from storage
    const pathMatch = imageData.url.match(/\/images\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from("images").remove([pathMatch[1]]);
    }
  }

  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
