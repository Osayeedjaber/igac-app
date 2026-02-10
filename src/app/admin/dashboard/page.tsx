"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Users, Calendar, LogOut, Plus, Pencil, Trash2, X, Save,
  ChevronDown, Loader2, Upload, Eye, EyeOff, Star, StarOff,
  ArrowUp, ArrowDown, ImageIcon, Search, Download,
  Mail, Settings, Activity, Image as ImageIconLucide, LayoutDashboard,
  CheckSquare, Square, AlertTriangle, Moon, Sun, ExternalLink,
  Archive, Reply, Clock, RefreshCw, Filter,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  department: string;
  quote: string;
  description: string;
  category: string;
  sort_order: number;
  is_visible: boolean;
  socials: Record<string, string>;
};

type EventItem = {
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

type ContactSubmission = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  notes: string;
  created_at: string;
};

type ActivityLogEntry = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  details: Record<string, unknown>;
  created_at: string;
};

type SiteSettings = {
  id: string;
  site_name: string;
  site_tagline: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  social_twitter: string;
  social_youtube: string;
  logo_url: string;
  primary_color: string;
  stat_total_events: string;
  stat_total_delegates: string;
  stat_years_active: string;
  maintenance_mode: boolean;
  registration_open: boolean;
  recruitment_open: boolean;
  join_form_url: string;
  register_url: string;
  announcement: string;
};

type GalleryImage = {
  id: string;
  url: string;
  filename: string;
  folder: string;
  alt_text: string;
  file_size: number;
  created_at: string;
};

type DashboardStats = {
  team: { total: number; visible: number; hidden: number; byCategory: Record<string, number> };
  events: { total: number; visible: number; hidden: number; featured: number };
  contacts: { total: number; unread: number; read: number; replied: number; archived: number };
  activity: { total: number };
  gallery: { total: number };
};

type TabType = "overview" | "team" | "events" | "contacts" | "gallery" | "activity" | "settings";

// ─── Constants ───────────────────────────────────────

const CATEGORIES = [
  { value: "governing_body", label: "Governing Body" },
  { value: "core_panel", label: "Core Panel" },
  { value: "head", label: "Department Head" },
  { value: "deputy", label: "Deputy Head" },
  { value: "executive", label: "Executive" },
  { value: "ctg_core", label: "CTG Core Panel" },
  { value: "ctg_head", label: "CTG Head" },
  { value: "ctg_deputy", label: "CTG Deputy" },
  { value: "ctg_executive", label: "CTG Executive" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DIVISIONS = ["Dhaka", "CTG"];

const CONTACT_STATUSES = [
  { value: "unread", label: "Unread", color: "text-yellow-400 bg-yellow-500/10" },
  { value: "read", label: "Read", color: "text-blue-400 bg-blue-500/10" },
  { value: "replied", label: "Replied", color: "text-emerald-400 bg-emerald-500/10" },
  { value: "archived", label: "Archived", color: "text-gray-400 bg-gray-500/10" },
];

// ─── Shared UI pieces ────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#d4af37]" : "bg-[#1e453e]"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", className, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string; required?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#d4af37] outline-none"
      />
    </div>
  );
}

