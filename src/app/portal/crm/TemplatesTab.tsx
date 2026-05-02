"use client";

import { useState } from "react";
import PdfBuilder from "@/app/admin/dashboard/editor/components/PdfBuilder";
import EmailBuilder from "@/app/admin/dashboard/editor/components/EmailBuilder";

export function TemplatesTab() {
  const [activeTab, setActiveTab] = useState<"pdf" | "email">("pdf");

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-zinc-950/50 border border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
      
      {/* Tab Switcher */}
      <div className="flex space-x-2 p-4 border-b border-white/5 shrink-0 bg-black/40">
        <button
          onClick={() => setActiveTab("pdf")}
          className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg border ${
            activeTab === "pdf"
              ? "border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Event Pass Builder
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg border ${
            activeTab === "email"
              ? "border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              : "border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Email Designer
        </button>
      </div>

      {/* Content Area - Force Light Mode Context for Builders as they emulate standard white documents */}
      <div className="flex-1 overflow-hidden bg-white text-black root-light-mode">
        {activeTab === "pdf" && <PdfBuilder />}
        {activeTab === "email" && <EmailBuilder />}
      </div>
    </div>
  );
}
