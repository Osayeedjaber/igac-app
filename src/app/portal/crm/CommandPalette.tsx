"use client";

import * as React from "react";
import { 
  Search, 
  Loader2, 
  Users, 
  UploadCloud, 
  LayoutList, 
  Activity, 
  ShieldAlert, 
  Radio,
  User,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'tab' | 'delegate', value: string) => void;
  delegates: any[];
}

export function CommandPalette({ isOpen, onClose, onSelect, delegates }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  
  const tabs = [
    { id: 'registry', label: 'Delegate Registry', icon: <Users className="w-5 h-5" /> },
    { id: 'ingestion', label: 'Data Ingestion Hub', icon: <UploadCloud className="w-5 h-5" /> },
    { id: 'committees', label: 'Committees & Allocation', icon: <LayoutList className="w-5 h-5" /> },
    { id: 'logs', label: 'Live Scan Logs', icon: <Activity className="w-5 h-5" /> },
    { id: 'secretariat', label: 'Secretariat Profiles', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'command', label: 'Command Center', icon: <Radio className="w-5 h-5 text-emerald-400" /> },
  ];

  const filteredTabs = query === "" ? tabs : tabs.filter(t => 
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDelegates = query.length < 2 ? [] : delegates.filter(d => 
    d.full_name.toLowerCase().includes(query.toLowerCase()) ||
    d.email.toLowerCase().includes(query.toLowerCase()) ||
    d.transaction_id?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // This logic is handled by parent, but we keep it safe
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-4 border-b border-zinc-800">
            <Search className="w-5 h-5 text-zinc-500 mr-3" />
            <input
              autoFocus
              placeholder="Search tabs, delegates, or transaction IDs... (Ctrl+K)"
              className="flex-1 bg-transparent text-white outline-none placeholder:text-zinc-600 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-1 ml-3 px-2 py-1 bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 border border-zinc-700">
              <span className="text-xs">ESC</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2 focus:outline-none custom-scrollbar">
            {/* Tabs Section */}
            {filteredTabs.length > 0 && (
              <div className="mb-4">
                <h3 className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Navigation</h3>
                <div className="space-y-1">
                  {filteredTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { onSelect('tab', tab.id); onClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-yellow-500/10 hover:text-yellow-400 text-zinc-300 transition-all text-sm group"
                    >
                      <span className="flex-shrink-0 text-zinc-500 group-hover:text-yellow-400 group-hover:scale-110 transition-all">{tab.icon}</span>
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delegates Section */}
            {filteredDelegates.length > 0 && (
              <div>
                <h3 className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Delegates</h3>
                <div className="space-y-1">
                  {filteredDelegates.map(del => (
                    <button
                      key={del.id}
                      onClick={() => { onSelect('delegate', del.id); onClose(); }}
                      className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-blue-500/10 text-left transition-all group border border-transparent hover:border-blue-500/20"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                        <User className="w-5 h-5 text-zinc-500 group-hover:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-white font-bold group-hover:text-blue-400 transition-colors truncate">{del.full_name}</span>
                        <span className="block text-xs text-zinc-500 truncate">{del.email}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-zinc-800 group-hover:border-blue-500/30 group-hover:text-blue-300 transition-all">
                          <Hash className="w-3 h-3 opacity-50" />
                          {del.transaction_id || 'NO_TX'}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest group-hover:text-zinc-400 transition-colors">{del.committee || 'UNALLOCATED'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query !== "" && filteredTabs.length === 0 && filteredDelegates.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-zinc-500 text-sm">No results found for "<span className="text-white font-semibold">{query}</span>"</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><span className="p-0.5 bg-zinc-800 rounded border border-zinc-700">↑↓</span> TO NAVIGATE</span>
              <span className="flex items-center gap-1"><span className="p-0.5 bg-zinc-800 rounded border border-zinc-700">ENTER</span> TO SELECT</span>
            </div>
            <span>Press <span className="text-zinc-400">Ctrl+K</span> again to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
