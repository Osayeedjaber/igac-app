"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Database } from "@/lib/database.types";
import { fetchSystemSettingsAction } from "../crm/actions";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

// Dynamically import the Scanner so it never tries to render on the server (which lacks camera APIs)
const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then(mod => mod.Scanner), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full flex-col items-center justify-center bg-black/80 space-y-4 p-6 text-orange-500">
      <Loader2 className="h-10 w-10 animate-spin" />
      <p className="text-sm font-medium animate-pulse">Initializing Camera...</p>
    </div>
  )
});

// Helper for Acoustic & Haptic Feedback
const triggerHaptic = (success: boolean) => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  
  try {
    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const audio = new Audio("data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/zEwgAQAABAwH4AAIAAAAAMHhAwwAAAAMQBgAAAAAAH270sP//AAAEgAAAAAAnZqqqAAA/zEwhBQAAChBf4AAYAAAANm2TcwAAAAi/gDAAAAAAB9p0x///wAAACAAAAAAMbQAAAAC/zEwhCgAAAgyf4QBAAAAANi0lMwAAAAhWADAAAAAABFk///wAAAAYQAAAAAM2gAAAP//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
      if (audio) audio.play().catch(() => {});
    } else {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
      const audio = new Audio("data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq/zEwgAQAABAwH4AAIAAAAAMHhAwwAAAAMQBgAAAAAAH270sP//AAAEgAAAAAAnZqqqAAA/zEwhBQAAChBf4AAYAAAANm2TcwAAAAi/gDAAAAAAB9p0x///wAAACAAAAAAMbQAAAAC/zEwhCgAAAgyf4QBAAAAANi0lMwAAAAhWADAAAAAABFk///wAAAAYQAAAAAM2gAAAP//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"); // same tone, but just short error beep
      if (audio) {
        audio.playbackRate = 0.5;
        audio.play().catch(() => {});
      }
    }
  } catch (e) {
    // ignore user-interaction audio play errors
  }
};

type Delegate = Database["public"]["Tables"]["delegates"]["Row"];

