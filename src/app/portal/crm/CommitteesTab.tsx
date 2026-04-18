"use client";

import { useState, useEffect } from "react";
import { fetchCommitteesProgressAction } from "./actions";
import {
  Users,
  PieChart,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  Download,
} from "lucide-react";
import DelegateProfileModal from "./DelegateProfileModal";
import { Skeleton } from "@/components/ui/skeleton";

export function CommitteesTab() {
  const [committees, setCommittees] = useState<
    { name: string; count: number; checkedIn: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // New States for Task 2.4 Refinement
  const [rawDelegates, setRawDelegates] = useState<any[]>([]);
  const [rawCheckins, setRawCheckins] = useState<any[]>([]);

  // Navigation states
  const [activeCommittee, setActiveCommittee] = useState<string | null>(null);
  const [selectedDelegate, setSelectedDelegate] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const exportToCSV = (committeeName: string, delegates: any[]) => {
    // Determine check-in status for sorting
    const getCheckinMetrics = (delId: string) => {
      const d1Reg = rawCheckins.some(c => c.delegate_id === delId && c.day === 1 && c.checkpoint === 'registration');
      const d1Com = rawCheckins.some(c => c.delegate_id === delId && c.day === 1 && c.checkpoint === 'committee');
      const d2Reg = rawCheckins.some(c => c.delegate_id === delId && c.day === 2 && c.checkpoint === 'registration');
      const d2Com = rawCheckins.some(c => c.delegate_id === delId && c.day === 2 && c.checkpoint === 'committee');
      const d3Reg = rawCheckins.some(c => c.delegate_id === delId && c.day === 3 && c.checkpoint === 'registration');
      
      const score = (d1Reg ? 1 : 0) + (d1Com ? 1 : 0) + (d2Reg ? 1 : 0) + (d2Com ? 1 : 0) + (d3Reg ? 1 : 0);
      return { d1Reg, d1Com, d2Reg, d2Com, d3Reg, score };
    };

    // Prepare data with status and score for sorting
    const data = delegates.map(d => ({
      ...d,
      ...getCheckinMetrics(d.id)
    }));

    // Sort: highest score (most checked in) first
    data.sort((a, b) => b.score - a.score);

    const headers = ["Full Name", "Email", "Country", "Committee", "Day 1 Registration", "Day 1 Committee", "Day 2 Registration", "Day 2 Committee", "Day 3 Registration"];
    const rows = data.map(d => [
      d.full_name,
      d.email,
      d.country || "",
      d.committee || "",
      d.d1Reg ? "YES" : "NO",
      d.d1Com ? "YES" : "NO",
      d.d2Reg ? "YES" : "NO",
      d.d2Com ? "YES" : "NO",
      d.d3Reg ? "YES" : "NO"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Committee_${committeeName.replace(/\s+/g, '_')}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchCommitteesProgressAction();
      if (data) {
        const { delegates, checkins } = data;
        setRawDelegates(delegates);
        setRawCheckins(checkins);

        // Group by committee
        const cMap = new Map<
          string,
          { count: number; checkedInSet: Set<string> }
        >();

        delegates.forEach((d: any) => {
          const cName = d.committee || "Unallocated";
          if (!cMap.has(cName)) {
            cMap.set(cName, { count: 0, checkedInSet: new Set() });
          }
          cMap.get(cName)!.count++;
        });

        // Map checkins
        checkins.forEach((c: any) => {
          // Find delegate's committee
          const del = delegates.find((d: any) => d.id === c.delegate_id);
          if (del) {
            const cName = del.committee || "Unallocated";
            cMap.get(cName)?.checkedInSet.add(c.delegate_id);
          }
        });

        const arr = Array.from(cMap.entries())
          .map(([name, val]) => ({
            name,
            count: val.count,
            checkedIn: val.checkedInSet.size,
          }))
          .sort((a, b) => b.count - a.count);

        setCommittees(arr);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When a committee is clicked, it shows the details
  if (activeCommittee) {
    const committeeDelegates = rawDelegates.filter(
      (d) => (d.committee || "Unallocated") === activeCommittee &&
        (d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         d.email.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => {
                setActiveCommittee(null);
                setSearchQuery("");
              }}
              className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition mb-2 py-1.5 px-3 -ml-3 rounded-lg hover:bg-amber-500/10 text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Overview
            </button>
            <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Users className="w-8 h-8 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" /> {activeCommittee}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Viewing delegates allocated to this group.
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:flex-none group">
              <Search className="absolute w-4 h-4 text-zinc-500 left-3 top-1/2 -translate-y-1/2 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-black/40 border border-white/5 text-white rounded-xl pl-10 pr-4 py-2 outline-none focus:border-amber-500/50 transition shadow-lg text-sm"
              />
            </div>
            <button
              onClick={() => exportToCSV(activeCommittee, committeeDelegates)}
              className="flex items-center gap-2 bg-zinc-900 border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400 text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="border border-white/5 rounded-3xl overflow-hidden bg-black/60 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent" />
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-black/40 text-zinc-500 border-b border-white/5 uppercase text-[10px] tracking-widest font-black">
                <tr>
                  <th className="px-6 py-4">Delegate</th>
                  <th className="px-4 py-4 text-center">D1 Reg</th>
                  <th className="px-4 py-4 text-center">D1 Com</th>
                  <th className="px-4 py-4 text-center">D2 Reg</th>
                  <th className="px-4 py-4 text-center">D2 Com</th>
                  <th className="px-4 py-4 text-center">D3 Reg</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {committeeDelegates.map((del) => {
                  const delCheckins = rawCheckins.filter(c => c.delegate_id === del.id);
                  
                  const StatusIcon = ({ checked }: { checked: boolean }) => (
                    <div className="flex justify-center">
                      {checked ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700/50">
                          <XCircle className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <tr
                      key={del.id}
                      className="hover:bg-white/5 transition cursor-pointer group"
                      onClick={() => setSelectedDelegate(del)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-white group-hover:text-amber-500 transition">
                          {del.full_name}
                        </div>
                        <div className="text-zinc-500 text-[10px] font-black uppercase tracking-wider truncate w-32 md:w-auto mt-0.5">
                          {del.country || "Unknown Country"}
                        </div>
                      </td>
                      <td className="px-4 py-4"><StatusIcon checked={delCheckins.some(c => c.day === 1 && c.checkpoint === 'registration')} /></td>
                      <td className="px-4 py-4"><StatusIcon checked={delCheckins.some(c => c.day === 1 && c.checkpoint === 'committee')} /></td>
                      <td className="px-4 py-4"><StatusIcon checked={delCheckins.some(c => c.day === 2 && c.checkpoint === 'registration')} /></td>
                      <td className="px-4 py-4"><StatusIcon checked={delCheckins.some(c => c.day === 2 && c.checkpoint === 'committee')} /></td>
                      <td className="px-4 py-4"><StatusIcon checked={delCheckins.some(c => c.day === 3 && c.checkpoint === 'registration')} /></td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {committeeDelegates.length === 0 && (
            <div className="px-6 py-12 text-center text-zinc-500">
              No delegates found in this category.
            </div>
          )}
        </div>

        {/* Selected Delegate Detail Modal */}
        {selectedDelegate && (
          <DelegateProfileModal
            delegate={selectedDelegate as any}
            onClose={() => setSelectedDelegate(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-amber-500" /> Committee Progress
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time breakdown of allocation counts and check-ins.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-xl text-xs font-black uppercase tracking-widest text-black shadow-[0_0_15px_rgba(245,158,11,0.2)] transition active:scale-95"
        >
          Recalculate
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-black/40 border border-white/5 rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-6 w-32 bg-zinc-800" />
                <Skeleton className="h-6 w-16 bg-zinc-800" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 bg-zinc-800" />
                  <Skeleton className="h-4 w-8 bg-zinc-800" />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <Skeleton className="h-4 w-20 bg-zinc-800" />
                  <Skeleton className="h-4 w-8 bg-zinc-800" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {committees.map((c) => (
            <div
              key={c.name}
              onClick={() => setActiveCommittee(c.name)}
              className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 hover:bg-zinc-900/80 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <h3 className="font-black text-lg text-white group-hover:text-amber-500 transition flex items-center gap-2 leading-tight pr-4">
                  {c.name}
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 -ml-1" />
                </h3>
                <div className="bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-inner">
                  {c.count > 0 ? ((c.checkedIn / c.count) * 100).toFixed(0) : 0}%
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <Users className="w-3.5 h-3.5 text-zinc-400" /> Total Allocated
                  </div>
                  <span className="font-mono text-white bg-black border border-white/5 px-2 py-0.5 rounded shadow-inner text-xs">
                    {c.count}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-white/5 pt-3">
                  <span className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                    Checked In
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-xs">
                    {c.checkedIn}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-2 border border-zinc-900">
                  <div
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                    style={{
                      width: `${c.count > 0 ? (c.checkedIn / c.count) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
