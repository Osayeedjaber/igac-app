import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !resendKey) {
      console.error("Missing credentials in invite-secretariat route");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendKey);
    
    const { email, full_name, role, committee } = await req.json();

    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and Full Name are required." }, { status: 400 });
    }

    // 2. Generate a secure unique invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

    // 3. Store invite in Supabase
    // We'll use a table called 'secretariat_invites'
    // If it doesn't exist, this might fail, but let's assume standard structure or handle error
    const { error: inviteErr } = await supabase
      .from("secretariat_invites")
      .insert({
        email: email.toLowerCase(),
        full_name,
        role: role || "Secretariat",
        committee: committee || "General",
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (inviteErr) {
      console.error("Invite DB Error:", inviteErr);
      return NextResponse.json({ error: "Failed to create invitation in database." }, { status: 500 });
    }

    // 4. Send Email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://igac.info'}/portal/setup?token=${token}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f2c45f;">Hello ${full_name},</h2>
        <p>You have been invited to join the <strong>Room Coordinator Team</strong>.</p>
        <p>You have been given access to the <strong>Scanner Portal</strong>. To get started, please click the button below to set up your account credentials.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up My Account</a>
        </div>

        <p style="font-size: 12px; color: #666;">This invitation link is unique to you and will expire in 48 hours. Please do not share this link with anyone else.</p>
        <hr/>
        <p style="font-size: 14px;">sincerely,<br/>Osayeed Zaber</p>
      </div>
    `;

    const { data: resendData, error: resendErr } = await resend.emails.send({
      from: "IGAC Secretariat Affairs <secretariat@igac.info>",
      to: email,
      subject: `Invitation: Join IGAC Secretariat Team`,
      html: htmlContent,
    });

    if (resendErr) {
      return NextResponse.json({ error: resendErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Invitation sent successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