export default function PortalScan() {
  const router = useRouter();
  const [day, setDay] = useState<1 | 2 | 3>(1); // Default to Day 1
  const [checkpoint, setCheckpoint] = useState<"registration" | "committee">("registration");
  const [globalCheckpoint, setGlobalCheckpoint] = useState<"registration" | "committee" | "both">("both");
  const [scanType, setScanType] = useState<"ENTRY" | "EXIT">("ENTRY");
  const [isModeLocked, setIsModeLocked] = useState(false);
  
  const [scanState, setScanState] = useState<"idle" | "verifying" | "action_required" | "edit_auth" | "editing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastScanned, setLastScanned] = useState<Delegate | null>(null);
  const [scannedPayload, setScannedPayload] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  const [activeDay, setActiveDay] = useState(1);
  const [offlineDelegates, setOfflineDelegates] = useState<Delegate[]>([]);
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [editorNameInput, setEditorNameInput] = useState("");
  const [editForm, setEditForm] = useState({ full_name: "", committee: "", country: "" });
  
  const [transPassword, setTransPassword] = useState("");
  const [showTransaction, setShowTransaction] = useState(false);
  const [transError, setTransError] = useState("");

  const [secretariatId, setSecretariatId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  // Cache Delegates locally for faster offline lookups and resilience
  const fetchDelegatesToCache = async () => {
    setIsRefreshingCache(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("delegates")
        .select("*");
      if (error) throw error;
      if (data) {
        setOfflineDelegates(data);
        localStorage.setItem("scanner_delegate_cache", JSON.stringify(data));
      }
    } catch (e: any) {
      console.error("Cache refresh failed:", e);
      // fallback to old cache if network drops
      const cached = localStorage.getItem("scanner_delegate_cache");
      if (cached) setOfflineDelegates(JSON.parse(cached));
    }
    setIsRefreshingCache(false);
  };

  useEffect(() => {
    const supabase = getSupabase();

    // Load static cache first to prevent lag
    const cached = localStorage.getItem("scanner_delegate_cache");
    if (cached) setOfflineDelegates(JSON.parse(cached));
    fetchDelegatesToCache();

    // Authenticate the active Secretariat member
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/portal/login");
        return;
      }
      setSecretariatId(session.user.id);
      setIsReady(true);
    });

    const loadSettings = async () => {
      try {
        const res = await fetchSystemSettingsAction();
        if (res) {
          const activeDay = res.active_day as 1 | 2 | 3;
          setDay(activeDay);
          const cp = res.active_checkpoint as "registration" | "committee" | "both";
          setGlobalCheckpoint(cp);
          
          if (res.active_scan_mode) {
             setScanType(res.active_scan_mode as "ENTRY" | "EXIT");
          }
          
          // Force checkpoint to registration if it's Day 3 and committee was active
          if (activeDay === 3) {
            setCheckpoint("registration");
          } else if (cp !== "both") {
            setCheckpoint(cp);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
      
      const pollData = () => {
        loadSettings();
        fetchDelegatesToCache();
      };
      
      pollData();
      const iv = setInterval(pollData, 120000); // Poll every 2 minutes instead of 15 seconds to prevent Supabase data overload
    return () => clearInterval(iv);
  }, [router]);

  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!secretariatId || scanState !== "idle" || isProcessingScan) return;

    // Only take the first text value it detected
    const qrToken = detectedCodes[0]?.rawValue;
    if (!qrToken) return;

    setIsProcessingScan(true);

    const safePayload = String(qrToken).trim();
    setScannedPayload(safePayload);
    setLastScanned(null);
    setShowTransaction(false);
    setTransPassword("");
    setTransError("");

    // Throttle duplicate fast reads by locking the cycle
    setScanState("verifying");
    setMessage("Verifying token...");
    
    const supabase = getSupabase();

    // 1. Fetch the exact delegate from the database
    const { data: delegates, error: delError } = await supabase
      .from("delegates")
      .select("*")
      .eq("qr_token", safePayload)
      .limit(1);

    if (delError || !delegates || delegates.length === 0) {
      setScanState("error");
      setMessage(`Unknown QR Code: "${safePayload}"`);
      resetStateAfterWait();
      return;
    }

    const targetDelegate = delegates[0];
    setLastScanned(targetDelegate); // Ensure delegate info is always set so it renders on screen

    // Instead of logging the check-in immediately, prompt the user for action
    setScanState("action_required");
    setMessage("Delegate Found - Action Required");
  };

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; data: { name: string; committee: string; country: string; day: number } | null; onConfirm: () => void } | null>(null);

  const confirmCheckIn = async () => {
    if (!lastScanned || !secretariatId) return;

    setConfirmDialog({
      isOpen: true,
      data: {
        name: lastScanned.full_name,
        committee: lastScanned.committee || 'Unallocated',
        country: lastScanned.country || 'No Country',
        day: day
      },
      onConfirm: async () => {
        setConfirmDialog(null);
        setScanState("verifying");
        setMessage("Processing Check-in...");
        const supabase = getSupabase();

        // Log the check-in
        const { error: chkError } = await supabase.from("delegate_checkins").insert({
          delegate_id: lastScanned.id,
          day: day,
          checkpoint: checkpoint,
          scanned_by_id: secretariatId,
          scan_type: scanType
        });

        if (chkError) {
          if (chkError.code === "23505") { // Postgres "unique violation" automatically handles double scans
            setScanState("error");
            setMessage(`${lastScanned.full_name} has ALREADY been scanned for Day ${day} (${checkpoint} ${scanType}).`);
            triggerHaptic(false);
          } else {
            setScanState("error");
            setMessage(`Database Error: ${chkError.message}`);
            triggerHaptic(false);
          }
        } else {
          setScanHistory(prev => [{
            id: lastScanned.id,
            name: lastScanned.full_name,
            committee: lastScanned.committee,
            time: new Date().toLocaleTimeString(),
            type: scanType
          }, ...prev].slice(0, 10)); // Keep last 10
          setScanState("success");
          setMessage(`Successfully recorded ${scanType} for ${lastScanned.full_name}!`);
          triggerHaptic(true);
        }

        resetStateAfterWait();
      }
    });
  };

  const handleRevealTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (transPassword === 'osayeed5889@') {
      setShowTransaction(true);
      setTransError('');
    } else {
      setTransError('INVALID KEY');
    }
  };

  const verifyEditPassword = () => {
    if (passwordInput !== "subaru5889@") {
      setScanState("error");
      setMessage("Incorrect master password.");
      resetStateAfterWait();
      return;
    }
    if (!editorNameInput.trim()) {
      setScanState("error");
      setMessage("Please enter your name so we can record who authorized this edit.");
      resetStateAfterWait();
      return;
    }

    setEditForm({
      full_name: lastScanned?.full_name || "",
      committee: lastScanned?.committee || "",
      country: lastScanned?.country || "",
    });
    setScanState("editing");
    setPasswordInput("");
  };

  const submitEdit = async () => {
    if (!lastScanned || !secretariatId) return;
    setScanState("verifying");
    setMessage("Saving changes...");

    const supabase = getSupabase();
    
    // Log what changed explicitly
    const oldData = {
        full_name: lastScanned.full_name,
        committee: lastScanned.committee,
        country: lastScanned.country,
    };
    const newData = {
        full_name: editForm.full_name,
        committee: editForm.committee,
        country: editForm.country,
    };

    // First update the delegate
    const { error: updateError } = await supabase
      .from("delegates")
      .update(newData)
      .eq("id", lastScanned.id);

    if (updateError) {
      setScanState("error");
      setMessage(`Update Failed: ${updateError.message}`);
      resetStateAfterWait();
      return;
    }

    // Now insert into the audit log
    const { error: auditError } = await (supabase as any)
      .from("delegate_edit_logs")
      .insert({
         delegate_id: lastScanned.id,
         edited_by: secretariatId,
         editor_name: editorNameInput,
         old_data: oldData as any,
         new_data: newData as any
      });

    if (auditError) {
       console.error("Audit log failed to save, but update succeeded:", auditError);
       // We still tell the user it updated successfully even if the audit log failed,
       // but ideally this won't happen.
    }

    // Update local state so UI reflects changes
    setLastScanned({ ...lastScanned, ...editForm });
    setScanState("success");
    setMessage(`Delegate details updated successfully!`);
    resetStateAfterWait();
  };

  const resetStateAfterWait = () => {
    // Reset scanner state after 3 seconds to allow reading the next person
    setTimeout(() => {
      setScanState("idle");
      setShowTransaction(false);
      setTransPassword("");
      setTransError("");
      setIsProcessingScan(false); // Unblock the camera hardware lock
      // Don't erase the message immediately so they can still read what just happened
    }, 3000);
  };

  if (!isReady) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center bg-black p-4 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <Link href="/portal/dashboard" className="rounded-lg bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Delegation Scanner</h1>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-bl-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            Global Sync Active
          </div>

          <div className="space-y-2 mt-2">
            <label className="text-sm font-medium text-emerald-400/80">Conference Day</label>
            <div className="grid grid-cols-3 gap-2 opacity-80 pointer-events-none">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  className={`rounded-xl py-2 text-sm font-bold transition-all ${day === d ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20" : "bg-black/50 text-emerald-500/50 border border-emerald-500/20"}`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-400/80">Checkpoint Location</label>
            <div className={`grid ${globalCheckpoint === 'both' ? 'grid-cols-2' : 'grid-cols-2 opacity-80 pointer-events-none'} gap-2`}>
              {["registration", "committee"].map((cp) => {
                const isDisabled = day === 3 && cp === "committee";
                return (
                  <button
                    key={cp}
                    disabled={isDisabled}
                    onClick={() => {
                      if (globalCheckpoint === 'both' && !isDisabled) {
                        setCheckpoint(cp as "registration" | "committee");
                      }
                    }}
                    className={`rounded-xl py-2 text-sm font-bold capitalize transition-all ${
                      checkpoint === cp 
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                        : isDisabled
                          ? "bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed"
                          : "bg-black/50 text-blue-400/50 border border-blue-500/20"
                    }`}
                  >
                    {cp} {isDisabled && "(N/A)"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-400/80">Scan Mode</label>
            <div className="grid grid-cols-2 gap-2 opacity-80 pointer-events-none">
              <button
                className={`rounded-xl py-2 text-sm font-bold transition-all ${scanType === "ENTRY" ? "bg-green-500 text-green-950 shadow-lg shadow-green-500/20" : "bg-black/50 text-green-500/50 border border-green-500/20"}`}
              >
                ENTRY
              </button>
              <button
                className={`rounded-xl py-2 text-sm font-bold transition-all ${scanType === "EXIT" ? "bg-rose-500 text-rose-950 shadow-lg shadow-rose-500/20" : "bg-black/50 text-rose-500/50 border border-rose-500/20"}`}
              >
                EXIT
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Reader Box */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-xl">
          <div className="aspect-[4/5] w-full">
            {typeof window !== "undefined" && !window.isSecureContext ? (
               <div className="flex h-full flex-col items-center justify-center bg-red-500/20 text-center space-y-4 p-6 border border-red-500/50">
                 <AlertCircle className="h-10 w-10 text-red-500" />
                 <div>
                   <h3 className="font-bold text-red-500">Camera Blocked</h3>
                   <p className="text-xs text-red-200 mt-2">
                     Browsers block camera access on mobile devices unless the site is secured by HTTPS.
                     If you are testing on your local network (e.g. 192.168.x.x), use an HTTPS tunnel like ngrok.
                   </p>
                 </div>
               </div>
            ) : scanState === "idle" || scanState.startsWith("action") || scanState.startsWith("edit") || scanState === "success" || scanState === "error" ? (
              <Scanner 
                key={scannerKey}
                onScan={handleScan}
                onError={(err: any) => {
                  setScanState("error");
                  setMessage(err?.message || "Camera access denied or device unsupported.");
                }}
                formats={["qr_code"]}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-black/80 space-y-4 p-6">
                <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                <p className="text-sm font-medium text-white animate-pulse">Running Secure Search...</p>
              </div>
            )}
          </div>
          
          {/* Overlay Status Feeds */}
          {scanState === "action_required" && lastScanned && (
             <div className="absolute inset-0 z-10 flex flex-col bg-blue-950/95 backdrop-blur-md p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto border border-blue-500/20">
               <div className="m-auto w-full flex flex-col">
                 <div className="flex flex-col items-center">
                   <CheckCircle2 className="h-12 w-12 text-blue-400 mb-2 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                   <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Review Required</h2>
                 </div>
               
               <div className="mt-4 w-full rounded-2xl bg-black/60 p-5 text-left border border-white/10 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                    <CheckCircle2 className="w-32 h-32 text-blue-500" />
                 </div>
                 <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                   <span>{lastScanned.country || "Unallocated"}</span>
                   <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                   <span>{lastScanned.committee || "Unallocated"}</span>
                 </p>
                 <p className="text-2xl text-white font-extrabold leading-tight">{lastScanned.full_name}</p>
                 
                 <div className="mt-4 border-t border-white/10 pt-3">
                   <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-1">Check-in Status</p>
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 font-bold rounded border border-blue-500/20 text-sm tracking-wide">
                     Day {day} <ArrowLeft className="w-3 h-3 rotate-180 opacity-50" /> <span className="capitalize">{checkpoint}</span>
                   </div>
                 </div>
               </div>

               {/* Transaction Protection inside Active Scan */}
               <div className="w-full mt-4 bg-zinc-900/80 border border-emerald-500/10 p-4 rounded-xl relative overflow-hidden">
                 <h3 className="text-xs font-bold text-emerald-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    Financial Data Override
                 </h3>
                 {!showTransaction ? (
                    <form onSubmit={handleRevealTransaction} className="flex flex-col gap-2 relative z-10 w-full">
                      <div className="flex gap-2 w-full">
                        <input 
                          type="password" 
                          placeholder="Admin Key..." 
                          className="w-full bg-black/50 border border-emerald-900/50 rounded px-3 py-2 text-white text-sm outline-none focus:border-emerald-500 transition font-mono min-w-0"
                          value={transPassword}
                          onChange={e => setTransPassword(e.target.value)}
                        />
                        <button type="submit" className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 text-sm font-bold px-4 py-2 rounded transition whitespace-nowrap uppercase tracking-wider flex-shrink-0">
                          Reveal
                        </button>
                      </div>
                      {transError && <span className="text-[10px] text-red-500 uppercase font-bold">{transError}</span>}
                    </form>
                 ) : (
                    <div className="bg-black/50 border border-emerald-500/30 p-3 rounded font-mono text-emerald-400 text-sm break-all block w-full overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)] z-10 relative">
                      {lastScanned.transaction_id || 'NO_TRANSACTION_ID_FOUND'}
                    </div>
                 )}
               </div>

               <div className="w-full mt-6 space-y-3">
                 <button onClick={confirmCheckIn} className={`w-full rounded-xl bg-gradient-to-r ${scanType === 'ENTRY' ? 'from-blue-600 to-sky-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'from-rose-600 to-orange-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'} py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-wider`}>
                   Authorize {scanType === 'ENTRY' ? 'Entry' : 'Exit'} 
                 </button>
                 <div className="grid grid-cols-2 gap-3 pb-8">
                   <button onClick={() => setScanState("edit_auth")} className="rounded-xl bg-black/50 py-3 font-semibold text-zinc-300 border border-white/10 hover:bg-white/10 transition-colors">
                     Edit Profile
                   </button>
                   <button onClick={() => {setScanState("idle"); setShowTransaction(false); setTransPassword(""); setTransError(""); setMessage("");}} className="rounded-xl bg-rose-500/10 py-3 font-semibold text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-colors">
                     Abort
                   </button>
                 </div>
               </div>
               </div>
             </div>
          )}

          {scanState === "edit_auth" && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md p-6 text-center animate-in fade-in zoom-in duration-200">
                <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Admin Override</h2>
                <p className="text-sm text-zinc-400 mb-6">Enter password and your name to authorize changes.</p>
                
                <input 
                  type="text" 
                  value={editorNameInput}
                  onChange={(e) => setEditorNameInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none mb-3 text-center"
                  placeholder="Your Full Name (Audit Log)" 
                />

                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none mb-4 text-center"
                  placeholder="Master Override Password" 
                />

                <div className="w-full grid grid-cols-2 gap-3">
                  <button onClick={() => setScanState("action_required")} className="rounded-xl bg-white/5 py-3 font-semibold text-white border border-white/10">
                    Cancel
                  </button>
                  <button onClick={verifyEditPassword} className="rounded-xl bg-orange-500 py-3 font-semibold text-white shadow-lg">
                    Verify
                  </button>
                </div>
             </div>
          )}

          {scanState === "editing" && lastScanned && (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-start bg-zinc-900 backdrop-blur-xl p-6 text-center animate-in slide-in-from-bottom duration-300 overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-6 pt-4">Edit Delegate</h2>
                
                <div className="w-full space-y-4 text-left">
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold uppercase ml-1">Full Name</label>
                    <input 
                      value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                      className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold uppercase ml-1">Committee</label>
                    <input 
                      value={editForm.committee} onChange={e => setEditForm({...editForm, committee: e.target.value})}
                      className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold uppercase ml-1">Country</label>
                    <input 
                      value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})}
                      className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 pb-12">
                    <button onClick={() => setScanState("action_required")} className="rounded-xl bg-white/5 py-3 font-semibold text-white border border-white/10">Discard</button>
                    <button onClick={submitEdit} className="rounded-xl bg-green-500 py-3 font-semibold text-white">Save Changes</button>
                  </div>
                </div>
             </div>
          )}

          {scanState === "success" && (
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm p-6 text-center animate-in fade-in zoom-in duration-200 ${
              scanType === 'EXIT' 
                ? 'bg-rose-500/95' 
                : ((lastScanned as any)?.position?.toLowerCase().includes('ambassador') || lastScanned?.committee?.toLowerCase().includes('ambassador'))
                  ? 'bg-cyan-500/95' 
                  : 'bg-green-500/95'
            }`}>
              <CheckCircle2 className="h-16 w-16 text-white mb-2 shadow-xl rounded-full" />
              <h2 className="text-2xl font-bold text-white mb-2">{scanType === 'EXIT' ? 'Exit Recorded' : 'Access Granted'}</h2>
              <p className={`font-medium leading-tight ${
                scanType === 'EXIT'
                  ? 'text-rose-50'
                  : ((lastScanned as any)?.position?.toLowerCase().includes('ambassador') || lastScanned?.committee?.toLowerCase().includes('ambassador'))
                    ? 'text-cyan-50' 
                    : 'text-green-50'
              }`}>{message}</p>
              {lastScanned && (
                <div className="mt-4 w-full rounded-xl bg-black/20 p-4 text-left border border-white/10 overflow-hidden">
                  <p className="text-xs text-white/70 uppercase tracking-wide font-semibold truncate">{lastScanned.country} • {lastScanned.committee}</p>
                  <p className="text-lg text-white font-bold leading-tight mt-1">{lastScanned.full_name}</p>
                  <p className="text-xs font-bold uppercase mt-1 opacity-80 text-white">
                    {((lastScanned as any)?.position?.toLowerCase().includes('ambassador') || lastScanned?.committee?.toLowerCase().includes('ambassador')) ? 'Campus Ambassador' : 'Delegate'}
                  </p>
                  {scannedPayload && <p className="text-[10px] text-white/40 mt-3 font-mono break-all leading-tight">Code: {scannedPayload}</p>}
                </div>
              )}
            </div>
          )}

          {scanState === "error" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-600/95 backdrop-blur-sm p-6 text-center shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200">
              <AlertCircle className="h-16 w-16 text-white mb-2 drop-shadow-md" />
              <h2 className="text-2xl font-bold text-white mb-2">Scan Rejected</h2>
              <p className="text-red-50 font-medium leading-tight">{message}</p>
              
              {/* Show delegate info if found but rejected (e.g., duplicate scan) */}
              {lastScanned ? (
                <div className="mt-4 w-full rounded-xl bg-black/20 p-4 text-left border border-white/10 overflow-hidden">
                  <p className="text-xs text-white/70 uppercase tracking-wide font-semibold truncate text-red-200">{lastScanned.country} • {lastScanned.committee}</p>
                  <p className="text-lg text-white font-bold leading-tight mt-1">{lastScanned.full_name}</p>
                  {scannedPayload && <p className="text-[10px] text-white/40 mt-3 font-mono break-all leading-tight">Code: {scannedPayload}</p>}
                </div>
              ) : (
                /* Or show raw QR data if not found at all, safely truncated */
                <div className="mt-4 w-full rounded-xl bg-black/20 p-4 text-left border border-white/10 overflow-hidden">
                  <p className="text-xs text-red-200/80 uppercase tracking-wide font-semibold mb-1">Unknown QR Content</p>
                  <div className="text-xs font-mono text-white/70 break-all bg-black/30 p-2 rounded-lg max-h-24 overflow-y-auto">
                    {scannedPayload && scannedPayload.slice(0, 200)}
                    {scannedPayload && scannedPayload.length > 200 && <span className="text-red-400">...[truncated]</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className="text-center text-xs text-zinc-500">
          Hold QR code directly in front of the camera to verify access. The scanner resets automatically.
        </p>

        {/* Scan History Section */}
        {scanHistory.length > 0 && (
          <div className="pt-4 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-2">Recent Session Activity</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {scanHistory.map((scan, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${scan.type === 'ENTRY' ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {scan.type === 'ENTRY' ? 'IN' : 'OUT'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{scan.name}</p>
                    <p className="text-[10px] text-zinc-500 truncate uppercase mt-0.5">{scan.committee || 'Unallocated'}</p>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">
                    {scan.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom React Confirmation overlay */}
      {confirmDialog && confirmDialog.isOpen && confirmDialog.data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 text-center">Confirm Check-in</h3>
            <p className="text-sm text-zinc-400 mb-6 text-center leading-relaxed">
              Scan <span className="text-white font-bold">{confirmDialog.data.name}</span> in <span className="text-blue-400 font-semibold">{confirmDialog.data.committee}</span> <span className="text-zinc-500">({confirmDialog.data.country})</span> for <span className="text-white font-bold font-mono">Day {confirmDialog.data.day}</span>?
            </p>

            <div className="w-full flex gap-3">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors border border-white/5 active:scale-95"
              >
                No, Go Back
              </button>
              <button 
                onClick={() => {
                   confirmDialog.onConfirm();
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
              >
                Yes, Check In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}