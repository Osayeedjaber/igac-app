import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseReady } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, unknown> = {
  id: "main",
  site_name: "IGAC",
  site_tagline: "International Global Affairs Council",
  site_description: "The biggest Model United Nations conference in South East Asia.",
  contact_email: "intlglobalaffairscouncil@gmail.com",
  contact_phone: "+880 18153-53082",
  contact_address: "Dhaka, Bangladesh",
  social_facebook: "#",
  social_instagram: "#",
  social_linkedin: "#",
  social_twitter: "#",
  social_youtube: "#",
  logo_url: "/logo.png",
  primary_color: "#d4af37",
  stat_total_events: "5+",
  stat_total_delegates: "4000+",
  stat_years_active: "3+",
  maintenance_mode: false,
  registration_open: true,
  recruitment_open: true,
  join_form_url: "https://forms.gle/vTMVqN637Q5QGmXcA",
  register_url: "",
  announcement: "",
};

// GET — Fetch site settings (public for basic, admin for all)
export async function GET(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "main")
    .single();

  if (error) {
    return NextResponse.json(DEFAULTS);
  }

  return NextResponse.json({ ...DEFAULTS, ...data });
}

// PUT — Update site settings (admin only)
export async function PUT(request: NextRequest) {
  if (!isSupabaseReady()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await verifyAdmin(request))) return unauthorizedResponse();

  const body = await request.json();
  const supabase = getServiceSupabase();

  // All columns the dashboard might send
  const allColumns = [
    'site_name', 'site_tagline', 'site_description',
    'contact_email', 'contact_phone', 'contact_address',
    'social_facebook', 'social_instagram', 'social_linkedin',
    'social_twitter', 'social_youtube', 'logo_url', 'primary_color',
    'stat_total_events', 'stat_total_delegates', 'stat_years_active',
    'maintenance_mode', 'registration_open', 'recruitment_open',
    'join_form_url', 'register_url', 'announcement',
  ];

  const updateData: Record<string, unknown> = { id: "main" };
  for (const col of allColumns) {
    if (body[col] !== undefined) {
      updateData[col] = body[col];
    }
  }

  // Try upsert — if it fails due to missing columns, retry with only existing ones
  let { data, error } = await supabase
    .from("site_settings")
    .upsert(updateData)
    .select()
    .single();

  if (error && error.message.includes("column")) {
    // Some columns don't exist in DB yet — filter to only columns that exist
    // First, read current row to discover which columns the table has
    const { data: existing } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .single();

    const existingCols = existing ? Object.keys(existing) : ['id', 'site_name', 'maintenance_mode', 'registration_open', 'recruitment_open', 'join_form_url', 'register_url'];

    const safeData: Record<string, unknown> = { id: "main" };
    for (const col of allColumns) {
      if (body[col] !== undefined && existingCols.includes(col)) {
        safeData[col] = body[col];
      }
    }

    const retry = await supabase
      .from("site_settings")
      .upsert(safeData)
      .select()
      .single();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ...DEFAULTS, ...data });
}
