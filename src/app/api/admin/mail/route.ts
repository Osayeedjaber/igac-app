import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import QRCode from "qrcode";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { delegateId } = await req.json();

    if (!delegateId) {
      return NextResponse.json({ error: "Missing delegate ID." }, { status: 400 });
    }

    // 1. Fetch delegate & Enforce Concurrency Lock via SQL (Service Role)
    const { data: delegate, error: fetchErr } = await supabase
      .from("delegates")
      .select("*")
      .eq("id", delegateId)
      .single();

    if (fetchErr || !delegate) {
      return NextResponse.json({ error: "Delegate not found." }, { status: 404 });
    }

    if (delegate.mail_status === "PROCESSING") {
      return NextResponse.json({ error: "Mail already processing for this delegate." }, { status: 429 });
    }

    if (delegate.mail_status === "SENT") {
      return NextResponse.json({ error: "Mail was already sent for this delegate." }, { status: 409 });
    }

    // Update status to PROCESSING
    await supabase
      .from("delegates")
      .update({ mail_status: "PROCESSING" })
      .eq("id", delegateId);

    // 2. Build Mail Template
    // (Template remains the same as before)
    });

    // 3. Generate QR Code Server-Side (High Error Correction for better scanning)
    const qrDataUri = await QRCode.toDataURL(delegate.qr_token, {
      margin: 2,
      width: 400,
      errorCorrectionLevel: 'H',
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    // Convert Data URI to Base64 to attach as an inline image
    const base64Data = qrDataUri.split(',')[1];

    // 4. Build HTML Template with Optimized Styling
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <!-- Header Branding -->
        <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
          <h1 style="color: #f2c45f; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">IGAC MUN</h1>
          <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px; opacity: 0.8;">OFFICIAL DELEGATE CREDENTIALS</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="color: #111111; font-size: 18px; font-weight: 600; margin-bottom: 10px;">
            Greetings, ${delegate.full_name}!
          </p>
          <p style="color: #555555; line-height: 1.6; font-size: 15px; margin-bottom: 25px;">
            Your allocation for the <strong>International Global Action Conference (IGAC)</strong> has been finalized. 
            We are excited to welcome you to this prestigious diplomatic assembly.
          </p>
          
          <div style="background-color: #fcfcfc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 30px; text-align: center; margin: 20px 0;">
            <p style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px;">Digital Entrance Pass</p>
            
            <div style="background-color: #ffffff; display: inline-block; padding: 15px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); margin-bottom: 20px;">
              <img src="cid:qrcode" alt="QR Code" style="width: 220px; height: 220px; display: block;" />
            </div>
            
            <div style="margin-bottom: 20px;">
              <span style="background-color: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; border: 1px solid #fde68a;">
                COUNCIL: ${delegate.committee || "GENERAL ASSEMBLY"}
              </span>
            </div>

            <div style="font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #64748b; background-color: #f1f5f9; padding: 10px; border-radius: 6px; display: inline-block; border: 1px solid #e2e8f0;">
              AUTH_TOKEN: ${delegate.qr_token}
            </div>
          </div>

          <div style="background-color: #fff9eb; border-left: 4px solid #f2c45f; padding: 15px; margin-bottom: 25px;">
            <p style="color: #854d0e; font-size: 13px; margin: 0; line-height: 1.5;">
              <strong>Pro-tip:</strong> Please have this QR code ready on your mobile device (or printed) upon arrival at the venue to ensure a seamless check-in experience.
            </p>
          </div>

          <p style="color: #666666; font-size: 14px; line-height: 1.6;">
            If you have any questions regarding your registration or require special assistance, please reach out to our Delegate Affairs department.
          </p>
        </div>

        <div style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} International Global Affairs Council. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // 5. Send the Email via Resend
    const { data: resendData, error: resendErr } = await resend.emails.send({
      from: "IGAC Secretariat <delegateaffairs@osayeed.me>", // Updated to official department email
      to: delegate.email,
      subject: `[CONFIRMED] Official Delegate Credentials for ${delegate.full_name}`,
      html: htmlTemplate,
      attachments: [
        {
          filename: "delegate-qr.png",
          content: base64Data,
          cid: "qrcode", // Used in html template
        },
      ],
    });

    if (resendErr) {
      // Revert status to FAILED so it can be retried
      await supabase
        .from("delegates")
        .update({ mail_status: "FAILED" })
        .eq("id", delegateId);
      
      return NextResponse.json({ error: resendErr.message }, { status: 500 });
    }

    // 6. Complete Transaction & Update DB
    await supabase
      .from("delegates")
      .update({
        mail_status: "SENT",
        allocation_mail_sent_at: new Date().toISOString(),
      })
      .eq("id", delegateId);

    return NextResponse.json({ 
      success: true, 
      message: "Email dispatched successfully via Resend",
      id: resendData?.id 
    });
  } catch (error: any) {
    console.error("Mail Dispatch Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
