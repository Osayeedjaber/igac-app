"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Users, QrCode, LogOut, CheckCircle2, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Database } from "@/lib/database.types";

type Delegate = Database["public"]["Tables"]["delegates"]["Row"];
type Checkin = Database["public"]["Tables"]["delegate_checkins"]["Row"];

export default function PortalDashboard() {
  const router = useRouter();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [secretariatId, setSecretariatId] = useState<string | null>(null);

  // Filters for Personal Overview
  const [search, setSearch] = useState("");
  const [filterDay, setFilterDay] = useState<"ALL" | 1 | 2 | 3>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "SCANNED_BY_ME" | "PENDING">("SCANNED_BY_ME");

  useEffect(() => {
    const supabase = getSupabase();

    const loadData = async () => {
      // 1. Verify session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/portal/login");
        return;
      }
      setSecretariatId(session.user.id);

      // 2. Fetch delegates
      const { data: delData } = await supabase.from("delegates").select("*");
      if (delData) setDelegates(delData);

      // 3. Fetch checkins
      const { data: chkData } = await supabase.from("delegate_checkins").select("*");
      if (chkData) setCheckins(chkData);

      setLoading(false);
    };

    loadData();

    // 4. Subscribe to Real-time Check-ins
    const channel = supabase
      .channel("realtime-checkins")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "delegate_checkins" },
        (payload) => {
          setCheckins((prev) => [...prev, payload.new as Checkin]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/portal/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-zinc-500 animate-pulse">Loading Live Data...</div>
      </div>
    );
  }

  // Calculate some basic stats
  const totalDelegates = delegates.length;

  const myCheckins = checkins.filter(c => c.scanned_by_id === secretariatId);
  const myScannedDelegatesCount = new Set(myCheckins.map(c => c.delegate_id)).size;

  const todayCheckins = myCheckins.filter(c => c.day === 1).length;

  const filteredDelegates = delegates.filter(del => {
    const matchesSearch = search === "" || del.full_name.toLowerCase().includes(search.toLowerCase()) || 
      (del.committee && del.committee.toLowerCase().includes(search.toLowerCase())) ||
      (del.country && del.country.toLowerCase().includes(search.toLowerCase()));

    const delCheckins = checkins.filter(c => c.delegate_id === del.id);
    const scannedByMe = delCheckins.some(c => c.scanned_by_id === secretariatId);

    const matchesStatus = filterStatus === "ALL" ? true :
      filterStatus === "SCANNED_BY_ME" ? scannedByMe :
      delCheckins.length === 0;

    let matchesDay = true;
    if (filterDay !== "ALL") {
      matchesDay = delCheckins.some(c => c.day === filterDay);
    }

    // Only apply the status and day filters if they aren't "ALL"
    if (filterStatus === "ALL" && filterDay === "ALL") {
        return matchesSearch;
    }
    
    return matchesSearch && matchesStatus && matchesDay;
  });

  return (
    <div className="flex min-h-screen flex-col items-center p-4 lg:p-8">
      <div className="w-full max-w-5xl space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Secretariat Dashboard
            </h1>
            <p className="text-sm text-zinc-400">
              Live delegate tracking and scanning.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/scan"
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 shadow-lg shadow-orange-500/20"
            >
              <QrCode className="h-4 w-4" />
              Open Scanner
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Delegates</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalDelegates}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">My Total Scans</span>
            </div>
            <div className="text-3xl font-bold text-white">{myCheckins.length}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 text-zinc-400 mb-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Delegates Scanned by Me</span>
            </div>
            <div className="text-3xl font-bold text-white">{myScannedDelegatesCount}</div>
          </div>
        </div>

        {/* Delegate List Wrapper */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col">
          
          {/* Header & Table Actions */}
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Delegate Overview</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search delegates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
              >
                <option value="ALL">All Delegates</option>
                <option value="SCANNED_BY_ME">Scanned by Me</option>
                <option value="PENDING">Pending (Not Scanned)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-black/20 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Delegate Name</th>
                  <th className="px-6 py-3">Country</th>
                  <th className="px-6 py-3">Committee</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Logs Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDelegates.map((del) => {
                  const checks = checkins.filter(c => c.delegate_id === del.id);
                  const isHereToday = checks.length > 0;
                  const myChecks = checks.filter(c => c.scanned_by_id === secretariatId);

                  return (
                    <tr key={del.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{del.full_name}</td>
                      <td className="px-6 py-4">{del.country}</td>
                      <td className="px-6 py-4">{del.committee}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {isHereToday ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500 border border-green-500/20" title={checks.map(c => `Day ${c.day} - ${c.checkpoint}`).join('\n')}>
                              Scanned ({checks.length}x)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-400 border border-zinc-500/20">
                              Pending
                            </span>
                          )}
                          {myChecks.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400 border border-orange-500/20" title={myChecks.map(c => `Day ${c.day} - ${c.checkpoint}`).join('\n')}>
                              By Me ({myChecks.length}x)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {checks.length > 0 ? (
                           <div className="flex flex-col gap-1">
                             {checks.slice(0, 3).map((c, idx) => (
                                <span key={idx} className="block">Day {c.day} • {c.checkpoint}</span>
                             ))}
                             {checks.length > 3 && <span className="text-zinc-600 italic">+{checks.length - 3} more...</span>}
                           </div>
                        ) : (
                           <span className="text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredDelegates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                      No delegates found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}