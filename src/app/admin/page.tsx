"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("igac_admin_token");
    if (token) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("igac_admin_token", data.token);
        router.push("/admin/dashboard");
      } else {
        setError("Invalid password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#051b11] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-16 h-16 mb-4">
            <Image src="/logo.png" alt="IGAC" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Admin Portal</h1>
          <p className="text-sm text-[#94a3b8] mt-2">IGAC Content Management</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} className="bg-[#082216] border border-[#1e453e] rounded-2xl p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-[#94a3b8]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#051b11] border border-[#1e453e] rounded-lg px-4 py-3.5 text-white placeholder-[#94a3b8]/50 focus:border-[#d4af37] outline-none transition-colors"
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-[#051b11] font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-[#eac55a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-[#94a3b8]/40 mt-8">
          International Global Affairs Council &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
