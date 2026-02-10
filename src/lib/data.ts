import { teamData, eventsArchive } from "@/config/site-data";
import { isSupabaseReady } from "@/lib/supabase";

// ─── Site Settings ─────────────────────────────────
export type SiteSettingsPublic = {
  recruitment_open: boolean;
  registration_open: boolean;
  join_form_url: string;
  register_url: string;
  maintenance_mode: boolean;
  announcement: string;
};

export type SiteStats = {
  total_events: string;
  total_delegates: string;
  years_active: string;
};

export async function getSiteSettings(): Promise<SiteSettingsPublic> {
  const defaults: SiteSettingsPublic = {
    recruitment_open: true,
    registration_open: true,
    join_form_url: "https://forms.gle/vTMVqN637Q5QGmXcA",
    register_url: "",
    maintenance_mode: false,
    announcement: "",
  };
  if (isSupabaseReady()) {
    try {
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .single();
      if (!error && data) return { ...defaults, ...data };
    } catch { /* fallback */ }
  }
  return defaults;
}

export async function getSiteStats(): Promise<SiteStats> {
  const defaults: SiteStats = {
    total_events: "5+",
    total_delegates: "4000+",
    years_active: "3+",
  };
  if (isSupabaseReady()) {
    try {
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("site_settings")
        .select("stat_total_events, stat_total_delegates, stat_years_active")
        .eq("id", "main")
        .single();
      if (!error && data) {
        return {
          total_events: data.stat_total_events || defaults.total_events,
          total_delegates: data.stat_total_delegates || defaults.total_delegates,
          years_active: data.stat_years_active || defaults.years_active,
        };
      }
    } catch { /* fallback */ }
  }
  return defaults;
}

type TeamMemberRow = {
  id: string;
  name: string;
  role: string;
  image: string;
  department: string;
  quote: string;
  description: string;
  category: string;
  sort_order: number;
  socials: Record<string, string>;
  is_visible: boolean;
};

type EventRow = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  year: number;
  month: string;
  location: string;
  image: string;
  description: string;
  division: string;
  tag: string;
  stats: Record<string, string>;
  highlights: string[];
  sort_order: number;
  featured: boolean;
  is_visible: boolean;
};

// ─── Team Data ─────────────────────────────────────
export async function getTeamMembers(): Promise<{
  governingBody: TeamMemberRow[];
  corePanel: TeamMemberRow[];
  heads: TeamMemberRow[];
  deputies: TeamMemberRow[];
  executives: TeamMemberRow[];
  ctgHead: TeamMemberRow | null;
  ctgCore: TeamMemberRow[];
  ctgHeads: TeamMemberRow[];
  ctgDeputies: TeamMemberRow[];
  ctgExecutives: TeamMemberRow[];
}> {
  if (isSupabaseReady()) {
    try {
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        console.log(`[data] Team members loaded from Supabase (${data.length} members)`);
        const members = data as TeamMemberRow[];
        const ctgCoreMembers = members.filter((m) => m.category === "ctg_core");
        return {
          governingBody: members.filter((m) => m.category === "governing_body"),
          corePanel: members.filter((m) => m.category === "core_panel"),
          heads: members.filter((m) => m.category === "head"),
          deputies: members.filter((m) => m.category === "deputy"),
          executives: members.filter((m) => m.category === "executive"),
          ctgHead: ctgCoreMembers.find((m) => m.role === "Regional Head") || null,
          ctgCore: ctgCoreMembers.filter((m) => m.role !== "Regional Head"),
          ctgHeads: members.filter((m) => m.category === "ctg_head"),
          ctgDeputies: members.filter((m) => m.category === "ctg_deputy"),
          ctgExecutives: members.filter((m) => m.category === "ctg_executive"),
        };
      }
    } catch (err) {
      console.warn("Supabase fetch failed, using fallback:", err);
    }
  }

  // Fallback to site-data.ts
  console.warn("[data] FALLBACK: Using static site-data.ts for team members (Supabase unavailable or empty)");
  return {
    governingBody: teamData.governingBody.map((m, i) => ({
      id: `gb-${i}`,
      name: m.name,
      role: m.role,
      image: m.image,
      department: "",
      quote: m.quote || "",
      description: "",
      category: "governing_body",
      sort_order: i,
      socials: m.socials as Record<string, string>,
      is_visible: true,
    })),
    corePanel: teamData.corePanel.map((m, i) => ({
      id: `cp-${i}`,
      name: m.name,
      role: m.role,
      image: m.image,
      department: "",
      quote: "",
      description: "",
      category: "core_panel",
      sort_order: i,
      socials: m.socials as Record<string, string>,
      is_visible: true,
    })),
    heads: teamData.heads.map((m, i) => ({
      id: `h-${i}`,
      name: m.name,
      role: m.role,
      image: m.image,
      department: m.department || "",
      quote: "",
      description: "",
      category: "head",
      sort_order: i,
      socials: m.socials as Record<string, string>,
      is_visible: true,
    })),
    deputies: teamData.deputies.map((m, i) => ({
      id: `d-${i}`,
      name: m.name,
      role: m.role,
      image: m.image,
      department: m.department || "",
      quote: "",
      description: "",
      category: "deputy",
      sort_order: i,
      socials: m.socials as Record<string, string>,
      is_visible: true,
    })),
    executives: [],
    ctgHead: {
      id: "ctg-head",
      name: teamData.regions.ctg.head.name,
      role: teamData.regions.ctg.head.role,
      image: teamData.regions.ctg.head.image,
      department: "",
      quote: "",
      description: "",
      category: "ctg_core",
      sort_order: 0,
      socials: teamData.regions.ctg.head.socials as Record<string, string>,
      is_visible: true,
    },
    ctgCore: teamData.regions.ctg.corePanel.map((m, i) => ({
      id: `ctg-cp-${i}`,
      name: m.name,
      role: m.role,
      image: m.image,
      department: "",
      quote: "",
      description: "",
      category: "ctg_core",
      sort_order: i + 1,
      socials: m.socials as Record<string, string>,
      is_visible: true,
    })),
    ctgHeads: teamData.regions.ctg.heads.map((m, i) => ({
      id: `ctg-h-${i}`,
      name: m.name,
      role: m.role,
      image: m.image || "/logo.png",
      department: m.department || "",
      quote: "",
      description: "",
      category: "ctg_head",
      sort_order: i,
      socials: m.socials as Record<string, string>,
      is_visible: true,
    })),
    ctgDeputies: teamData.regions.ctg.deputies.map((m, i) => ({
      id: `ctg-d-${i}`,
      name: m.name,
      role: m.role,
      image: m.image || "/logo.png",
      department: m.department || "",
      quote: "",
      description: "",
      category: "ctg_deputy",
      sort_order: i,
      socials: m.socials as Record<string, string>,
      is_visible: true,
    })),
    ctgExecutives: [],
  };
}

