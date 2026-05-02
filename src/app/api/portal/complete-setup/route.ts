import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { token, password, username } = await req.json();

    if (!token || !password || !username) {
      return NextResponse.json({ error: "Token, password, and username are required." }, { status: 400 });
    }

    // 1. Check if Supabase variables are present
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("CRITICAL: Supabase environment variables missing in /api/portal/complete-setup");
      return NextResponse.json({ error: "Server configuration error (Supabase)" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify token again
    const { data: invite, error: fetchErr } = await supabase
      .from("secretariat_invites")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (fetchErr || !invite) {
      console.error("Post-verification token fetch failed:", fetchErr?.message);
      return NextResponse.json({ error: "Invalid invitation." }, { status: 404 });
    }

    // 2. Handle User Creation/Update in Supabase Auth
    // First, check if the user already exists in Auth using listUsers
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("List users error:", listError);
      return NextResponse.json({ error: "Failed to verify account status" }, { status: 500 });
    }

    const existingUser = users.find(u => u.email === invite.email);

    let authData;
    let authErr;

    if (existingUser) {
      // If user exists, update their password and metadata instead of creating
      const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: password,
        user_metadata: { 
          full_name: invite.full_name,
          username: username,
          role: invite.role,
          committee: invite.committee
        }
      });
      authData = data;
      authErr = error;
    } else {
      // Create new user
      const { data, error } = await supabase.auth.admin.createUser({
        email: invite.email,
        password: password,
        email_confirm: true,
        user_metadata: { 
          full_name: invite.full_name,
          username: username,
          role: invite.role,
          committee: invite.committee
        }
      });
      authData = data;
      authErr = error;
    }

    if (authErr) {
      console.error("Auth Management Error:", authErr);
      return NextResponse.json({ error: authErr.message }, { status: 500 });
    }

    // 3. Create or Update Profile in public.secretariat_profiles
    const userId = authData?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Auth user creation failed (no ID)" }, { status: 500 });
    }

    const { error: profileErr } = await supabase
      .from("secretariat_profiles")
      .upsert({
        id: userId,
        full_name: invite.full_name,
        username: username,
        role: invite.role,
        email: invite.email
      });

    if (profileErr) {
      console.error("Profile Create Error:", profileErr);
      return NextResponse.json({ error: "Failed to create profile: " + profileErr.message }, { status: 500 });
    }

    // 4. CLEANUP: Delete the invitation after successful profile creation
    // This effectively "shifts" the record from invitations to profiles
    const { error: deleteErr } = await supabase
      .from("secretariat_invites")
      .delete()
      .eq("id", invite.id);

    if (deleteErr) {
      console.error("Failed to delete invite after setup:", deleteErr);
      // We don't block the user, as they are already created
    }

    return NextResponse.json({ success: true, message: "Account created successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
