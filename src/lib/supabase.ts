import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function isSupabaseReady(): boolean {
  const url = getSupabaseUrl();
  return (
    !!url &&
    url !== "your_supabase_url_here" &&
    (url.startsWith("http://") || url.startsWith("https://"))
  );
}

// Lazy client-side Supabase (uses anon key, respects RLS)
let _supabase: SupabaseClient | null = null;
export function getSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase is not configured. Please set environment variables.");
  }
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return _supabase;
}

// Server-side Supabase (uses service role key, bypasses RLS)
let _serviceSupabase: SupabaseClient | null = null;
export function getServiceSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase is not configured. Please set environment variables.");
  }
  if (!_serviceSupabase) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    _serviceSupabase = createClient(getSupabaseUrl(), serviceKey);
  }
  return _serviceSupabase;
}
