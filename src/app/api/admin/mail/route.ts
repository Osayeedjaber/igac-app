import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

// Prevent Vercel function from running out of memory when processing multiple concurrent requests
sharp.concurrency(1);

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

    // 2. Generate QR Code Server-Side (High Error Correction for better scanning)
    const qrBuffer = await QRCode.toBuffer(delegate.qr_token, {
      margin: 1,
      width: 600,
      errorCorrectionLevel: 'H',
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    // 3. Composite onto the Template
    const templatePath = path.join(process.cwd(), "public", "qr code", "qrcode.jpg");
    
    // Updated Coordinates and Sizes based on user limitations
    // Box 1: [146, 1546] to [563, 1749] -> Name area
    // Box 2: [1036, 1544] to [1271, 1787] -> QR area
    
    // QR Code Placement: Left 1036, Top 1544
    // Box width: 1271 - 1036 = 235px
    // Box height: 1787 - 1544 = 243px
    const qrSize = 235; 
    
    // We must resize the qrBuffer to match the desired qrSize
    const resizedQrBuffer = await sharp(qrBuffer)
      .resize(qrSize, qrSize)
      .toBuffer();
    
    const svgOverlay = Buffer.from(`
      <svg width="1414" height="2000">
        <style>
          .base-text { 
            font-family: 'Helvetica', 'Arial', sans-serif;
            fill: #000000;
          }
          .name { 
            font-size: 38px; 
            font-weight: 800; 
            text-transform: uppercase; 
          }
          .email { 
            fill: #444444; 
            font-size: 20px; 
            font-weight: 400;
          }
          .label { 
            font-size: 26px; 
            font-weight: 700; 
            text-transform: uppercase;
          }
          .id-code { 
            font-family: 'Courier', 'Courier New', monospace;
            font-size: 22px; 
            font-weight: 700; 
            fill: #000000;
          }
          .field-title {
            font-size: 14px;
            font-weight: 900;
            fill: #666666;
            text-transform: uppercase;
          }
        </style>
        
        <!-- Field 1: Name -->
        <text x="146" y="1555" class="base-text field-title">Name</text>
        <text x="146" y="1585" class="base-text name">${delegate.full_name}</text>
        
        <!-- Field 2: Email -->
        <text x="146" y="1610" class="base-text field-title">Email</text>
        <text x="146" y="1635" class="base-text email">${delegate.email.toLowerCase()}</text>
        
        <!-- Field 3: Committee -->
        <text x="146" y="1665" class="base-text field-title">Committee</text>
        <text x="146" y="1690" class="base-text label">${delegate.committee?.toUpperCase() || "GA"}</text>
        
        <!-- Field 4: Country -->
        <text x="375" y="1665" class="base-text field-title">Country</text>
        <text x="375" y="1690" class="base-text label">${delegate.country?.toUpperCase() || "N/A"}</text>
        
        <!-- Field 5: Identification Code -->
        <text x="146" y="1720" class="base-text field-title">Identification Code</text>
        <text x="146" y="1750" class="id-code">${delegate.qr_token.toUpperCase()}</text>
      </svg>
    `);

    const finalBuffer = await sharp(templatePath)
      .composite([
        {
          input: resizedQrBuffer,
          top: 1544,
          left: 1036,
          blend: 'over'
        },
        {
          input: svgOverlay,
          top: 0,
          left: 0,
          blend: 'over'
        }
      ])
      .png()
      .toBuffer();

    const base64Data = finalBuffer.toString("base64");

    // 4. Build HTML Template with Optimized Styling
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <!-- Header Branding -->
        <div style="background-color: #000000; padding: 30px 20px; text-align: center;">
          <h1 style="color: #f2c45f; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">IGAC MUN</h1>
          <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px; opacity: 0.8;">OFFICIAL DELEGATE CREDENTIALS</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="color: #111111; font-size: 18px; font-weight: 600; margin-bottom: 20px;">
            Greetings, ${delegate.full_name}!
          </p>
          <p style="color: #555555; line-height: 1.6; font-size: 15px; margin-bottom: 25px;">
            Your allocation for the <strong>International Global Action Conference (IGAC)</strong> is confirmed. 
            Attached to this email, you will find your official **Admission Pass**.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="cid:delegate-qr" alt="Admission Pass" style="width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 15px 40px rgba(0,0,0,0.2);" />
          </div>

          <div style="background-color: #fff9eb; border-left: 4px solid #f2c45f; padding: 15px; margin-bottom: 25px;">
            <p style="color: #854d0e; font-size: 13px; margin: 0; line-height: 1.5;">
              <strong>Important:</strong> Please ensure this file is saved to your phone or printed. The Secretariat staff will scan this QR individual code for entry and exit.
            </p>
          </div>

          <p style="color: #666666; font-size: 14px; line-height: 1.6;">
            We look forward to your contributions to the diplomatic discourse in ${delegate.committee || "your committee"}.
          </p>
        </div>

        <div style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} International Global Affairs Council. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // 5. Send the Email via Resend with Attachment
    const { data: resendData, error: resendErr } = await resend.emails.send({
      from: "International Global Action Conference - Delegate Affairs <delegateaffairs@igac.info>",
      to: delegate.email,
      subject: `[CONFIRMED] Official Delegate Credentials for ${delegate.full_name}`,
      html: htmlTemplate,
      attachments: [
        {
          filename: `IGAC-QR-${delegate.full_name.replace(/\s+/g, "-")}.png`,
          content: Buffer.from(base64Data, "base64"),
          content_type: "image/png",
          cid: "delegate-qr",
        } as any, // Cast to any to bypass strict type check on 'cid' which is supported by Resend's underlying engine for inlining
      ],
    });

    if (resendErr) {
      console.error("Resend API Error:", resendErr);
      
      // Revert status to FAILED so it can be retried
      await supabase
        .from("delegates")
        .update({ 
          mail_status: "FAILED",
          last_mail_error: resendErr.message || "Unknown SMTP Error"
        })
        .eq("id", delegateId);
      
      return NextResponse.json({ error: resendErr.message }, { status: 500 });
    }

    // 6. Complete Transaction & Update DB
    const { error: finalUpdateErr } = await supabase
      .from("delegates")
      .update({
        mail_status: "SENT",
        allocation_mail_sent_at: new Date().toISOString(),
        last_mail_error: null // Clear any previous error
      })
      .eq("id", delegateId);

    if (finalUpdateErr) {
      console.error("Final status update failed, but email was sent:", finalUpdateErr);
    }

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