function FilterPill({ label, value, active, onClick, count }: {
  label: string; value: string; active: string; onClick: (v: string) => void; count: number;
}) {
  const isActive = active === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${isActive ? "bg-[#d4af37] text-[#051b11]" : "bg-[#082216] border border-[#1e453e] text-[#94a3b8] hover:text-white hover:border-[#d4af37]/30"}`}
    >
      {label}
      <span className={`text-[10px] ${isActive ? "text-[#051b11]/60" : "text-[#94a3b8]/60"}`}>{count}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [darkMode, setDarkMode] = useState(true);

  // Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Filters
  const [filteredCategory, setFilteredCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactFilter, setContactFilter] = useState<string>("all");

  // Selection (bulk)
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  // Editing
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactSubmission | null>(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void } | null>(null);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ─── Auth ──────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem("igac_admin_token");
    if (!t) { router.push("/admin"); return; }
    setToken(t);
  }, [router]);

  const hdrs = useCallback(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);
  const authHdrs = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const showToast = useCallback((msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); }, []);

  const logActivity = useCallback(async (action: string, entity_type: string, entity_id?: string, entity_name?: string) => {
    try { await fetch("/api/activity", { method: "POST", headers: hdrs(), body: JSON.stringify({ action, entity_type, entity_id, entity_name }) }); } catch { /* silent */ }
  }, [hdrs]);

  // ─── Fetch ─────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sR, tR, eR, cR, aR, gR, stR] = await Promise.all([
        fetch("/api/stats", { headers: authHdrs() }).catch(() => null),
        fetch("/api/team").catch(() => null),
        fetch("/api/events").catch(() => null),
        fetch("/api/contact", { headers: authHdrs() }).catch(() => null),
        fetch("/api/activity?limit=100", { headers: authHdrs() }).catch(() => null),
        fetch("/api/gallery", { headers: authHdrs() }).catch(() => null),
        fetch("/api/settings").catch(() => null),
      ]);
      if (sR?.ok) setStats(await sR.json());
      if (tR?.ok) setMembers(await tR.json());
      if (eR?.ok) setEvents(await eR.json());
      if (cR?.ok) { const d = await cR.json(); setContacts(Array.isArray(d) ? d : []); }
      if (aR?.ok) { const d = await aR.json(); setActivityLogs(Array.isArray(d) ? d : []); }
      if (gR?.ok) { const d = await gR.json(); setGalleryImages(Array.isArray(d) ? d : []); }
      if (stR?.ok) setSiteSettings(await stR.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [token, authHdrs]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const logout = () => { localStorage.removeItem("igac_admin_token"); router.push("/admin"); };

  // ─── Image Upload ──────────────────────────────────
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", headers: authHdrs(), body: fd });
      if (!res.ok) { showToast("Upload failed"); return null; }
      const data = await res.json();
      showToast("Image uploaded!");
      // track in gallery
      await fetch("/api/gallery", { method: "POST", headers: hdrs(), body: JSON.stringify({ url: data.url, filename: file.name, folder, file_size: file.size, mime_type: file.type }) }).catch(() => {});
      return data.url;
    } catch { showToast("Upload failed"); return null; }
    finally { setUploadingImage(false); }
  };

  // ═══════ TEAM CRUD ═════════════════════════════════

  const doSaveMember = async (memberToSave: TeamMember, creating: boolean) => {
    setSaving(true);
    try {
      const catMembers = members.filter((m) => m.category === memberToSave.category && m.id !== memberToSave.id).sort((a, b) => a.sort_order - b.sort_order);
      const desired = memberToSave.sort_order;
      // Shift others: any member in same category with sort_order >= desired gets bumped +1
      const toShift = catMembers.filter((m) => m.sort_order >= desired);
      if (toShift.length > 0) {
        const shiftUpdates = toShift.map((m) =>
          fetch(`/api/team/${m.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ ...m, sort_order: m.sort_order + 1 }) })
        );
        await Promise.all(shiftUpdates);
        setMembers((p) => p.map((m) => {
          if (toShift.find((s) => s.id === m.id)) return { ...m, sort_order: m.sort_order + 1 };
          return m;
        }));
      }
      const url = creating ? "/api/team" : `/api/team/${memberToSave.id}`;
      const method = creating ? "POST" : "PUT";
      const { id: _id, ...body } = memberToSave;
      const res = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(creating ? body : memberToSave) });
      if (res.ok) {
        const saved = await res.json();
        if (creating) { setMembers((p) => [...p, saved]); await logActivity("create", "team_member", saved.id, saved.name); }
        else { setMembers((p) => p.map((m) => (m.id === saved.id ? saved : m))); await logActivity("update", "team_member", saved.id, saved.name); }
        setEditingMember(null); setIsNewMember(false);
        showToast(creating ? "Member added!" : "Member updated!");
      } else { const err = await res.json().catch(() => null); showToast(`Failed to save: ${err?.error || res.statusText || "Unknown error"}`); }
    } catch (e) { showToast(`Network error: ${e instanceof Error ? e.message : "Unknown"}`); }
    setSaving(false);
  };

  const saveMember = async () => {
    if (!editingMember) return;
    const catMembers = members.filter((m) => m.category === editingMember.category && m.id !== editingMember.id).sort((a, b) => a.sort_order - b.sort_order);
    const nextOrder = catMembers.length + 1;
    const desired = editingMember.sort_order;
    const conflict = catMembers.find((m) => m.sort_order === desired);
    if (conflict && desired < nextOrder) {
      setConfirmDialog({
        open: true,
        title: "Replace Position?",
        message: `Position #${desired} is currently held by "${conflict.name}". This will push them and everyone after down by one. Continue?`,
        onConfirm: async () => {
          setConfirmDialog(null);
          await doSaveMember(editingMember, isNewMember);
        },
      });
      return;
    }
    await doSaveMember(editingMember, isNewMember);
  };

  const deleteMember = (id: string) => {
    const m = members.find((x) => x.id === id);
    setConfirmDialog({ open: true, title: "Delete Member", message: `Delete "${m?.name}"? This cannot be undone.`, onConfirm: async () => {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE", headers: hdrs() });
      if (res.ok) { setMembers((p) => p.filter((x) => x.id !== id)); await logActivity("delete", "team_member", id, m?.name); showToast("Member deleted"); }
      setConfirmDialog(null);
    }});
  };

  const toggleMemberVisibility = async (member: TeamMember) => {
    const up = { ...member, is_visible: !member.is_visible };
    const res = await fetch(`/api/team/${member.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify(up) });
    if (res.ok) { const s = await res.json(); setMembers((p) => p.map((m) => (m.id === s.id ? s : m))); showToast(s.is_visible ? "Visible" : "Hidden"); }
  };

  const moveMember = async (member: TeamMember, dir: "up" | "down") => {
    const catMembers = members.filter((m) => m.category === member.category).sort((a, b) => a.sort_order - b.sort_order);
    const idx = catMembers.findIndex((m) => m.id === member.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= catMembers.length) return;
    const a = catMembers[idx], b = catMembers[swapIdx];
    const aO = a.sort_order, bO = b.sort_order;
    await Promise.all([
      fetch(`/api/team/${a.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ ...a, sort_order: bO }) }),
      fetch(`/api/team/${b.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ ...b, sort_order: aO }) }),
    ]);
    setMembers((p) => p.map((m) => { if (m.id === a.id) return { ...m, sort_order: bO }; if (m.id === b.id) return { ...m, sort_order: aO }; return m; }));
  };

  const getNextSortOrder = (category: string) => members.filter((m) => m.category === category).length + 1;

  const openNewMember = () => {
    setIsNewMember(true);
    const nextOrder = getNextSortOrder("head");
    setEditingMember({ id: "", name: "", role: "", image: "", department: "", quote: "", description: "", category: "head", sort_order: nextOrder, is_visible: true, socials: { facebook: "", instagram: "" } });
  };

  const reindexSortOrders = async () => {
    const catGroups: Record<string, TeamMember[]> = {};
    for (const m of members) {
      if (!catGroups[m.category]) catGroups[m.category] = [];
      catGroups[m.category].push(m);
    }
    const updates: Promise<Response>[] = [];
    const localUpdates: { id: string; sort_order: number }[] = [];
    for (const cat of Object.keys(catGroups)) {
      const sorted = catGroups[cat].sort((a, b) => a.sort_order - b.sort_order);
      sorted.forEach((m, i) => {
        const newOrder = i + 1;
        if (m.sort_order !== newOrder) {
          updates.push(fetch(`/api/team/${m.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ ...m, sort_order: newOrder }) }));
          localUpdates.push({ id: m.id, sort_order: newOrder });
        }
      });
    }
    if (updates.length === 0) { showToast("Sort orders already clean!"); return; }
    await Promise.all(updates);
    setMembers((p) => p.map((m) => {
      const u = localUpdates.find((x) => x.id === m.id);
      return u ? { ...m, sort_order: u.sort_order } : m;
    }));
    showToast(`Re-indexed ${updates.length} members`);
  };

  // ═══════ EVENTS CRUD ══════════════════════════════

  const saveEvent = async () => {
    if (!editingEvent) return;
    setSaving(true);
    try {
      const url = isNewEvent ? "/api/events" : `/api/events/${editingEvent.id}`;
      const method = isNewEvent ? "POST" : "PUT";
      const { id: _id, ...body } = editingEvent;
      const res = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(isNewEvent ? body : editingEvent) });
      if (res.ok) {
        const saved = await res.json();
        if (isNewEvent) { setEvents((p) => [...p, saved]); await logActivity("create", "event", saved.id, saved.title); }
        else { setEvents((p) => p.map((e) => (e.id === saved.id ? saved : e))); await logActivity("update", "event", saved.id, saved.title); }
        setEditingEvent(null); setIsNewEvent(false);
        showToast(isNewEvent ? "Event added!" : "Event updated!");
      } else { const err = await res.json().catch(() => null); showToast(`Failed to save: ${err?.error || res.statusText || "Unknown error"}`); }
    } catch (e) { showToast(`Network error: ${e instanceof Error ? e.message : "Unknown"}`); }
    setSaving(false);
  };

  const deleteEvent = (id: string) => {
    const ev = events.find((x) => x.id === id);
    setConfirmDialog({ open: true, title: "Delete Event", message: `Delete "${ev?.title}"? This cannot be undone.`, onConfirm: async () => {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE", headers: hdrs() });
      if (res.ok) { setEvents((p) => p.filter((x) => x.id !== id)); await logActivity("delete", "event", id, ev?.title); showToast("Event deleted"); }
      setConfirmDialog(null);
    }});
  };

  const toggleEventFeatured = async (event: EventItem) => {
    const up = { ...event, featured: !event.featured };
    const res = await fetch(`/api/events/${event.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify(up) });
    if (res.ok) { const s = await res.json(); setEvents((p) => p.map((e) => (e.id === s.id ? s : e))); showToast(s.featured ? "Featured!" : "Unfeatured"); }
  };

  const toggleEventVisibility = async (event: EventItem) => {
    const up = { ...event, is_visible: !event.is_visible };
    const res = await fetch(`/api/events/${event.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify(up) });
    if (res.ok) { const s = await res.json(); setEvents((p) => p.map((e) => (e.id === s.id ? s : e))); showToast(s.is_visible ? "Visible" : "Hidden"); }
  };

  const moveEvent = async (event: EventItem, dir: "up" | "down") => {
    const sorted = [...events].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((e) => e.id === event.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    const aO = a.sort_order, bO = b.sort_order;
    await Promise.all([
      fetch(`/api/events/${a.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ ...a, sort_order: bO }) }),
      fetch(`/api/events/${b.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ ...b, sort_order: aO }) }),
    ]);
    setEvents((p) => p.map((e) => { if (e.id === a.id) return { ...e, sort_order: bO }; if (e.id === b.id) return { ...e, sort_order: aO }; return e; }));
  };

  const openNewEvent = () => {
    setIsNewEvent(true);
    setEditingEvent({ id: "", title: "", subtitle: "", date: "", year: new Date().getFullYear(), month: MONTHS[new Date().getMonth()], location: "Dhaka, Bangladesh", image: "", description: "", division: "Dhaka", tag: "", stats: { delegates: "300+", committees: "6+" }, highlights: [], sort_order: events.length + 1, featured: false, is_visible: true });
  };

  const reindexEventOrders = async () => {
    const sorted = [...events].sort((a, b) => a.sort_order - b.sort_order);
    const updates: Promise<Response>[] = [];
    const localUpdates: { id: string; sort_order: number }[] = [];
    sorted.forEach((e, i) => {
      const newOrder = i + 1;
      if (e.sort_order !== newOrder) {
        updates.push(fetch(`/api/events/${e.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ ...e, sort_order: newOrder }) }));
        localUpdates.push({ id: e.id, sort_order: newOrder });
      }
    });
    if (updates.length === 0) { showToast("Sort orders already clean!"); return; }
    await Promise.all(updates);
    setEvents((p) => p.map((e) => {
      const u = localUpdates.find((x) => x.id === e.id);
      return u ? { ...e, sort_order: u.sort_order } : e;
    }));
    showToast(`Re-indexed ${updates.length} events`);
  };

  // ═══════ BULK ACTIONS ═════════════════════════════

  const handleBulkAction = (action: string, entityType: "team" | "events" | "contacts") => {
    const ids = entityType === "team" ? Array.from(selectedMembers) : entityType === "events" ? Array.from(selectedEvents) : Array.from(selectedContacts);
    if (ids.length === 0) { showToast("No items selected"); return; }
    setConfirmDialog({ open: true, title: `${action} ${ids.length} items`, message: `Are you sure you want to ${action} ${ids.length} selected items?`, onConfirm: async () => {
      const res = await fetch("/api/bulk", { method: "POST", headers: hdrs(), body: JSON.stringify({ action, entity_type: entityType, ids }) });
      if (res.ok) { await fetchAllData(); if (entityType === "team") setSelectedMembers(new Set()); if (entityType === "events") setSelectedEvents(new Set()); if (entityType === "contacts") setSelectedContacts(new Set()); await logActivity("bulk_" + action, entityType, undefined, `${ids.length} items`); showToast(`${ids.length} items ${action}d`); }
      setConfirmDialog(null);
    }});
  };

  // ═══════ CONTACTS ═════════════════════════════════

  const updateContactStatus = async (contact: ContactSubmission, status: string) => {
    const res = await fetch(`/api/contact/${contact.id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify({ status }) });
    if (res.ok) { const s = await res.json(); setContacts((p) => p.map((c) => (c.id === s.id ? s : c))); showToast(`Marked as ${status}`); }
  };

  const deleteContact = (id: string) => {
    setConfirmDialog({ open: true, title: "Delete Contact", message: "Delete this contact submission?", onConfirm: async () => {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE", headers: hdrs() });
      if (res.ok) { setContacts((p) => p.filter((c) => c.id !== id)); showToast("Deleted"); }
      setConfirmDialog(null);
    }});
  };

  // ═══════ SETTINGS ═════════════════════════════════

  const saveSettings = async () => {
    if (!siteSettings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: hdrs(), body: JSON.stringify(siteSettings) });
      if (res.ok) { const s = await res.json(); setSiteSettings(s); await logActivity("update", "settings", "main", "Site Settings"); showToast("Settings saved!"); }
      else { const err = await res.json().catch(() => null); showToast(`Failed to save settings: ${err?.error || res.statusText || "Unknown error"}`); }
    } catch (e) { showToast(`Failed to save settings: ${e instanceof Error ? e.message : "Unknown"}`); }
    setSaving(false);
  };

  // ═══════ EXPORT ═══════════════════════════════════

  const handleExport = async (type: string, format: string) => {
    const res = await fetch(`/api/export?type=${type}&format=${format}`, { headers: authHdrs() });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `igac-${type}-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      await logActivity("export", type, undefined, `${format} export`);
      showToast("Exported!");
    }
  };

  // ─── Derived ───────────────────────────────────────

  const displayedMembers = members
    .filter((m) => filteredCategory === "all" || m.category === filteredCategory)
    .filter((m) => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase()) || m.department.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.sort_order - b.sort_order);

  const displayedEvents = events
    .filter((e) => !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.location.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.sort_order - b.sort_order);

  const displayedContacts = contacts
    .filter((c) => contactFilter === "all" || c.status === contactFilter)
    .filter((c) => !searchQuery || `${c.first_name} ${c.last_name} ${c.email} ${c.subject}`.toLowerCase().includes(searchQuery.toLowerCase()));

  const unreadCount = contacts.filter((c) => c.status === "unread").length;

  if (!token) return null;

  // ═══════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════
  const bgMain = darkMode ? "bg-[#040f0a]" : "bg-gray-50";
  const bgCard = darkMode ? "bg-[#082216]" : "bg-white";
  const bgInput = darkMode ? "bg-[#051b11]" : "bg-gray-100";
  const border = darkMode ? "border-[#1e453e]" : "border-gray-200";
  const txt = darkMode ? "text-white" : "text-gray-900";
  const txtSec = darkMode ? "text-[#94a3b8]" : "text-gray-500";
  const txtInp = darkMode ? "text-white" : "text-gray-900";

  const NAV_ITEMS: { id: TabType; icon: typeof LayoutDashboard; label: string; badge?: number | string; badgeColor?: string }[] = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "team", icon: Users, label: "Team", badge: stats?.team.total },
    { id: "events", icon: Calendar, label: "Events", badge: stats?.events.total },
    { id: "contacts", icon: Mail, label: "Contacts", badge: unreadCount || undefined, badgeColor: "bg-yellow-500 text-black" },
    { id: "gallery", icon: ImageIconLucide, label: "Gallery" },
    { id: "activity", icon: Activity, label: "Activity" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <main className={`min-h-screen ${bgMain} ${txt} transition-colors duration-200`}>

      {/* ─── Toast ─── */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[80] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`${bgCard} border ${border} px-5 py-3 rounded-xl shadow-2xl text-sm font-medium`}>{toastMsg}</div>
        </div>
      )}

      {/* ─── Confirm Dialog ─── */}
      {confirmDialog?.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className={`${bgCard} border ${border} rounded-2xl w-full max-w-md p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="text-red-400" size={20} /></div>
              <h3 className="text-lg font-bold">{confirmDialog.title}</h3>
            </div>
            <p className={`${txtSec} mb-6`}>{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDialog(null)} className={`px-4 py-2 text-sm ${txtSec} hover:text-white transition-colors`}>Cancel</button>
              <button onClick={confirmDialog.onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Top Bar ─── */}
      <header className={`sticky top-0 z-50 ${bgCard}/90 backdrop-blur-xl border-b ${border} px-4 md:px-6 py-3`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu btn */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
              <ChevronDown size={18} className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
            </button>
            <span className="text-lg font-bold tracking-tight">IGAC<span className="text-[#d4af37]">.</span> Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${txtSec} hover:text-white hover:bg-white/5`} title="Toggle theme">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={fetchAllData} disabled={loading} className={`p-2 rounded-lg ${txtSec} hover:text-white hover:bg-white/5`} title="Refresh">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className={`w-px h-6 ${border} mx-1`} />
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg">
              <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">

        {/* ─── Sidebar ─── */}
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed lg:sticky top-[57px] left-0 w-64 h-[calc(100vh-57px)] ${bgCard} border-r ${border} p-4 z-40 transition-transform duration-200 overflow-y-auto`}>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); setSearchQuery(""); }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? "bg-[#d4af37] text-[#051b11]" : `${txtSec} hover:text-white hover:bg-white/5`}`}
              >
                <div className="flex items-center gap-3"><item.icon size={18} />{item.label}</div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === item.id ? "bg-[#051b11]/20 text-[#051b11]" : item.badgeColor || "bg-white/10"}`}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <div className={`mt-6 pt-6 border-t ${border}`}>
            <h4 className={`text-xs uppercase tracking-wider font-bold ${txtSec} mb-3`}>Export Data</h4>
            <div className="space-y-1.5">
              {[["all", "json", "All Data (JSON)"], ["team", "csv", "Team (CSV)"], ["events", "csv", "Events (CSV)"], ["contacts", "csv", "Contacts (CSV)"]].map(([type, fmt, lbl]) => (
                <button key={type + fmt} onClick={() => handleExport(type, fmt)} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${txtSec} hover:text-white hover:bg-white/5 rounded-lg transition`}>
                  <Download size={14} /> {lbl}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Sidebar overlay on mobile */}
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* ─── Content ─── */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl min-h-[calc(100vh-57px)]">
          {loading ? (
            <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" /></div>
          ) : (
            <>
              {/* ════════════ OVERVIEW ════════════ */}
              {activeTab === "overview" && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold mb-6">Dashboard Overview</h1>
                  {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                      {[
                        { label: "Team", val: stats.team.total, sub: `${stats.team.visible} visible`, icon: Users, clr: "text-blue-400" },
                        { label: "Events", val: stats.events.total, sub: `${stats.events.featured} featured`, icon: Calendar, clr: "text-emerald-400" },
                        { label: "Contacts", val: stats.contacts.total, sub: `${stats.contacts.unread} unread`, icon: Mail, clr: "text-yellow-400" },
                        { label: "Gallery", val: stats.gallery.total, sub: "images", icon: ImageIconLucide, clr: "text-purple-400" },
                      ].map((s) => (
                        <div key={s.label} className={`${bgCard} border ${border} rounded-2xl p-5`}>
                          <div className="flex items-center justify-between mb-3">
                            <s.icon size={20} className={s.clr} />
                            <span className="text-2xl md:text-3xl font-bold">{s.val}</span>
                          </div>
                          <h3 className="font-medium text-sm">{s.label}</h3>
                          <p className={`text-xs ${txtSec}`}>{s.sub}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category breakdown */}
                  {stats && Object.keys(stats.team.byCategory).length > 0 && (
                    <div className={`${bgCard} border ${border} rounded-2xl p-5 mb-6`}>
                      <h3 className="text-lg font-bold mb-4">Team by Category</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(stats.team.byCategory).map(([cat, cnt]) => (
                          <div key={cat} className="flex items-center justify-between">
                            <span className={`text-sm ${txtSec}`}>{CATEGORIES.find((c) => c.value === cat)?.label || cat}</span>
                            <span className="font-bold">{cnt as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { icon: Plus, label: "Add Member", tab: "team" as TabType, fn: openNewMember },
                        { icon: Plus, label: "Add Event", tab: "events" as TabType, fn: openNewEvent },
                        { icon: Download, label: "Export Data", tab: undefined, fn: () => handleExport("all", "json") },
                        { icon: ExternalLink, label: "View Website", tab: undefined, fn: () => window.open("/", "_blank") },
                      ].map((q) => (
                        <button key={q.label} onClick={() => { if (q.tab) setActiveTab(q.tab); q.fn(); }}
                          className="flex items-center gap-2 px-4 py-3 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-xl text-[#d4af37] text-sm font-medium hover:bg-[#d4af37]/20 transition-colors"
                        >
                          <q.icon size={16} /> {q.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent activity */}
                  {activityLogs.length > 0 && (
                    <div className={`${bgCard} border ${border} rounded-2xl p-5 mt-6`}>
                      <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                      <div className="space-y-2">
                        {activityLogs.slice(0, 8).map((log) => (
                          <div key={log.id} className="flex items-center gap-3 text-sm">
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${(log.action || "").includes("create") ? "text-emerald-400 bg-emerald-500/10" : (log.action || "").includes("delete") ? "text-red-400 bg-red-500/10" : "text-blue-400 bg-blue-500/10"}`}>
                              {(log.action || "").replace("_", " ")}
                            </span>
                            <span className={txtSec}>{(log.entity_type || "").replace("_", " ")}{log.entity_name ? `: ${log.entity_name}` : ""}</span>
                            <span className={`text-xs ${txtSec} ml-auto`}>{new Date(log.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ════════════ TEAM TAB ════════════ */}
              {activeTab === "team" && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-serif font-bold">Team Members</h1>
                      <p className={`${txtSec} text-sm mt-1`}>{members.length} total &middot; {members.filter((m) => m.is_visible).length} visible</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={reindexSortOrders} className={`flex items-center gap-2 px-4 py-3 ${bgCard} border ${border} rounded-xl text-sm ${txtSec} hover:text-white hover:bg-white/5 transition`} title="Re-number sort orders to 1,2,3... per department">
                        <ArrowUp size={16} /> Re-index
                      </button>
                      <button onClick={openNewMember} className="flex items-center gap-2 px-5 py-3 bg-[#d4af37] text-[#051b11] rounded-xl font-bold text-sm hover:bg-[#eac55a] transition">
                        <Plus size={18} /> Add Member
                      </button>
                    </div>
                  </div>

                  {/* Search + Bulk */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${txtSec}`} size={18} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search members..."
                        className={`w-full ${bgInput} border ${border} rounded-xl pl-10 pr-4 py-3 ${txtInp} placeholder-gray-500 focus:border-[#d4af37] outline-none`} />
                    </div>
                    {selectedMembers.size > 0 && (
                      <div className="flex gap-2">
                        <button onClick={() => handleBulkAction("hide", "team")} className={`px-3 py-2 ${bgCard} border ${border} rounded-lg text-sm`}>Hide ({selectedMembers.size})</button>
                        <button onClick={() => handleBulkAction("show", "team")} className={`px-3 py-2 ${bgCard} border ${border} rounded-lg text-sm`}>Show ({selectedMembers.size})</button>
                        <button onClick={() => handleBulkAction("delete", "team")} className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">Delete ({selectedMembers.size})</button>
                      </div>
                    )}
                  </div>

                  {/* Category filters */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <FilterPill label="All" value="all" active={filteredCategory} onClick={setFilteredCategory} count={members.length} />
                    {CATEGORIES.map((c) => <FilterPill key={c.value} label={c.label} value={c.value} active={filteredCategory} onClick={setFilteredCategory} count={members.filter((m) => m.category === c.value).length} />)}
                  </div>

                  {/* Tables per category */}
                  {(filteredCategory === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.value === filteredCategory)).map((cat) => {
                    const catMembers = displayedMembers.filter((m) => m.category === cat.value).sort((a, b) => a.sort_order - b.sort_order);
                    if (catMembers.length === 0) return null;
                    return (
                      <div key={cat.value} className="mb-6">
                        <div className={`flex items-center justify-between px-4 py-3 ${bgCard} border ${border} rounded-t-2xl`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-[#0f3d2a] text-[#d4af37] font-bold">{cat.label}</span>
                            <span className={`text-xs ${txtSec}`}>{catMembers.length} member{catMembers.length !== 1 ? "s" : ""}</span>
                          </div>
                          <button onClick={() => { const catIds = catMembers.map((m) => m.id); const allSelected = catIds.every((id) => selectedMembers.has(id)); const s = new Set(selectedMembers); catIds.forEach((id) => allSelected ? s.delete(id) : s.add(id)); setSelectedMembers(s); }} className={`text-xs ${txtSec} hover:text-white`}>
                            {catMembers.every((m) => selectedMembers.has(m.id)) ? "Deselect all" : "Select all"}
                          </button>
                        </div>
                        <div className={`${bgCard} border border-t-0 ${border} rounded-b-2xl overflow-x-auto`}>
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${border} text-left`}>
                                <th className="px-3 py-2 w-10">
                                  <button onClick={() => { const catIds = catMembers.map((m) => m.id); const allSelected = catIds.every((id) => selectedMembers.has(id)); const s = new Set(selectedMembers); catIds.forEach((id) => allSelected ? s.delete(id) : s.add(id)); setSelectedMembers(s); }} className={txtSec}>
                                    {catMembers.every((m) => selectedMembers.has(m.id)) && catMembers.length > 0 ? <CheckSquare size={16} className="text-[#d4af37]" /> : <Square size={16} />}
                                  </button>
                                </th>
                                <th className={`px-3 py-2 text-[10px] uppercase tracking-wider ${txtSec} font-bold w-14`}>#</th>
                                <th className={`px-3 py-2 text-[10px] uppercase tracking-wider ${txtSec} font-bold`}>Member</th>
                                <th className={`px-3 py-2 text-[10px] uppercase tracking-wider ${txtSec} font-bold hidden md:table-cell`}>Role</th>
                                <th className={`px-3 py-2 text-[10px] uppercase tracking-wider ${txtSec} font-bold hidden lg:table-cell`}>Department</th>
                                <th className={`px-3 py-2 text-[10px] uppercase tracking-wider ${txtSec} font-bold text-center`}>Visible</th>
                                <th className={`px-3 py-2 text-[10px] uppercase tracking-wider ${txtSec} font-bold text-right`}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {catMembers.map((member) => (
                                <tr key={member.id} className={`border-b ${border}/50 hover:bg-white/[0.02] transition ${!member.is_visible ? "opacity-50" : ""} ${selectedMembers.has(member.id) ? "bg-[#d4af37]/5" : ""}`}>
                                  <td className="px-3 py-3">
                                    <button onClick={() => { const s = new Set(selectedMembers); s.has(member.id) ? s.delete(member.id) : s.add(member.id); setSelectedMembers(s); }} className={txtSec}>
                                      {selectedMembers.has(member.id) ? <CheckSquare size={16} className="text-[#d4af37]" /> : <Square size={16} />}
                                    </button>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex flex-col items-center gap-0.5">
                                      <button onClick={() => moveMember(member, "up")} className={`p-1 hover:bg-white/5 rounded ${txtSec}`}><ArrowUp size={12} /></button>
                                      <span className={`text-xs font-bold text-[#d4af37] font-mono`}>{member.sort_order}</span>
                                      <button onClick={() => moveMember(member, "down")} className={`p-1 hover:bg-white/5 rounded ${txtSec}`}><ArrowDown size={12} /></button>
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#0f3d2a] shrink-0">
                                        {member.image ? <Image src={member.image} alt={member.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className={txtSec} size={16} /></div>}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="font-medium text-sm block truncate">{member.name}</span>
                                        <span className={`text-xs ${txtSec} block md:hidden truncate`}>{member.role}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className={`px-3 py-3 text-sm ${txtSec} hidden md:table-cell`}>{member.role}</td>
                                  <td className={`px-3 py-3 text-sm ${txtSec} hidden lg:table-cell`}>{member.department || <span className="italic opacity-50">—</span>}</td>
                                  <td className="px-3 py-3 text-center">
                                    <button onClick={() => toggleMemberVisibility(member)} className={`p-2 rounded-lg transition ${member.is_visible ? "text-emerald-400 hover:bg-emerald-500/10" : `${txtSec} hover:bg-white/5`}`}>
                                      {member.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                  </td>
                                  <td className="px-3 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => { setEditingMember({ ...member }); setIsNewMember(false); }} className={`p-2 hover:bg-white/5 rounded-lg ${txtSec} hover:text-white`}><Pencil size={16} /></button>
                                      <button onClick={() => deleteMember(member.id)} className={`p-2 hover:bg-red-500/10 rounded-lg ${txtSec} hover:text-red-400`}><Trash2 size={16} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                  {displayedMembers.length === 0 && <div className={`${bgCard} border ${border} rounded-2xl px-6 py-12 text-center ${txtSec}`}>No members found.</div>}
                </div>
              )}

              {/* ════════════ EVENTS TAB ════════════ */}
              {activeTab === "events" && (
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-serif font-bold">Events</h1>
                      <p className={`${txtSec} text-sm mt-1`}>{events.length} total &middot; {events.filter((e) => e.featured).length} featured</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={reindexEventOrders} className={`flex items-center gap-2 px-4 py-3 ${bgCard} border ${border} rounded-xl text-sm font-bold hover:border-[#d4af37]/30 transition`}>
                        Reindex Events
                      </button>
                      <button onClick={openNewEvent} className="flex items-center gap-2 px-5 py-3 bg-[#d4af37] text-[#051b11] rounded-xl font-bold text-sm hover:bg-[#eac55a] transition">
                        <Plus size={18} /> Add Event
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${txtSec}`} size={18} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..."
                        className={`w-full ${bgInput} border ${border} rounded-xl pl-10 pr-4 py-3 ${txtInp} placeholder-gray-500 focus:border-[#d4af37] outline-none`} />
                    </div>
                    {selectedEvents.size > 0 && (
                      <div className="flex gap-2">
                        <button onClick={() => handleBulkAction("feature", "events")} className={`px-3 py-2 ${bgCard} border ${border} rounded-lg text-sm`}>Feature ({selectedEvents.size})</button>
                        <button onClick={() => handleBulkAction("delete", "events")} className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">Delete ({selectedEvents.size})</button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {displayedEvents.map((event) => (
                      <div key={event.id} className={`${bgCard} border rounded-2xl p-4 flex items-center gap-4 transition ${event.featured ? "border-[#d4af37]/50 ring-1 ring-[#d4af37]/20" : `${border} hover:border-[#d4af37]/30`} ${!event.is_visible ? "opacity-50" : ""} ${selectedEvents.has(event.id) ? "ring-2 ring-[#d4af37]/40" : ""}`}>
                        <button onClick={() => { const s = new Set(selectedEvents); s.has(event.id) ? s.delete(event.id) : s.add(event.id); setSelectedEvents(s); }} className={txtSec}>
                          {selectedEvents.has(event.id) ? <CheckSquare size={18} className="text-[#d4af37]" /> : <Square size={18} />}
                        </button>
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          <button onClick={() => moveEvent(event, "up")} className={`p-1 hover:bg-white/5 rounded ${txtSec}`}><ArrowUp size={12} /></button>
                          <span className={`text-[10px] ${txtSec} font-mono`}>{event.sort_order}</span>
                          <button onClick={() => moveEvent(event, "down")} className={`p-1 hover:bg-white/5 rounded ${txtSec}`}><ArrowDown size={12} /></button>
                        </div>
                        <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-[#0f3d2a] shrink-0 hidden sm:block">
                          {event.image ? <Image src={event.image} alt={event.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Calendar className={txtSec} size={18} /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3 className="font-bold text-sm truncate">{event.title}</h3>
                            {event.featured && <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-black uppercase flex items-center gap-1"><Star size={8} className="fill-current" /> Featured</span>}
                            {event.tag && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-black uppercase">{event.tag}</span>}
                          </div>
                          <p className={`text-xs ${txtSec}`}>{event.date} &middot; {event.location}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => toggleEventFeatured(event)} className={`p-2 rounded-lg transition ${event.featured ? "text-[#d4af37] hover:bg-[#d4af37]/10" : `${txtSec} hover:bg-white/5`}`}>
                            {event.featured ? <Star size={16} className="fill-current" /> : <StarOff size={16} />}
                          </button>
                          <button onClick={() => toggleEventVisibility(event)} className={`p-2 rounded-lg transition ${event.is_visible ? "text-emerald-400 hover:bg-emerald-500/10" : `${txtSec} hover:bg-white/5`}`}>
                            {event.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button onClick={() => { setEditingEvent({ ...event }); setIsNewEvent(false); }} className={`p-2 hover:bg-white/5 rounded-lg ${txtSec} hover:text-white`}><Pencil size={16} /></button>
                          <button onClick={() => deleteEvent(event.id)} className={`p-2 hover:bg-red-500/10 rounded-lg ${txtSec} hover:text-red-400`}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    {displayedEvents.length === 0 && <div className={`${bgCard} border ${border} rounded-2xl p-12 text-center ${txtSec}`}>No events found.</div>}
                  </div>
                </div>
              )}

              {/* ════════════ CONTACTS TAB ════════════ */}
              {activeTab === "contacts" && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Contact Submissions</h1>
                  <p className={`${txtSec} text-sm mb-6`}>Manage inquiries from your contact form</p>

                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${txtSec}`} size={18} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search contacts..."
                        className={`w-full ${bgInput} border ${border} rounded-xl pl-10 pr-4 py-3 ${txtInp} placeholder-gray-500 focus:border-[#d4af37] outline-none`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter size={16} className={txtSec} />
                      <select value={contactFilter} onChange={(e) => setContactFilter(e.target.value)} className={`${bgInput} border ${border} rounded-lg px-3 py-2 ${txtInp} focus:border-[#d4af37] outline-none`}>
                        <option value="all">All Status</option>
                        {CONTACT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    {selectedContacts.size > 0 && (
                      <div className="flex gap-2">
                        <button onClick={() => handleBulkAction("archive", "contacts")} className={`px-3 py-2 ${bgCard} border ${border} rounded-lg text-sm`}>Archive ({selectedContacts.size})</button>
                        <button onClick={() => handleBulkAction("delete", "contacts")} className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">Delete ({selectedContacts.size})</button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {displayedContacts.map((c) => {
                      const st = CONTACT_STATUSES.find((s) => s.value === c.status);
                      return (
                        <div key={c.id} className={`${bgCard} border ${border} rounded-xl p-4 hover:border-[#d4af37]/30 transition ${c.status === "unread" ? "border-l-4 border-l-yellow-500" : ""} ${selectedContacts.has(c.id) ? "ring-2 ring-[#d4af37]/40" : ""}`}>
                          <div className="flex items-start gap-3">
                            <button onClick={() => { const s = new Set(selectedContacts); s.has(c.id) ? s.delete(c.id) : s.add(c.id); setSelectedContacts(s); }} className={`mt-1 ${txtSec}`}>
                              {selectedContacts.has(c.id) ? <CheckSquare size={18} className="text-[#d4af37]" /> : <Square size={18} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h3 className="font-bold text-sm">{c.first_name} {c.last_name}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st?.color}`}>{st?.label}</span>
                              </div>
                              <p className={`text-xs ${txtSec} mb-1`}>{c.email}</p>
                              <p className="text-sm font-medium">{c.subject}</p>
                              <p className={`text-sm ${txtSec} line-clamp-2 mt-1`}>{c.message}</p>
                              <p className={`text-xs ${txtSec} mt-2 flex items-center gap-1`}><Clock size={12} />{new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {c.status === "unread" && <button onClick={() => updateContactStatus(c, "read")} className={`p-2 hover:bg-white/5 rounded-lg ${txtSec} hover:text-blue-400`} title="Mark read"><Eye size={16} /></button>}
                              <button onClick={() => updateContactStatus(c, "replied")} className={`p-2 hover:bg-white/5 rounded-lg ${txtSec} hover:text-emerald-400`} title="Replied"><Reply size={16} /></button>
                              <button onClick={() => updateContactStatus(c, "archived")} className={`p-2 hover:bg-white/5 rounded-lg ${txtSec} hover:text-gray-400`} title="Archive"><Archive size={16} /></button>
                              <button onClick={() => setEditingContact(c)} className={`p-2 hover:bg-white/5 rounded-lg ${txtSec} hover:text-white`} title="View"><ExternalLink size={16} /></button>
                              <button onClick={() => deleteContact(c.id)} className={`p-2 hover:bg-red-500/10 rounded-lg ${txtSec} hover:text-red-400`} title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {displayedContacts.length === 0 && <div className={`${bgCard} border ${border} rounded-2xl p-12 text-center ${txtSec}`}>No contacts found.</div>}
                  </div>
                </div>
              )}

              {/* ════════════ GALLERY TAB ════════════ */}
              {activeTab === "gallery" && (
                <GalleryTab images={galleryImages} uploadImage={uploadImage} uploadingImage={uploadingImage} authHdrs={authHdrs} fetchAllData={fetchAllData} showToast={showToast}
                  bgCard={bgCard} bgInput={bgInput} border={border} txtSec={txtSec} txtInp={txtInp} />
              )}

              {/* ════════════ ACTIVITY TAB ════════════ */}
              {activeTab === "activity" && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">Activity Log</h1>
                  <p className={`${txtSec} text-sm mb-6`}>Track all changes made to your content</p>
                  <div className="space-y-2">
                    {activityLogs.map((log) => (
                      <div key={log.id} className={`${bgCard} border ${border} rounded-xl p-4 flex items-center gap-4`}>
                        <span className={`text-xs px-2 py-1 rounded-lg font-bold whitespace-nowrap ${(log.action || "").includes("create") ? "text-emerald-400 bg-emerald-500/10" : (log.action || "").includes("delete") ? "text-red-400 bg-red-500/10" : (log.action || "").includes("export") ? "text-purple-400 bg-purple-500/10" : "text-blue-400 bg-blue-500/10"}`}>
                          {(log.action || "").replace(/_/g, " ").toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm"><span className="font-medium">{(log.entity_type || "").replace(/_/g, " ")}</span>{log.entity_name && <span className={txtSec}>: {log.entity_name}</span>}</p>
                        </div>
                        <p className={`text-xs ${txtSec} shrink-0`}>{new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}</p>
                      </div>
                    ))}
                    {activityLogs.length === 0 && <div className={`${bgCard} border ${border} rounded-2xl p-12 text-center ${txtSec}`}>No activity yet.</div>}
                  </div>
                </div>
              )}

              {/* ════════════ SETTINGS TAB ════════════ */}
              {activeTab === "settings" && siteSettings && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-serif font-bold">Site Settings</h1>
                      <p className={`${txtSec} text-sm mt-1`}>Configure your website</p>
                    </div>
                    <button onClick={saveSettings} disabled={saving} className="flex items-center gap-2 px-5 py-3 bg-[#d4af37] text-[#051b11] rounded-xl font-bold text-sm hover:bg-[#eac55a] transition disabled:opacity-50">
                      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Settings
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
                      <h2 className="text-lg font-bold mb-4">General</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Site Name" value={siteSettings.site_name || ""} onChange={(v) => setSiteSettings({ ...siteSettings, site_name: v })} />
                        <FormField label="Tagline" value={siteSettings.site_tagline || ""} onChange={(v) => setSiteSettings({ ...siteSettings, site_tagline: v })} />
                        <FormField label="Description" value={siteSettings.site_description || ""} onChange={(v) => setSiteSettings({ ...siteSettings, site_description: v })} className="md:col-span-2" />
                      </div>
                    </div>
                    <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
                      <h2 className="text-lg font-bold mb-4">Contact Info</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Email" value={siteSettings.contact_email || ""} onChange={(v) => setSiteSettings({ ...siteSettings, contact_email: v })} />
                        <FormField label="Phone" value={siteSettings.contact_phone || ""} onChange={(v) => setSiteSettings({ ...siteSettings, contact_phone: v })} />
                        <FormField label="Address" value={siteSettings.contact_address || ""} onChange={(v) => setSiteSettings({ ...siteSettings, contact_address: v })} className="md:col-span-2" />
                      </div>
                    </div>
                    <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
                      <h2 className="text-lg font-bold mb-4">Social Links</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Facebook" value={siteSettings.social_facebook || ""} onChange={(v) => setSiteSettings({ ...siteSettings, social_facebook: v })} />
                        <FormField label="Instagram" value={siteSettings.social_instagram || ""} onChange={(v) => setSiteSettings({ ...siteSettings, social_instagram: v })} />
                        <FormField label="LinkedIn" value={siteSettings.social_linkedin || ""} onChange={(v) => setSiteSettings({ ...siteSettings, social_linkedin: v })} />
                        <FormField label="YouTube" value={siteSettings.social_youtube || ""} onChange={(v) => setSiteSettings({ ...siteSettings, social_youtube: v })} />
                      </div>
                    </div>
                    <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
                      <h2 className="text-lg font-bold mb-4">Statistics</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Total Events" value={siteSettings.stat_total_events || ""} onChange={(v) => setSiteSettings({ ...siteSettings, stat_total_events: v })} placeholder="5+" />
                        <FormField label="Total Delegates" value={siteSettings.stat_total_delegates || ""} onChange={(v) => setSiteSettings({ ...siteSettings, stat_total_delegates: v })} placeholder="4000+" />
                        <FormField label="Years Active" value={siteSettings.stat_years_active || ""} onChange={(v) => setSiteSettings({ ...siteSettings, stat_years_active: v })} placeholder="3+" />
                      </div>
                    </div>
                    <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
                      <h2 className="text-lg font-bold mb-4">Links</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Join/Recruitment Form URL" value={siteSettings.join_form_url || ""} onChange={(v) => setSiteSettings({ ...siteSettings, join_form_url: v })} placeholder="https://forms.gle/..." />
                        <FormField label="Conference Register URL" value={siteSettings.register_url || ""} onChange={(v) => setSiteSettings({ ...siteSettings, register_url: v })} placeholder="https://..." />
                      </div>
                    </div>
                    <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
                      <h2 className="text-lg font-bold mb-4">Site Status</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div><h3 className="font-medium">Maintenance Mode</h3><p className={`text-sm ${txtSec}`}>Show maintenance page to visitors</p></div>
                          <ToggleSwitch checked={siteSettings.maintenance_mode || false} onChange={(v) => setSiteSettings({ ...siteSettings, maintenance_mode: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><h3 className="font-medium">Registration Open</h3><p className={`text-sm ${txtSec}`}>Allow conference registrations</p></div>
                          <ToggleSwitch checked={siteSettings.registration_open ?? true} onChange={(v) => setSiteSettings({ ...siteSettings, registration_open: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div><h3 className="font-medium">Recruitment Open</h3><p className={`text-sm ${txtSec}`}>Allow new member applications (Join Us page)</p></div>
                          <ToggleSwitch checked={siteSettings.recruitment_open ?? true} onChange={(v) => setSiteSettings({ ...siteSettings, recruitment_open: v })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════ MEMBER EDIT MODAL ═══════ */}
      {editingMember && (
        <ModalWrapper title={isNewMember ? "Add Team Member" : "Edit Team Member"} onClose={() => { setEditingMember(null); setIsNewMember(false); }} bgCard={bgCard} border={border} txtSec={txtSec}>
          <ImageUploader currentImage={editingMember.image} onImageChange={(url) => setEditingMember({ ...editingMember, image: url })} uploadFn={(f) => uploadImage(f, "team")} uploading={uploadingImage} bgInput={bgInput} border={border} txtSec={txtSec} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <FormField label="Full Name" value={editingMember.name} onChange={(v) => setEditingMember({ ...editingMember, name: v })} required placeholder="John Doe" />
            <FormField label="Role / Title" value={editingMember.role} onChange={(v) => setEditingMember({ ...editingMember, role: v })} required placeholder="Secretary General" />
            <FormField label="Department" value={editingMember.department} onChange={(v) => setEditingMember({ ...editingMember, department: v })} placeholder="Media & Comms" />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">Category <span className="text-red-400">*</span></label>
              <select value={editingMember.category} onChange={(e) => { const cat = e.target.value; const next = members.filter((m) => m.category === cat && m.id !== editingMember.id).length + 1; setEditingMember({ ...editingMember, category: cat, sort_order: next }); }} className={`w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white focus:border-[#d4af37] outline-none`}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <FormField label="Quote" value={editingMember.quote} onChange={(v) => setEditingMember({ ...editingMember, quote: v })} placeholder="A short quote..." />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">Sort Order</label>
              <input type="number" min={1} value={editingMember.sort_order} onChange={(e) => setEditingMember({ ...editingMember, sort_order: parseInt(e.target.value) || 1 })} className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white focus:border-[#d4af37] outline-none" />
              <p className="text-[10px] text-[#94a3b8]">
                {(() => { const count = members.filter((m) => m.category === editingMember.category && m.id !== editingMember.id).length; return `Currently ${count} in this category. Next available: ${count + 1}. Use a lower number to insert at that position.`; })()}
              </p>
            </div>
          </div>
          <div className="space-y-1.5 mt-4">
            <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">Description</label>
            <textarea value={editingMember.description} onChange={(e) => setEditingMember({ ...editingMember, description: e.target.value })} rows={3}
              className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#d4af37] outline-none resize-none" placeholder="Bio..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Facebook URL" value={editingMember.socials?.facebook || ""} onChange={(v) => setEditingMember({ ...editingMember, socials: { ...editingMember.socials, facebook: v } })} />
            <FormField label="Instagram URL" value={editingMember.socials?.instagram || ""} onChange={(v) => setEditingMember({ ...editingMember, socials: { ...editingMember.socials, instagram: v } })} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ToggleSwitch checked={editingMember.is_visible} onChange={(v) => setEditingMember({ ...editingMember, is_visible: v })} />
            <span className={`text-sm ${txtSec}`}>{editingMember.is_visible ? "Visible on website" : "Hidden"}</span>
          </div>
          <div className={`flex justify-end gap-3 mt-6 pt-6 border-t ${border}`}>
            <button onClick={() => { setEditingMember(null); setIsNewMember(false); }} className={`px-5 py-2.5 text-sm ${txtSec}`}>Cancel</button>
            <button onClick={saveMember} disabled={saving || !editingMember.name.trim() || !editingMember.role.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] text-[#051b11] rounded-lg font-bold text-sm hover:bg-[#eac55a] disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ═══════ EVENT EDIT MODAL ═══════ */}
      {editingEvent && (
        <ModalWrapper title={isNewEvent ? "Add Event" : "Edit Event"} onClose={() => { setEditingEvent(null); setIsNewEvent(false); }} bgCard={bgCard} border={border} txtSec={txtSec}>
          <ImageUploader currentImage={editingEvent.image} onImageChange={(url) => setEditingEvent({ ...editingEvent, image: url })} uploadFn={(f) => uploadImage(f, "events")} uploading={uploadingImage} aspect="banner" bgInput={bgInput} border={border} txtSec={txtSec} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <FormField label="Title" value={editingEvent.title} onChange={(v) => setEditingEvent({ ...editingEvent, title: v })} required placeholder="IGACMUN Session 3" className="md:col-span-2" />
            <FormField label="Subtitle" value={editingEvent.subtitle} onChange={(v) => setEditingEvent({ ...editingEvent, subtitle: v })} placeholder="Empowering Diplomats" className="md:col-span-2" />
            <FormField label="Date Display" value={editingEvent.date} onChange={(v) => setEditingEvent({ ...editingEvent, date: v })} required placeholder="December 2024" />
            <FormField label="Year" type="number" value={String(editingEvent.year)} onChange={(v) => setEditingEvent({ ...editingEvent, year: parseInt(v) || 2024 })} />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">Month</label>
              <select value={editingEvent.month} onChange={(e) => setEditingEvent({ ...editingEvent, month: e.target.value })} className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white focus:border-[#d4af37] outline-none">
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <FormField label="Location" value={editingEvent.location} onChange={(v) => setEditingEvent({ ...editingEvent, location: v })} placeholder="Dhaka, Bangladesh" />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">Division</label>
              <select value={editingEvent.division} onChange={(e) => setEditingEvent({ ...editingEvent, division: e.target.value })} className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white focus:border-[#d4af37] outline-none">
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <FormField label="Tag" value={editingEvent.tag} onChange={(v) => setEditingEvent({ ...editingEvent, tag: v })} placeholder="LATEST" />
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">Sort Order</label>
              <input type="number" min={1} value={editingEvent.sort_order} onChange={(e) => setEditingEvent({ ...editingEvent, sort_order: parseInt(e.target.value) || 1 })} className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white focus:border-[#d4af37] outline-none" />
              <p className="text-[10px] text-[#94a3b8]">Currently {events.length} events. Next available: {events.length + 1}. Lower numbers appear first.</p>
            </div>
            <FormField label="Delegates" value={editingEvent.stats?.delegates || ""} onChange={(v) => setEditingEvent({ ...editingEvent, stats: { ...editingEvent.stats, delegates: v } })} placeholder="300+" />
            <FormField label="Committees" value={editingEvent.stats?.committees || ""} onChange={(v) => setEditingEvent({ ...editingEvent, stats: { ...editingEvent.stats, committees: v } })} placeholder="6+" />
          </div>
          <div className="space-y-1.5 mt-4">
            <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">Description</label>
            <textarea value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} rows={3}
              className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#d4af37] outline-none resize-none" placeholder="Description..." />
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center gap-3">
              <ToggleSwitch checked={editingEvent.featured} onChange={(v) => setEditingEvent({ ...editingEvent, featured: v })} />
              <span className={`text-sm ${txtSec} flex items-center gap-1.5`}><Star size={14} className={editingEvent.featured ? "text-[#d4af37] fill-current" : ""} /> {editingEvent.featured ? "Featured" : "Not featured"}</span>
            </div>
            <div className="flex items-center gap-3">
              <ToggleSwitch checked={editingEvent.is_visible} onChange={(v) => setEditingEvent({ ...editingEvent, is_visible: v })} />
              <span className={`text-sm ${txtSec}`}>{editingEvent.is_visible ? "Visible" : "Hidden"}</span>
            </div>
          </div>
          <div className={`flex justify-end gap-3 mt-6 pt-6 border-t ${border}`}>
            <button onClick={() => { setEditingEvent(null); setIsNewEvent(false); }} className={`px-5 py-2.5 text-sm ${txtSec}`}>Cancel</button>
            <button onClick={saveEvent} disabled={saving || !editingEvent.title.trim() || !editingEvent.date.trim()} className="flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] text-[#051b11] rounded-lg font-bold text-sm hover:bg-[#eac55a] disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ═══════ CONTACT VIEW MODAL ═══════ */}
      {editingContact && (
        <ModalWrapper title="Contact Details" onClose={() => setEditingContact(null)} bgCard={bgCard} border={border} txtSec={txtSec}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${CONTACT_STATUSES.find((s) => s.value === editingContact.status)?.color}`}>
                {CONTACT_STATUSES.find((s) => s.value === editingContact.status)?.label}
              </span>
              <span className={`text-sm ${txtSec}`}>{new Date(editingContact.created_at).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={`text-xs uppercase tracking-wider font-bold ${txtSec}`}>Name</label><p className="font-medium">{editingContact.first_name} {editingContact.last_name}</p></div>
              <div><label className={`text-xs uppercase tracking-wider font-bold ${txtSec}`}>Email</label><p className="font-medium">{editingContact.email}</p></div>
              {editingContact.phone && <div><label className={`text-xs uppercase tracking-wider font-bold ${txtSec}`}>Phone</label><p className="font-medium">{editingContact.phone}</p></div>}
            </div>
            <div><label className={`text-xs uppercase tracking-wider font-bold ${txtSec}`}>Subject</label><p className="font-medium">{editingContact.subject}</p></div>
            <div><label className={`text-xs uppercase tracking-wider font-bold ${txtSec}`}>Message</label><p className="whitespace-pre-wrap">{editingContact.message}</p></div>
            <div className={`flex gap-2 pt-4 border-t ${border} flex-wrap`}>
              <button onClick={() => { updateContactStatus(editingContact, "read"); setEditingContact(null); }} className={`px-4 py-2 ${bgCard} border ${border} rounded-lg text-sm`}>Mark Read</button>
              <button onClick={() => { updateContactStatus(editingContact, "replied"); setEditingContact(null); }} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-400">Mark Replied</button>
              <a href={`mailto:${editingContact.email}?subject=Re: ${editingContact.subject}`} className="px-4 py-2 bg-[#d4af37] text-[#051b11] rounded-lg text-sm font-bold">Reply via Email</a>
            </div>
          </div>
        </ModalWrapper>
      )}
    </main>
  );
}

// ═══════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function ModalWrapper({ title, children, onClose, bgCard, border, txtSec }: {
  title: string; children: React.ReactNode; onClose: () => void; bgCard: string; border: string; txtSec: string;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`${bgCard} border ${border} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold">{title}</h2>
          <button onClick={onClose} className={`p-2 hover:bg-white/5 rounded-lg ${txtSec} hover:text-white`}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ImageUploader({ currentImage, onImageChange, uploadFn, uploading, aspect, bgInput, border, txtSec }: {
  currentImage: string; onImageChange: (url: string) => void; uploadFn: (f: File) => Promise<string | null>;
  uploading: boolean; aspect?: "banner" | "square"; bgInput: string; border: string; txtSec: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadFn(f); if (url) onImageChange(url);
    if (ref.current) ref.current.value = "";
  };
  const containerClass = aspect === "banner" ? "w-full h-32 rounded-xl" : "w-24 h-24 rounded-xl";
  return (
    <div className="flex items-start gap-4">
      <div className={`relative ${containerClass} overflow-hidden bg-[#0f3d2a] shrink-0`}>
        {currentImage ? <Image src={currentImage} alt="Preview" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className={txtSec} size={24} /></div>}
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className={`flex items-center gap-2 px-4 py-2.5 ${bgInput} border ${border} rounded-lg text-sm text-white hover:border-[#d4af37] disabled:opacity-50`}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {uploading ? "Uploading..." : "Upload Image"}
        </button>
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <input type="text" value={currentImage} onChange={(e) => onImageChange(e.target.value)} placeholder="Or paste image URL..."
          className={`w-full ${bgInput} border ${border} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#d4af37] outline-none`} />
      </div>
    </div>
  );
}

function GalleryTab({ images, uploadImage, uploadingImage, authHdrs, fetchAllData, showToast, bgCard, bgInput, border, txtSec, txtInp }: {
  images: GalleryImage[]; uploadImage: (f: File, folder: string) => Promise<string | null>; uploadingImage: boolean;
  authHdrs: () => { Authorization: string }; fetchAllData: () => void; showToast: (msg: string) => void;
  bgCard: string; bgInput: string; border: string; txtSec: string; txtInp: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState("general");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    await uploadImage(f, folder);
    fetchAllData();
    if (ref.current) ref.current.value = "";
  };

  const deleteImage = async (id: string) => {
    const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE", headers: authHdrs() });
    if (res.ok) { fetchAllData(); showToast("Image deleted"); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Image Gallery</h1>
          <p className={`${txtSec} text-sm mt-1`}>{images.length} images</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={folder} onChange={(e) => setFolder(e.target.value)} className={`${bgInput} border ${border} rounded-lg px-3 py-2 ${txtInp} outline-none`}>
            {["general", "team", "events"].map((f) => <option key={f} value={f}>{f[0].toUpperCase() + f.slice(1)}</option>)}
          </select>
          <button onClick={() => ref.current?.click()} disabled={uploadingImage} className="flex items-center gap-2 px-5 py-3 bg-[#d4af37] text-[#051b11] rounded-xl font-bold text-sm disabled:opacity-50">
            {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} Upload
          </button>
          <input ref={ref} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((img) => (
          <div key={img.id} className={`${bgCard} border ${border} rounded-xl overflow-hidden group`}>
            <div className="relative aspect-square">
              <Image src={img.url} alt={img.alt_text || img.filename} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => navigator.clipboard.writeText(img.url).then(() => showToast("URL copied!"))} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><ExternalLink size={16} /></button>
                <button onClick={() => deleteImage(img.id)} className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/40 text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs truncate">{img.filename}</p>
              <p className={`text-[10px] ${txtSec}`}>{img.folder}</p>
            </div>
          </div>
        ))}
        {images.length === 0 && <div className={`col-span-full ${bgCard} border ${border} rounded-2xl p-12 text-center ${txtSec}`}>No images yet. Upload one above.</div>}
      </div>
    </div>
  );
}