// ─── Events Data ───────────────────────────────────

// ─── Single Team Member by Slug ────────────────────
export async function getTeamMemberBySlug(slug: string): Promise<TeamMemberRow | null> {
  const { slugify } = await import("@/lib/utils");

  if (isSupabaseReady()) {
    try {
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("team_members")
        .select("*");

      if (!error && data) {
        const member = (data as TeamMemberRow[]).find(
          (m) => slugify(m.name) === slug && m.is_visible
        );
        return member || null;
      }
    } catch (err) {
      console.warn("Supabase member fetch failed, using fallback:", err);
    }
  }

  // Fallback to static data
  const allStatic = [
    ...teamData.governingBody,
    ...teamData.corePanel,
    ...teamData.heads,
    ...teamData.deputies,
    ...(teamData.regions?.ctg?.corePanel || []),
    ...(teamData.regions?.ctg?.heads || []),
    ...(teamData.regions?.ctg?.deputies || []),
    ...(teamData.regions?.ctg?.head ? [teamData.regions.ctg.head] : []),
  ];
  const found = allStatic.find((m) => slugify(m.name) === slug);
  if (!found) return null;
  return {
    id: slug,
    name: found.name,
    role: found.role,
    image: found.image,
    department: (found as any).department || "",
    quote: (found as any).quote || "",
    description: "",
    category: "",
    sort_order: 0,
    socials: found.socials as Record<string, string>,
    is_visible: true,
  };
}

// ─── All Team Members (flat list for generateStaticParams) ──
export async function getAllTeamSlugs(): Promise<string[]> {
  const { slugify } = await import("@/lib/utils");

  if (isSupabaseReady()) {
    try {
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("team_members")
        .select("name")
        .eq("is_visible", true);

      if (!error && data) {
        return data.map((m: { name: string }) => slugify(m.name));
      }
    } catch {
      // fall through
    }
  }

  const allStatic = [
    ...teamData.governingBody,
    ...teamData.corePanel,
    ...teamData.heads,
    ...teamData.deputies,
    ...(teamData.regions?.ctg?.corePanel || []),
    ...(teamData.regions?.ctg?.heads || []),
    ...(teamData.regions?.ctg?.deputies || []),
    ...(teamData.regions?.ctg?.head ? [teamData.regions.ctg.head] : []),
  ];
  return allStatic.map((m) => slugify(m.name));
}

export async function getEvents(): Promise<EventRow[]> {
  if (isSupabaseReady()) {
    try {
      const { getServiceSupabase } = await import("@/lib/supabase");
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        console.log(`[data] Events loaded from Supabase (${data.length} events)`);
        return data as EventRow[];
      }
    } catch (err) {
      console.warn("Supabase events fetch failed, using fallback:", err);
    }
  }

  // Fallback to site-data.ts
  console.warn("[data] FALLBACK: Using static site-data.ts for events (Supabase unavailable or empty)");
  return eventsArchive.map((e, i) => ({
    id: `event-${i}`,
    title: e.title,
    subtitle: e.subtitle || "",
    date: e.date,
    year: e.year,
    month: e.month,
    location: e.location,
    image: e.image || "",
    description: e.description || "",
    division: e.division || "",
    tag: e.tag || "",
    stats: (e.stats || {}) as Record<string, string>,
    highlights: (e.highlights || []) as string[],
    sort_order: i,
    featured: e.tag === "FEATURED" || e.tag === "LATEST",
    is_visible: true,
  }));
}
