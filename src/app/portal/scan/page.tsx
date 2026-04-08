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
  
  const [scanState, setScanState] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastScanned, setLastScanned] = useState<Delegate | null>(null);
  
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

    // Throttle duplicate fast reads by locking the cycle
    setScanState("verifying");
    setMessage("Verifying token...");
    
    const supabase = getSupabase();

    // 1. Fetch the exact delegate from the database
    const { data: delegates, error: delError } = await supabase
      .from("delegates")
      .select("*")
      .eq("qr_token", qrToken)
      .limit(1);

    if (delError || !delegates || delegates.length === 0) {
      setScanState("error");
      setMessage("Invalid QR Code: Delegate not found in system.");
      resetStateAfterWait();
      return;
    }

    const targetDelegate = delegates[0];

    // 2. Log the check-in immediately
    const { error: chkError } = await supabase.from("delegate_checkins").insert({
      delegate_id: targetDelegate.id,
      day: day,
      checkpoint: checkpoint,
      scanned_by_id: secretariatId,
    });

    if (chkError) {
      if (chkError.code === "23505") { // Postgres "unique violation" automatically handles double scans
        setScanState("error");
        setMessage(`${targetDelegate.full_name} has ALREADY been scanned for Day ${day} (${checkpoint}).`);
      } else {
        setScanState("error");
        setMessage(`Database Error: ${chkError.message}`);
      }
    } else {
      setScanState("success");
      setLastScanned(targetDelegate);
      setMessage(`Successfully scanned ${targetDelegate.full_name} into ${checkpoint}!`);
    }

    resetStateAfterWait();
  };

  const resetStateAfterWait = () => {
    // Reset scanner state after 3 seconds to allow reading the next person
    setTimeout(() => {
      setScanState("idle");
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
            ) : scanState === "idle" || scanState === "success" || scanState === "error" ? (
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
          {scanState === "success" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-green-500/90 backdrop-blur-sm p-6 text-center animate-in fade-in zoom-in duration-200">
              <CheckCircle2 className="h-16 w-16 text-white mb-4 shadow-xl rounded-full" />
              <h2 className="text-2xl font-bold text-white mb-2">Access Granted</h2>
              <p className="text-green-50 font-medium">{message}</p>
              {lastScanned && (
                <div className="mt-6 w-full rounded-xl bg-black/20 p-4 text-left">
                  <p className="text-xs text-white/70 uppercase tracking-widest font-semibold">{lastScanned.country}</p>
                  <p className="text-lg text-white font-bold truncate leading-tight">{lastScanned.committee}</p>
                </div>
              )}
            </div>
          )}

          {scanState === "error" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-500/95 backdrop-blur-sm p-6 text-center shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200">
              <AlertCircle className="h-16 w-16 text-white mb-4 drop-shadow-md" />
              <h2 className="text-2xl font-bold text-white mb-2">Scan Rejected</h2>
              <p className="text-red-50 font-medium leading-tight">{message}</p>
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