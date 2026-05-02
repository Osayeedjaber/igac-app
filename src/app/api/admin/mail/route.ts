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

    /* 
    if (delegate.mail_status === "SENT") {
      return NextResponse.json({ error: "Mail was already sent for this delegate." }, { status: 409 });
    }
    */

    // Update status to PROCESSING
    await supabase
      .from("delegates")
      .update({ mail_status: "PROCESSING" })
      .eq("id", delegateId);

    // 2. Fetch Email Template
    let templateConfig = null;
    try {
      const { data: templateData } = await supabase.from("system_templates").select("*").eq("id", 1).single();
      if (templateData && templateData.email_config) {
        templateConfig = templateData.email_config;
      } else {
        // Fallback to local file
        const LOCAL_DB_PATH = path.join(process.cwd(), "templates_db.json");
        const fileData = await fs.readFile(LOCAL_DB_PATH, "utf-8");
        const parsed = JSON.parse(fileData);
        templateConfig = parsed.email_config;
      }
    } catch (err) {
      console.warn("Failed to fetch template, using default:", err);
    }

    // 3. Generate QR Code Server-Side (High Error Correction for better scanning)
    const qrBuffer = await QRCode.toBuffer(delegate.qr_token, {
      margin: 0, // Set margin to 0 to match builder's QRCodeSVG marginSize={0}
      width: 600,
      errorCorrectionLevel: 'H',
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    // 3. Composite onto the Template
    const templatePath = path.join(process.cwd(), "public", "qr code", "Allocation Pass.jpg");
    
    // Get dimensions of base image
    const metadata = await sharp(templatePath).metadata();
    const width = metadata.width || 1414;
    const height = metadata.height || 2000;

    // HARDCODED COORDINATES FROM USER
    // Text Box: [213, 2619] to [1175, 2985]
    // QR Box: [1949, 2690] to [2259, 2894]
    
    // QR Code Placement
    // Left: 1949, Top: 2690
    // Box bounds: [1949, 2690] to [2259, 2894]
    // Width: 310, Height: 204
    // We'll use 200px to fit comfortably inside the height
    const qrSize = 350; 
    
    const resizedQrBuffer = await sharp(qrBuffer)
      .resize(qrSize, qrSize)
      .toBuffer();

    const svgOverlay = Buffer.from(`
      <svg width="${width}" height="${height}">
        <!-- Text Area Box: [213, 2619] to [1175, 2985] -->
        <!-- Starting at x=213, y=2619 -->
        <!-- Shifted 20px up, and reduced spacing (-5px) between groups -->
        
        <text x="213" y="2650" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#666666" text-transform="uppercase">Name</text>
        <text x="213" y="2720" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="800" fill="#000000" text-transform="uppercase">${delegate.full_name}</text>
        
        <text x="213" y="2775" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#666666" text-transform="uppercase">Email</text>
        <text x="213" y="2820" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="400" fill="#444444">${delegate.email.toLowerCase()}</text>
        
        <text x="213" y="2880" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#666666" text-transform="uppercase">Committee &amp; Country</text>
        ${(() => {
          const committee = delegate.committee?.toUpperCase() || "GA";
          const country = delegate.country?.toUpperCase() || "N/A";
          
          // Use smaller font for long committees
          const commFontSize = committee.length > 40 ? 24 : 34;
          const countryFontSize = committee.length > 40 ? 38 : 52;
          
          return `
            <text x="213" y="2915" font-family="Arial, Helvetica, sans-serif" font-size="${commFontSize}" font-weight="600" fill="#444444" text-transform="uppercase">${committee}</text>
            <text x="213" y="2965" font-family="Arial, Helvetica, sans-serif" font-size="${countryFontSize}" font-weight="800" fill="#000000" text-transform="uppercase">${country}</text>
          `;
        })()}
        
        <text x="213" y="3025" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="900" fill="#666666" text-transform="uppercase">ID: ${delegate.qr_token.toUpperCase()}</text>
      </svg>
    `);

    const finalBuffer = await sharp(templatePath)
      .composite([
        {
          input: resizedQrBuffer,
          top: 2690,
          left: 1949,
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

    // 4. Build HTML Template with Template Builder Config
    let htmlTemplate = "";
    let emailSubject = `[CONFIRMED] Official Delegate Credentials for ${delegate.full_name}`;

    if (templateConfig) {
      emailSubject = templateConfig.subject || emailSubject;
      
      if (templateConfig.mode === "html" && templateConfig.htmlContent) {
        htmlTemplate = templateConfig.htmlContent;
      } else {
        const heading = templateConfig.heading || `Hello {{Name}}!`;
        const message = templateConfig.message || "Your allocation for the upcoming IGAC event is confirmed.";
        const signoff = templateConfig.signoff || "Best regards,<br/>The Secretariat Team";
        
        htmlTemplate = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #eeeeee; border-radius: 8px;">
            <h1 style="color: #333333;">${heading}</h1>
            <div style="color: #555555; line-height: 1.6; font-size: 15px; margin-bottom: 25px; white-space: pre-wrap;">${message}</div>
            
            <div style="text-align: center; margin: 30px 0;">
              <img src="cid:delegate-qr" alt="Admission Pass" style="width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
            </div>

            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              ${signoff}
            </div>
          </div>
        `;
      }

      // Replace variables
      const placeholders: Record<string, string> = {
        "{{Name}}": delegate.full_name,
        "{{Role}}": delegate.role || "Delegate",
        "{{Committee}}": delegate.committee || "Not Assigned",
        "{{Country}}": delegate.country || "Not Assigned",
        "{{ID}}": delegate.delegate_id || delegate.id.toString(),
      };

      Object.entries(placeholders).forEach(([key, value]) => {
        htmlTemplate = htmlTemplate.split(key).join(value);
        emailSubject = emailSubject.split(key).join(value);
      });

      // Ensure QR placement if it's not in custom HTML
      if (!htmlTemplate.includes("cid:delegate-qr")) {
        htmlTemplate += `
          <div style="text-align: center; margin: 20px 0;">
            <img src="cid:delegate-qr" alt="Admission Pass" style="width: 100%; max-width: 300px;" />
          </div>`;
      }
    } else {
      // Original Default Template fallback
      htmlTemplate = `
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
    }

    // 5. Send the Email via Resend with Attachment
    const { data: resendData, error: resendErr } = await resend.emails.send({
      from: "International Global Action Conference - Delegate Affairs <delegateaffairs@igac.info>",
      to: delegate.email,
      subject: emailSubject,
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
      const updatePayload: any = { 
        mail_status: "FAILED"
      };
      
      // Attempt to include last_mail_error if the column exists
      try {
        updatePayload.last_mail_error = resendErr.message || "Unknown SMTP Error";
      } catch (e) {}

      await supabase
        .from("delegates")
        .update(updatePayload)
        .eq("id", delegateId);
      
      return NextResponse.json({ error: resendErr.message }, { status: 500 });
    }

    // 6. Complete Process & Update DB
    const finalUpdatePayload: any = {
      mail_status: "SENT",
      allocation_mail_sent_at: new Date().toISOString()
    };

    // Attempt to clear last_mail_error if the column exists
    try {
      finalUpdatePayload.last_mail_error = null;
    } catch (e) {}

    const { error: finalUpdateErr } = await supabase
      .from("delegates")
      .update(finalUpdatePayload)
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
