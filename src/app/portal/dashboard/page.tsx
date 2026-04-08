"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Users, QrCode, LogOut, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Database } from "@/lib/database.types";

type Delegate = Database["public"]["Tables"]["delegates"]["Row"];
type Checkin = Database["public"]["Tables"]["delegate_checkins"]["Row"];

export default function PortalDashboard() {
  const router = useRouter();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    const loadData = async () => {
      // 1. Verify session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/portal/login");
        return;
      }

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
  
  // Example Stat: How many unique people have checked into Registration today (Day 1 for example)
  // In a real app we might make these dynamically filtered by a dropdown
  const day1RegCheckins = checkins.filter(c => c.day === 1 && c.checkpoint === "registration").length;

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <span className="text-sm font-medium">Day 1 Registrations</span>
            </div>
            <div className="text-3xl font-bold text-white">{day1RegCheckins}</div>
          </div>
        </div>

        {/* Delegate List (simplified) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Delegate Overview</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-black/20 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Delegate Name</th>
                  <th className="px-6 py-3">Country</th>
                  <th className="px-6 py-3">Committee</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {delegates.map((del) => {
                  // Find if they have any checkins
                  const checks = checkins.filter(c => c.delegate_id === del.id);
                  const isHereToday = checks.length > 0;
                  
                  return (
                    <tr key={del.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{del.full_name}</td>
                      <td className="px-6 py-4">{del.country}</td>
                      <td className="px-6 py-4">{del.committee}</td>
                      <td className="px-6 py-4">
                        {isHereToday ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500 border border-green-500/20">
                            Scanned ({checks.length}x)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-400 border border-zinc-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {delegates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                      No delegates populated in the database yet.
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