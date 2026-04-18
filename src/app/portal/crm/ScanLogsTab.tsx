'use client';

import { useState, useEffect } from 'react';
import { fetchScanLogsAction } from './actions';
import { format } from 'date-fns';
import { Activity, Clock, MapPin, User, ChevronRight } from 'lucide-react';

export function ScanLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchScanLogsAction();
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    
    // Optional: poll every 10 seconds for real-time feel
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" /> Master Scan Logs
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Live feed of all check-in activities across checkpoints.</p>
        </div>
        <button 
          onClick={fetchLogs} 
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] transition active:scale-95"
        >
          Refresh Feed
        </button>
      </div>

      <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none" />
        
        <table className="w-full text-left text-sm whitespace-nowrap relative z-10">
          <thead className="bg-black/40 border-b border-white/5 text-zinc-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-5">Timestamp</th>
              <th className="px-6 py-5">Delegate</th>
              <th className="px-6 py-5">Allocation</th>
              <th className="px-6 py-5">Checkpoint</th>
              <th className="px-6 py-5">Scanned By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">Synchronizing Feed...</td>
              </tr>
            ) : (!logs || logs.length === 0) ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs italic">No scan activity found.</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-start gap-2 text-zinc-300">
                      <Clock className="w-3 h-3 text-amber-500/50" />
                      <span className="font-mono text-xs">{format(new Date(log.scanned_at), 'hh:mm:ss a')}</span>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">{format(new Date(log.scanned_at), 'MMM dd')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{log.delegate?.full_name || 'Deleted Record...'}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-300 font-bold">{log.delegate?.committee || 'Unknown'}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                      <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500">{log.delegate?.country || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest shadow-inner">
                      <MapPin className="w-3 h-3" /> Day {log.day} - {log.checkpoint}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    <div className="flex items-center gap-2 text-xs font-bold">
                       <User className="w-3 h-3 text-zinc-500" />
                       {log.scanned_by?.full_name || 'System'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}