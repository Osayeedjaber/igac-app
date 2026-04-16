"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Mail,
  Info,
  Download,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { fetchDelegatesAction, addDelegateAction } from "./actions";
import { DelegateProfileModal } from "./DelegateProfileModal";

type Delegate = {
  id: string;
  full_name: string;
  email: string;
  country: string | null;
  committee: string | null;
  qr_token: string;
  allocation_mail_sent_at: string | null;
  mail_status: "PENDING" | "PROCESSING" | "SENT" | "FAILED" | null;
  transaction_id?: string | null;
};

export function RegistryTab() {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDelegate, setNewDelegate] = useState({
    full_name: "",
    email: "",
    country: "",
    committee: "",
    position: "Delegate",
    transaction_id: "",
  });
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(
    null,
  );

  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    total: number;
    sent: number;
    failed: number;
  } | null>(null);

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

  const fetchDelegates = async () => {
    setLoading(true);
    try {
      const data = await fetchDelegatesAction();
      if (data) setDelegates(data as Delegate[]);
    } catch (err) {
      console.error(err);
      alert("Failed to load delegates. RLS may be active or session invalid.");
    }
    setLoading(false);
  };

  const handleBulkSend = async () => {
    const pendingDelegates = delegates.filter(
      (d) => d.mail_status === "PENDING" || d.mail_status === null,
    );
    if (pendingDelegates.length === 0) {
      alert("No pending mails to send.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to initiate sending ${pendingDelegates.length} emails? Keep this tab open.`,
      )
    )
      return;

    setIsBulkSending(true);
    setBulkProgress({ total: pendingDelegates.length, sent: 0, failed: 0 });

    const CHUNK_SIZE = 5;
    for (let i = 0; i < pendingDelegates.length; i += CHUNK_SIZE) {
      const chunk = pendingDelegates.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (delegate) => {
          try {
            const res = await fetch("/api/admin/mail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ delegateId: delegate.id }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => null);
              throw new Error(data?.error || "Send failed");
            }
            setBulkProgress((prev) =>
              prev ? { ...prev, sent: prev.sent + 1 } : null,
            );
          } catch (err: any) {
            console.error(
              `Failed to send to ${delegate.email}: ${err.message}`,
            );
            setBulkProgress((prev) =>
              prev ? { ...prev, failed: prev.failed + 1 } : null,
            );
          }
        }),
      );

      // Rate limit chunk delay (e.g. 2s) to prevent spam triggers
      if (i + CHUNK_SIZE < pendingDelegates.length) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    alert(`Bulk send finished!`);
    setBulkProgress(null);
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

  const filteredDelegates = delegates.filter(
    (d) =>
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      (d.committee || "").toLowerCase().includes(search.toLowerCase()) ||
      d.qr_token.toLowerCase().includes(search.toLowerCase()),
  );

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
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Delegate Registry</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const url = `/api/export?format=csv&type=all`;
              window.open(url, '_blank');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition border rounded-md border-zinc-700 bg-white/5 hover:bg-white/10 text-zinc-300"
          >
            <Download className="w-4 h-4" /> Master Export (API)
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition border rounded-md border-zinc-700 bg-sky-600 hover:bg-sky-500 text-white"
          >
            <Plus className="w-4 h-4" /> Add Delegate
          </button>
          <button
            onClick={fetchDelegates}
            className="px-4 py-2 text-sm font-medium transition border rounded-md border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          >
            Refresh
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition border rounded-md border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={handleBulkSend}
            disabled={isBulkSending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black transition bg-white rounded-md hover:bg-zinc-200 shadow-md disabled:bg-zinc-500 disabled:text-zinc-300 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4" /> {isBulkSending ? `Dispatching... (${bulkProgress?.sent || 0}/${bulkProgress?.total || 0})` : "Send Pending Mails"}
          </button>
        </div>
      </div>

      {/* Bulk Sending Status Bar */}
      {isBulkSending && bulkProgress && (
        <div className="bg-sky-900/30 border border-sky-500/50 rounded-lg p-4 flex items-center justify-between shadow-[0_0_15px_rgba(14,165,233,0.15)] animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3 text-sky-400 font-medium">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-500 border-t-transparent"></div>
            Dispatching Delegate QR Codes via Gmail SMTP...
          </div>
          <div className="flex items-center gap-6 text-sm font-mono">
            <span className="text-zinc-400">Total: {bulkProgress.total}</span>
            <span className="text-emerald-400">Sent: {bulkProgress.sent}</span>
            <span className="text-rose-400">Failed: {bulkProgress.failed}</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute w-4 h-4 text-zinc-500 left-3 top-3" />
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-sm border rounded-md bg-zinc-900 border-zinc-800 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-zinc-600"
            placeholder="Search by Name, Email, or Committee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="border rounded-lg border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-lg">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-zinc-900 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider cursor-pointer hover:text-white">
                Profile
              </th>
              <th className="px-6 py-4 font-medium tracking-wider">Contact</th>
              <th className="px-6 py-4 font-medium tracking-wider">
                Allocation
              </th>
              <th className="px-6 py-4 font-medium tracking-wider">
                Mail Status
              </th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-zinc-500"
                >
                  Loading Delegates...
                </td>
              </tr>
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
                  className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <div className="font-semibold text-white">
                      {del.full_name}
                    </div>
                    <div className="text-xs font-mono mt-1 text-zinc-500">
                      {del.qr_token}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-zinc-400">{del.email}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2 items-center">
                      {del.committee ? (
                        <span className="inline-flex items-center rounded-sm bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20">
                          {del.committee}
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-xs italic">
                          Unallocated
                        </span>
                      )}
                      {del.country && (
                        <span className="text-zinc-500 text-xs uppercase">
                          {del.country}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge
                      status={del.mail_status}
                      sentAt={del.allocation_mail_sent_at}
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button className="p-2 text-zinc-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-md transition opacity-0 group-hover:opacity-100">
                      <Info className="w-4 h-4" />
                    </button>
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none focus:border-sky-500"
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none focus:border-sky-500"
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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none focus:border-sky-500"
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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDelegate.transaction_id}
                    onChange={(e) =>
                      setNewDelegate({
                        ...newDelegate,
                        transaction_id: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white outline-none focus:border-sky-500 font-mono"
                  />
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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-sm text-white outline-none focus:border-sky-500"
                  >
                    <option value="Delegate">Delegate</option>
                    <option value="Campus Ambassador">Campus Ambassador</option>
                  </select>
                </div>
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
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded text-sm text-white font-medium"
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
}: {
  status: Delegate["mail_status"];
  sentAt: string | null;
}) {
  switch (status) {
    case "SENT":
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-950/30 border border-emerald-900/50 rounded-full text-xs font-medium text-emerald-400 relative group">
          <CheckCircle2 className="w-3 h-3" /> Sent
          {/* Tooltip */}
          {sentAt && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-zinc-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition pointer-events-none z-10">
              {format(new Date(sentAt), "MMM d, h:mm a")}
            </div>
          )}
        </div>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-rose-950/30 border border-rose-900/50 rounded-full text-xs font-medium text-rose-400">
          <Circle className="w-3 h-3 fill-rose-900" /> Error
        </span>
      );
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-sky-950/30 border border-sky-900/50 rounded-full text-xs font-medium text-sky-400 animate-pulse">
          <Clock className="w-3 h-3" /> Processing...
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs font-medium text-zinc-400">
          <Circle className="w-3 h-3" /> Pending
        </span>
      );
  }
}
