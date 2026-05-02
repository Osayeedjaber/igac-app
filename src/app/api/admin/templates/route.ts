import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

// Quick local JSON fallback if they haven't run the Supabase Migration
const LOCAL_DB_PATH = path.join(process.cwd(), "templates_db.json");

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    
    // Attempt Supabase fetch
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from("system_templates").select("*").single();
      
      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
      
      if (error && error.code !== '42P01') { // 42P01 is table does not exist
         console.warn("Supabase Template Read Error:", error);
      }
    }

    // Fallback: Read local file if table doesn't exist
    try {
      const fileData = await fs.readFile(LOCAL_DB_PATH, "utf-8");
      return NextResponse.json({ success: true, data: JSON.parse(fileData), source: "local" });
    } catch {
      return NextResponse.json({ success: true, data: null, source: "none" }); // No saved templates
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pdfTemplate, emailTemplate } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    
    // First fetch existing so we don't overwrite the other half
    let existingPdf = null;
    let existingEmail = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("system_templates").select("*").eq("id", 1).single();
      if (data) {
        existingPdf = data.pdf_config;
        existingEmail = data.email_config;
      }
    } else {
      try {
        const fileData = await fs.readFile(LOCAL_DB_PATH, "utf-8");
        const parsed = JSON.parse(fileData);
        existingPdf = parsed.pdf_config;
        existingEmail = parsed.email_config;
      } catch {}
    }

    const payload = {
       id: 1, // enforce singleton
       pdf_config: pdfTemplate !== undefined ? pdfTemplate : existingPdf,
       email_config: emailTemplate !== undefined ? emailTemplate : existingEmail,
       updated_at: new Date().toISOString()
    };

    // Attempt Supabase insert
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("system_templates").upsert(payload, { onConflict: "id" });
      
      if (!error) {
        return NextResponse.json({ success: true, source: "supabase" });
      }
      if (error.code !== '42P01') {
        console.warn("Supabase Template Write Error:", error);
      }
    }

    // Fallback: Write local file if table doesn't exist
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(payload, null, 2));
    return NextResponse.json({ success: true, source: "local_fallback" });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
