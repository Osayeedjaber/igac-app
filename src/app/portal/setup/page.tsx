"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { ShieldCheck, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/portal/verify-invite?token=${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Failed to verify invitation.");
        } else {
          setInvitation(data); // data contains { valid, email, full_name }
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/portal/complete-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to complete setup.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/portal/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Setup error:", err);
      setError("Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-zinc-400">Verifying invitation...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-white">Account Created!</h1>
          <p className="text-zinc-400">
            Welcome to the team, <strong>{invitation?.full_name}</strong>.<br/>
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  // Verification errors (token invalid/expired) still show a fatal error screen
  if (error && !invitation) {
    return (
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-lg bg-rose-500/10 p-4 text-rose-500 border border-rose-500/20">
            {error}
          </div>
          <button 
            onClick={() => router.push("/")}
            className="text-sm text-zinc-400 underline hover:text-white transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-500">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Complete Your Setup
        </h1>
        <p className="text-sm text-zinc-400">
          Hello <strong>{invitation?.full_name}</strong>, please complete your profile.
        </p>
      </div>

      {error && invitation && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center animate-in fade-in zoom-in duration-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSetup} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Username</label>
            <input
              type="text"
              placeholder="e.g. zaber or subaru"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-700"
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 pl-4 pr-11 py-3 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              required
            />
          </div>
          
          <p className="text-[10px] text-zinc-500 italic">This username and password will be used along with your email to login to the scanner.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-all"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}

export default function AccountSetupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-black">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-orange-500" />}>
        <SetupContent />
      </Suspense>
    </div>
  );
}
