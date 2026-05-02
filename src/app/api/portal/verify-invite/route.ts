import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    // 1. Check if Supabase variables are present
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("CRITICAL: Supabase environment variables missing in /api/portal/verify-invite");
      return NextResponse.json({ error: "Server configuration error (Supabase)" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: invite, error } = await supabase
      .from("secretariat_invites")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (error || !invite) {
      console.error("Verify Invite Error:", error?.message);
      return NextResponse.json({ error: "Invitation not found or already used." }, { status: 404 });
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Invitation has expired." }, { status: 410 });
    }

    return NextResponse.json({ 
      valid: true, 
      email: invite.email,
      full_name: invite.full_name 
    });
  } catch (err) {
    console.error("Verify Invite Crash:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
