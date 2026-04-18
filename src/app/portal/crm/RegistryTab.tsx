"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Mail,
  Download,
  Plus,
  AlertCircle,
  Eye,
  Hash,
  Globe,
  Building2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import { fetchDelegatesAction, addDelegateAction } from "./actions";
import DelegateProfileModal from "./DelegateProfileModal";
import { Skeleton } from "@/components/ui/skeleton";

type Delegate = {
  id: string;
  full_name: string;
  email: string;
  country: string | null;
  committee: string | null;
  qr_token: string;
  allocation_mail_sent_at: string | null;
  mail_status: "PENDING" | "PROCESSING" | "SENT" | "FAILED" | null;
  last_mail_error?: string | null;
  institution?: string | null;
  transaction_id?: string | null;
};

export function RegistryTab({ initialSelectedId, onClearSelection }: { initialSelectedId?: string | null, onClearSelection?: () => void }) {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(null);
  const searchInputRef = typeof window !== 'undefined' ? (window as any)._searchInputRef : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const input = document.getElementById('delegate-search-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    if (initialSelectedId && delegates.length > 0) {
      const del = delegates.find(d => d.id === initialSelectedId);
      if (del) setSelectedDelegate(del);
      onClearSelection?.();
    }
  }, [initialSelectedId, delegates, onClearSelection]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDelegate, setNewDelegate] = useState({
    full_name: "",
    email: "",
    country: "",
    committee: "",
    position: "Delegate",
    institution: "",
    transaction_id: "",
  });

  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    total: number;
    sent: number;
    failed: number;
  } | null>(null);

  // Auto-refresh when bulk sending is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBulkSending) {
      interval = setInterval(() => {
        fetchDelegates(true);
      }, 5000); // Quietly refresh background data every 5s
    }
    return () => clearInterval(interval);
  }, [isBulkSending]);

  // Warn admin if they try to close tab while bulk sending
  useEffect(() => {
    if (!isBulkSending) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Emails are currently sending. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isBulkSending]);

  useEffect(() => {
    fetchDelegates();
  }, []);

  const fetchDelegates = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await fetchDelegatesAction();
      if (data) setDelegates(data as Delegate[]);
    } catch (err) {
      console.error(err);
      if (!quiet) alert("Failed to load delegates. RLS may be active or session invalid.");
    } finally {
      if (!quiet) setLoading(false);
      else setIsRefreshing(false);
    }
  };

  const handleBulkSend = async () => {
    const pendingDelegates = delegates.filter(
      (d) => d.mail_status === "PENDING" || d.mail_status === null || d.mail_status === "FAILED",
    );
    if (pendingDelegates.length === 0) {
      alert("No pending or failed mails to send.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to initiate sending ${pendingDelegates.length} emails? This will also retry any PREVIOUSLY FAILED mails. Keep this tab open.`,
      )
    )
      return;

    setIsBulkSending(true);
    setBulkProgress({ total: pendingDelegates.length, sent: 0, failed: 0 });

    const CHUNK_SIZE = 1; // Process 1 at a time to prevent Vercel Serverless Out of Memory crashes
    for (let i = 0; i < pendingDelegates.length; i += CHUNK_SIZE) {
      if (!isBulkSending) break; // Allow manual abort if we add a stop button later

      const chunk = pendingDelegates.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (delegate) => {
          try {
            // Update local state to PROCESSING immediately for UI feel
            setDelegates(prev => prev.map(d => d.id === delegate.id ? { ...d, mail_status: 'PROCESSING' } : d));

            const res = await fetch("/api/admin/mail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ delegateId: delegate.id }),
            });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
              throw new Error(data?.error || "Send failed");
            }
            
            setBulkProgress((prev) =>
              prev ? { ...prev, sent: prev.sent + 1 } : null,
            );
            
            // Update local state to SENT
            setDelegates(prev => prev.map(d => d.id === delegate.id ? { ...d, mail_status: 'SENT', allocation_mail_sent_at: new Date().toISOString() } : d));
          } catch (err: any) {
            console.error(
              `Failed to send to ${delegate.email}: ${err.message}`,
            );
            setBulkProgress((prev) =>
              prev ? { ...prev, failed: prev.failed + 1 } : null,
            );
            
            // Update local state to FAILED with error reason
            setDelegates(prev => prev.map(d => d.id === delegate.id ? { ...d, mail_status: 'FAILED', last_mail_error: err.message } : d));
          }
        }),
      );

      // Rate limit chunk delay (e.g. 2s) to prevent spam triggers
      if (i + CHUNK_SIZE < pendingDelegates.length) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // Capture the final counts before resetting state
    setBulkProgress(prev => {
      if (prev) {
        alert(`Bulk send finished! Sent: ${prev.sent}, Failed: ${prev.failed}`);
      }
      return null;
    });

    setIsBulkSending(false);
    await fetchDelegates();
  };

  const handleExportCsv = () => {
    if (delegates.length === 0) return;

    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Country",
      "Committee",
      "QR Token",
      "Mail Status",
    ];
    const rows = delegates.map((d) => [
      d.id,
      `"${d.full_name}"`, // Quote strings safely
      `"${d.email}"`,
      d.country ? `"${d.country}"` : "",
      d.committee ? `"${d.committee}"` : "",
      d.qr_token,
      d.mail_status || "PENDING",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `delegates-export-${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetZombies = async () => {
    const zombies = delegates.filter(d => d.mail_status === "PROCESSING");
    if (zombies.length === 0) {
      alert("No delegates currently stuck in processing state.");
      return;
    }
    if (!window.confirm(`Reset ${zombies.length} stuck emails from PROCESSING to PENDING? Use this if your browser crashed or internet dropped midway during a bulk send.`)) return;
    
    setLoading(true);
    try {
      // In production, an RPC or backend action for bulk update is better. Using map for small scale.
      const { editDelegateAction } = await import("./actions");
      await Promise.all(zombies.map(d => editDelegateAction(d.id, { mail_status: "PENDING" })));
      alert(`Reset ${zombies.length} delegates successfully.`);
      await fetchDelegates();
    } catch (e: any) {
      alert("Error resetting: " + e.message);
    }
    setLoading(false);
  };

  const filteredDelegates = delegates.filter(
    (d) =>
      d.full_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (d.committee || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      d.qr_token.toLowerCase().includes(debouncedSearch.toLowerCase()),
  ).slice(0, 100);

  const Highlight = ({ text, query }: { text: string; query: string }) => {
    if (!query.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-500/30 text-amber-200 px-0.5 rounded shadow-[0_0_8px_rgba(245,158,11,0.2)] border-b border-amber-400/50">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleAddDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newDelegate.full_name ||
      !newDelegate.email ||
      !newDelegate.transaction_id
    )
      return;

    if (
      !window.confirm(
        `Are you sure you want to add the delegate ${newDelegate.full_name}?`,
      )
    )
      return;

    setLoading(true);
    const qrToken = `DEL-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now()}`;

    try {
      const data = await addDelegateAction({
        full_name: newDelegate.full_name.trim(),
        email: newDelegate.email.trim().toLowerCase(),
        country: newDelegate.country.trim() || null,
        committee: newDelegate.committee.trim() || null,
        position: newDelegate.position.trim(),
        institution: newDelegate.institution.trim() || null,
        transaction_id: newDelegate.transaction_id.trim() || null,
        qr_token: qrToken,
        mail_status: "PENDING",
      });

      setDelegates([data as Delegate, ...delegates]);
      setShowAddModal(false);
      setNewDelegate({
        full_name: "",
        email: "",
        country: "",
        committee: "",
        position: "Delegate",
        institution: "",
        transaction_id: "",
      });
    } catch (err: any) {
      console.error(err);
      alert("Failed to add delegate: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Registry Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Delegate Registry
          <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded border border-zinc-700 font-mono uppercase tracking-widest">
            {delegates.length} Total
          </span>
        </h2>
        <p className="text-sm text-zinc-500">Manage, allocate, and dispatch credentials to regional delegates.</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute w-4 h-4 text-zinc-500 left-3 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
            <input
              id="delegate-search-input"
              type="text"
              className="w-64 py-2 pl-10 pr-4 text-sm border rounded-lg bg-black/20 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500/50 placeholder:text-zinc-600 transition-all font-medium"
              placeholder="Filter (Ctrl+F)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => fetchDelegates()}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            title="Refresh Registry"
          >
            <AlertCircle className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center bg-black/20 rounded-lg p-1 border border-zinc-800/50">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition hover:text-white text-zinc-400"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <div className="w-px h-4 bg-zinc-800 mx-1" />
            <button
              onClick={() => window.open(`/api/export?format=csv&type=all`, '_blank')}
              className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition hover:text-white text-zinc-400"
            >
              Master API
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition rounded-lg bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Plus className="w-4 h-4" /> Add Profile
          </button>

          <button
            onClick={resetZombies}
            title="Reset Stuck Processing States"
            className="p-2 transition bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg border border-orange-500/20"
          >
             <AlertCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleBulkSend}
            disabled={isBulkSending}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-black transition bg-white rounded-lg hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            <Mail className="w-4 h-4" /> 
            {isBulkSending ? 'Dispatching...' : 'Fire Bulk Mails'}
          </button>
        </div>
      </div>

      {/* Bulk Sending Status Bar */}
      {isBulkSending && bulkProgress && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.1)] animate-in slide-in-from-top-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-500/30 border-t-amber-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 bg-amber-500/20"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-500 font-bold text-xs uppercase tracking-widest">Dispatching Credentials</span>
              <span className="text-[10px] text-zinc-500 font-medium">Communicating with SMTP relay...</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Progress</span>
              <span className="text-sm font-mono font-bold text-white">{(bulkProgress?.sent ?? 0) + (bulkProgress?.failed ?? 0)} <span className="text-zinc-600 text-[10px]">/ {bulkProgress?.total ?? 0}</span></span>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter italic">Success</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{bulkProgress?.sent ?? 0}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter italic">Failed</span>
              <span className="text-sm font-mono font-bold text-rose-400">{bulkProgress?.failed ?? 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="border rounded-xl border-zinc-800 bg-black/20 overflow-hidden shadow-2xl backdrop-blur-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Profile</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Contact & Info</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Allocation</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Mailed Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                </tr>
              ))
            ) : filteredDelegates.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-zinc-500"
                >
                  No delegates found.
                </td>
              </tr>
            ) : (
              filteredDelegates.map((del) => (
                <tr
                  key={del.id}
                  onClick={() => setSelectedDelegate(del)}
                  className="hover:bg-zinc-800/40 transition-all group cursor-pointer border-l-2 border-transparent hover:border-amber-500/50 hover:shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all shadow-inner">
                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-amber-500">
                          {del.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-amber-500 transition-colors">
                          <Highlight text={del.full_name} query={search} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5 text-zinc-500 group-hover:text-zinc-400">
                          <Hash className="w-3 h-3 opacity-50" />
                          <Highlight text={del.qr_token} query={search} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span className="text-sm font-medium">
                          <Highlight text={del.email} query={search} />
                        </span>
                      </div>
                      {del.institution && (
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{del.institution}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2 items-center">
                        {del.committee ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/5 px-2 py-1 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/10 transition-all">
                            <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                            <Highlight text={del.committee.toUpperCase()} query={search} />
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider italic flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Unallocated
                          </span>
                        )}
                      </div>
                      {del.country && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                          <Globe className="w-3 h-3 text-zinc-600" />
                          {del.country}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={del.mail_status}
                      sentAt={del.allocation_mail_sent_at}
                      errorReason={del.last_mail_error}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDelegate(del);
                        }}
                        className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="View Details"
                       >
                        <Eye className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Add New Profile
            </h3>
            <form onSubmit={handleAddDelegate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDelegate.full_name}
                  onChange={(e) =>
                    setNewDelegate({
                      ...newDelegate,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full bg-black/50 border border-white/5 rounded p-2 text-white outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newDelegate.email}
                  onChange={(e) =>
                    setNewDelegate({ ...newDelegate, email: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/5 rounded p-2 text-white outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Committee (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDelegate.committee}
                    onChange={(e) =>
                      setNewDelegate({
                        ...newDelegate,
                        committee: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/5 rounded p-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    value={newDelegate.country}
                    onChange={(e) =>
                      setNewDelegate({
                        ...newDelegate,
                        country: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/5 rounded p-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Institution (Optional)
                    </label>
                    <input
                      type="text"
                      value={newDelegate.institution}
                      onChange={(e) =>
                        setNewDelegate({
                          ...newDelegate,
                          institution: e.target.value,
                        })
                      }
                      className="w-full bg-black/50 border border-white/5 rounded p-2 text-white outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={newDelegate.transaction_id}
                      onChange={(e) =>
                        setNewDelegate({
                          ...newDelegate,
                          transaction_id: e.target.value,
                        })
                      }
                      className="w-full bg-black/50 border border-white/5 rounded p-2 text-white outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Position *
                  </label>
                  <select
                    value={newDelegate.position}
                    onChange={(e) =>
                      setNewDelegate({
                        ...newDelegate,
                        position: e.target.value,
                      })
                    }
                    className="w-full bg-black/50 border border-white/5 rounded p-2.5 text-sm text-white outline-none focus:border-amber-500"
                  >
                    <option value="Delegate">Delegate</option>
                    <option value="Campus Ambassador">Campus Ambassador</option>
                  </select>
                </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-lg text-sm text-black font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  Create Delegate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delegate Profile Search/Info Modal */}
      {selectedDelegate && (
        <DelegateProfileModal
          delegate={selectedDelegate as any}
          onClose={() => setSelectedDelegate(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({
  status,
  sentAt,
  errorReason,
}: {
  status: Delegate["mail_status"];
  sentAt: string | null;
  errorReason?: string | null;
}) {
  switch (status) {
    case "SENT":
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-400 relative group shadow-[0_0_10px_rgba(52,211,153,0.05)]">
          <ShieldCheck className="w-3 h-3" />
          <span>DISPATCHED</span>
          {sentAt && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-white text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 backdrop-blur-md">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-zinc-500 uppercase text-[8px] font-bold tracking-widest">Sent on</span>
                <span className="font-mono">{format(new Date(sentAt), "MMM d, h:mm a")}</span>
              </div>
            </div>
          )}
        </div>
      );
    case "FAILED":
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[11px] font-bold text-rose-400 relative group shadow-[0_0_10px_rgba(251,113,133,0.05)]">
          <ShieldAlert className="w-3 h-3" />
          <span>FAILED</span>
          {errorReason && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-2.5 py-1.5 bg-rose-950 border border-rose-900/50 text-rose-100 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 backdrop-blur-md text-center leading-tight font-medium">
              {errorReason}
            </div>
          )}
        </div>
      );
    case "PROCESSING":
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] font-bold text-amber-500 animate-pulse-slow shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <Clock className="w-3 h-3 animate-spin-slow" />
          <span>PROCESSING</span>
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-[11px] font-bold text-zinc-500 shadow-[0_0_10px_rgba(0,0,0,0.2)]">
          <Circle className="w-3 h-3 fill-zinc-500/20" />
          <span>PENDING</span>
        </div>
      );
  }
}
