import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import React from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // 2. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 3. Generate QR Code Server-Side
    const qrSvgString = renderToStaticMarkup(
      React.createElement(QRCodeSVG, {
        value: delegate.qr_token,
        size: 250,
        level: "H",
        includeMargin: true,
        fgColor: "#000000",
        bgColor: "#ffffff"
      })
    );

    // Convert SVG to Base64 to attach as an inline image
    const svgBase64 = Buffer.from(qrSvgString).toString("base64");
    const qrDataUri = `data:image/svg+xml;base64,${svgBase64}`;

    // 4. Build HTML Template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #111;">IGAC Delegate Credentials</h1>
        </div>
        <p style="color: #444; line-height: 1.6;">
          Dear <strong>${delegate.full_name}</strong>,
        </p>
        <p style="color: #444; line-height: 1.6;">
          Your allocation and registration for the International Global Action Conference (IGAC) is confirmed! 
          Below is your personal QR Code. Please present this QR code during check-in for access.
        </p>
        
        <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
          <p style="font-size: 13px; color: #6c757d; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;">Your Unique Identification Token</p>
          
          <img src="cid:qrcode" alt="QR Code" style="width: 250px; height: 250px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
          
          <div style="margin-top: 20px; font-family: monospace; font-size: 12px; color: #495057; background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #dee2e6;">
            ${delegate.qr_token}
          </div>
          
          <div style="margin-top: 15px;">
            <span style="background: #e0f2fe; color: #0284c7; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              ${delegate.committee || "Unallocated"}
            </span>
          </div>
        </div>

        <p style="color: #444; line-height: 1.6;">
          Keep this email safe or download the QR code before arriving to ensure a swift entrance.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #888; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} International Global Action Conference. All rights reserved.
        </p>
      </div>
    `;

    // 5. Send the Email
    await transporter.sendMail({
      from: `"IGAC Secretariat" <${process.env.GMAIL_EMAIL}>`,
      to: delegate.email,
      subject: "Your Official Delegate QR Code Check-in Credentials",
      html: htmlTemplate,
      attachments: [
        {
          filename: "qr-code.svg",
          content: svgBase64,
          encoding: "base64",
          contentType: "image/svg+xml",
          cid: "qrcode", // Used in html template
        },
      ],
    });

    // 6. Complete Transaction & Update DB
    await supabase
      .from("delegates")
      .update({
        mail_status: "SENT",
        allocation_mail_sent_at: new Date().toISOString(),
      })
      .eq("id", delegateId);

    return NextResponse.json({ success: true, message: "Email dispatched successfully" });
  } catch (error: any) {
    console.error("Mail Dispatch Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
