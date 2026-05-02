import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { toEmail, subject, htmlContent, pdfBase64 } = await req.json();

    if (!toEmail || !subject || !htmlContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { RESEND_API_KEY } = process.env;

    // Use a mockup process.env if resend key missing locally for testing purposes
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing. Simulating successful send.");
      // Just simulate a sleep then return success
      await new Promise(r => setTimeout(r, 1000));
      return NextResponse.json({ success: true, simulated: true });
    }

    const resend = new Resend(RESEND_API_KEY);

    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: "Certificate.pdf",
        // Extract base64 content omitting the 'data:application/pdf;base64,' prefix
        content: pdfBase64.split(",")[1] || pdfBase64,
      });
    }

    const { data, error } = await resend.emails.send({
      from: "Secretariat Team <onboarding@resend.dev>", // replace with your verified domain
      to: [toEmail],
      subject: subject,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
