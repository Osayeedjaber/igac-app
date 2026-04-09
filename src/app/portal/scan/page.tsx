"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Database } from "@/lib/database.types";
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

type Delegate = Database["public"]["Tables"]["delegates"]["Row"];

export default function PortalScan() {
  const router = useRouter();
  const [day, setDay] = useState<1 | 2 | 3>(1);
  const [checkpoint, setCheckpoint] = useState<"registration" | "committee">("registration");
  
  const [scanState, setScanState] = useState<"idle" | "verifying" | "action_required" | "edit_auth" | "editing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastScanned, setLastScanned] = useState<Delegate | null>(null);
  const [scannedPayload, setScannedPayload] = useState<string | null>(null);

  const [passwordInput, setPasswordInput] = useState("");
  const [editorNameInput, setEditorNameInput] = useState("");
  const [editForm, setEditForm] = useState({ full_name: "", committee: "", country: "" });
  
  const [transPassword, setTransPassword] = useState("");
  const [showTransaction, setShowTransaction] = useState(false);
  const [transError, setTransError] = useState("");

  const [secretariatId, setSecretariatId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    
    // Authenticate the active Secretariat member
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/portal/login");
        return;
      }
      setSecretariatId(session.user.id);
      setIsReady(true);
    });
  }, [router]);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!secretariatId || scanState !== "idle") return;

    // Only take the first text value it detected
    const qrToken = detectedCodes[0]?.rawValue;
    if (!qrToken) return;

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

  const confirmCheckIn = async () => {
    if (!lastScanned || !secretariatId) return;

    if (!window.confirm(`Are you sure you want to scan ${lastScanned.full_name} with ${lastScanned.committee || 'Unallocated'} and ${lastScanned.country || 'No Country'} --- for Day ${day} (${checkpoint}) ---?`)) return;

    setScanState("verifying");
    setMessage("Processing Check-in...");
    const supabase = getSupabase();

    // Log the check-in
    const { error: chkError } = await supabase.from("delegate_checkins").insert({
      delegate_id: lastScanned.id,
      day: day,
      checkpoint: checkpoint,
      scanned_by_id: secretariatId,
    });

    if (chkError) {
      if (chkError.code === "23505") { // Postgres "unique violation" automatically handles double scans
        setScanState("error");
        setMessage(`${lastScanned.full_name} has ALREADY been scanned for Day ${day} (${checkpoint}).`);
      } else {
        setScanState("error");
        setMessage(`Database Error: ${chkError.message}`);
      }
    } else {
      setScanState("success");
      setMessage(`Successfully checked in ${lastScanned.full_name}!`);
    }

    resetStateAfterWait();
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
      alert("Incorrect master password.");
      return;
    }
    if (!editorNameInput.trim()) {
      alert("Please enter your name so we can record who authorized this edit.");
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Conference Day</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d as 1 | 2 | 3)}
                  className={`rounded-xl py-2 text-sm font-medium transition-all ${day === d ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-black/50 text-zinc-400 border border-white/10 hover:bg-white/5"}`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Checkpoint Location</label>
            <div className="grid grid-cols-2 gap-2">
              {["registration", "committee"].map((cp) => (
                <button
                  key={cp}
                  onClick={() => setCheckpoint(cp as "registration" | "committee")}
                  className={`rounded-xl py-2 text-sm font-medium capitalize transition-all ${checkpoint === cp ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-black/50 text-zinc-400 border border-white/10 hover:bg-white/5"}`}
                >
                  {cp}
                </button>
              ))}
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
             <div className="absolute inset-0 z-10 flex flex-col justify-center bg-blue-900/95 backdrop-blur-md p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto">
               <div className="flex flex-col items-center">
                 <CheckCircle2 className="h-12 w-12 text-blue-400 mb-2 drop-shadow-lg" />
                 <h2 className="text-xl font-bold text-white mb-2">Review Required</h2>
               </div>
               
               <div className="mt-2 w-full rounded-xl bg-black/40 p-4 text-left border border-white/10 shadow-inner">
                 <p className="text-xs text-blue-200 uppercase tracking-wide font-semibold truncate">{lastScanned.country} • {lastScanned.committee}</p>
                 <p className="text-xl text-white font-bold leading-tight mt-1">{lastScanned.full_name}</p>
               </div>

               {/* Transaction Protection inside Active Scan */}
               <div className="w-full mt-4 bg-zinc-900/80 border border-blue-500/20 p-4 rounded-xl">
                 <h3 className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider flex items-center justify-center gap-1">
                    Financial Data
                 </h3>
                 {!showTransaction ? (
                    <form onSubmit={handleRevealTransaction} className="flex gap-2 relative">
                      <input 
                        type="password" 
                        placeholder="Admin Key..." 
                        className="w-full bg-black/50 border border-blue-900/50 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition font-mono"
                        value={transPassword}
                        onChange={e => setTransPassword(e.target.value)}
                      />
                      <button type="submit" className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-sm font-bold px-3 py-2 rounded transition whitespace-nowrap uppercase">
                        Reveal
                      </button>
                      {transError && <span className="text-[10px] text-red-400 absolute -bottom-4 left-0 uppercase font-bold">{transError}</span>}
                    </form>
                 ) : (
                    <div className="bg-black/50 border border-blue-500/50 p-2 rounded font-mono text-emerald-400 text-sm text-center break-all">
                      {lastScanned.transaction_id || 'NO_TRANSACTION_ID_FOUND'}
                    </div>
                 )}
               </div>

               <div className="w-full mt-4 space-y-3">
                 <button onClick={confirmCheckIn} className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 shadow-xl shadow-blue-500/20">
                   Confirm Entry Check-in
                 </button>
                 <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setScanState("edit_auth")} className="rounded-xl bg-black/50 py-3 font-semibold text-zinc-300 border border-white/10 hover:bg-white/10">
                     Change Info
                   </button>
                   <button onClick={() => {setScanState("idle"); setShowTransaction(false); setTransPassword(""); setTransError(""); setMessage("");}} className="rounded-xl bg-red-950/50 py-3 font-semibold text-red-400 border border-red-500/20 hover:bg-red-900/50">
                     Cancel Scan
                   </button>
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

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button onClick={() => setScanState("action_required")} className="rounded-xl bg-white/5 py-3 font-semibold text-white border border-white/10">Discard</button>
                    <button onClick={submitEdit} className="rounded-xl bg-green-500 py-3 font-semibold text-white">Save Changes</button>
                  </div>
                </div>
             </div>
          )}

          {scanState === "success" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-green-500/95 backdrop-blur-sm p-6 text-center animate-in fade-in zoom-in duration-200">
              <CheckCircle2 className="h-16 w-16 text-white mb-2 shadow-xl rounded-full" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Granted</h2>
              <p className="text-green-50 font-medium leading-tight">{message}</p>
              {lastScanned && (
                <div className="mt-4 w-full rounded-xl bg-black/20 p-4 text-left border border-white/10 overflow-hidden">
                  <p className="text-xs text-white/70 uppercase tracking-wide font-semibold truncate">{lastScanned.country} • {lastScanned.committee}</p>
                  <p className="text-lg text-white font-bold leading-tight mt-1">{lastScanned.full_name}</p>
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

      </div>
    </div>
  );
}