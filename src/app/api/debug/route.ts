import { NextResponse } from "next/server";
import { isSupabaseReady } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Debug endpoint to check environment variable loading
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "NOT_SET";
  const anonKeySet = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKeySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPasswordSet = !!process.env.ADMIN_PASSWORD;
  const supabaseReady = isSupabaseReady();

  return NextResponse.json({
    status: supabaseReady ? "OK" : "NOT_CONFIGURED",
    checks: {
      supabase_url: url.includes("supabase.co") ? "SET" : url,
      anon_key: anonKeySet ? "SET" : "NOT_SET",
      service_key: serviceKeySet ? "SET" : "NOT_SET",
      admin_password: adminPasswordSet ? "SET" : "NOT_SET",
      is_supabase_ready: supabaseReady,
    },
    hint: !supabaseReady
      ? "If env vars are in .env.local, restart the Next.js server (kill process and run npm run dev again)"
      : "All environment variables are loaded correctly",
  });
}
