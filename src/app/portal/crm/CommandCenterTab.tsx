'use client';

import { useState, useEffect } from 'react';
import { fetchSystemSettingsAction, updateSystemSettingsAction, fetchLiveAnalyticsAction } from './actions';
import { Loader2, Radio, CheckSquare, Settings2, BarChart3, Users, Clock, Activity } from 'lucide-react';

export function CommandCenterTab() {
  const [activeDay, setActiveDay] = useState(3);
  const [activeCheckpoint, setActiveCheckpoint] = useState('registration');
  const [activeScanMode, setActiveScanMode] = useState('ENTRY');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [stats, setStats] = useState<any>(null);
  const [isFetchingStats, setIsFetchingStats] = useState(true);

  // Initialize data
  useEffect(() => {
    loadSettings();
  }, []);

  // Poll analytics every 10 seconds
  useEffect(() => {
    loadAnalytics(activeDay);
    const interval = setInterval(() => loadAnalytics(activeDay), 10000);
    return () => clearInterval(interval);
  }, [activeDay]);

  async function loadSettings() {
    try {
      const data = await fetchSystemSettingsAction();
      if (data) {
        setActiveDay(data.active_day);
        setActiveCheckpoint(data.active_checkpoint);
        if (data.active_scan_mode) {
          setActiveScanMode(data.active_scan_mode);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAnalytics(day: number) {
    try {
      const result = await fetchLiveAnalyticsAction(day);
      setStats(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingStats(false);
    }
  }

  async function handleSaveSettings() {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateSystemSettingsAction({ 
        active_day: activeDay,
        active_checkpoint: activeCheckpoint,
        active_scan_mode: activeScanMode
      });
      setSaveMessage('Global Network Synced');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (e: any) {
      setSaveMessage('Error saving settings: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
            <Radio className="w-6 h-6 text-amber-500 animate-[pulse_2s_ease-in-out_infinite]" />
            Command Center
          </h2>
          <p className="text-sm text-zinc-400">Live active event settings and real-time registry analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Settings Master Switch */}
        <div className="lg:col-span-1 bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl h-min relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
          
          <h3 className="text-lg font-bold mb-4 text-zinc-100 flex items-center gap-2 pb-4 border-b border-white/5 relative z-10">
            <Settings2 className="w-5 h-5 text-amber-500" />
            Global Override
          </h3>
          <p className="text-[11px] text-zinc-400 mb-6 font-medium leading-relaxed bg-zinc-950 p-3 rounded-xl border border-white/5 relative z-10">
            Updating these values will force all physical scanning devices across the venue to sync to the specified day and checkpoint immediately.
          </p>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Conference Day</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(d => (
                  <button
                    key={d}
                    onClick={() => setActiveDay(d)}
                    className={`py-2 rounded-xl font-bold text-sm transition-all shadow-inner ${
                      activeDay === d 
                      ? 'bg-amber-500 border border-amber-400/50 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                      : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>
            </div>

            {activeDay !== 3 && (
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Active Checkpoint</label>
                <div className="grid grid-cols-3 gap-2">
                  {['registration', 'committee', 'both'].map(cp => (
                    <button
                      key={cp}
                      onClick={() => setActiveCheckpoint(cp)}
                      className={`py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-inner ${
                        activeCheckpoint === cp 
                        ? 'bg-amber-500 border border-amber-400/50 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                        : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {cp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Scan Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {['ENTRY', 'EXIT'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setActiveScanMode(mode)}
                    className={`py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-inner ${
                      activeScanMode === mode 
                      ? mode === 'ENTRY' ? 'bg-emerald-500 border border-emerald-400/50 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-rose-500 border border-rose-400/50 text-rose-950 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
              {isSaving ? 'Syncing Network...' : 'Force Sync Scanners'}
            </button>

            {saveMessage && (
              <p className={`text-center text-[11px] uppercase tracking-wider font-bold mt-3 ${saveMessage.includes('Error') ? 'text-rose-400' : 'text-amber-500'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Data Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
                <Users className="w-6 h-6 text-blue-500 opacity-30 absolute right-4 top-4" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 z-10">Total DB</span>
                <span className="font-mono text-3xl font-black text-white tracking-tight z-10">{stats ? stats.totalDelegates : '--'}</span>
              </div>
              
              <div className="bg-zinc-900/60 border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]">
                <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 z-10 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Checks
                </span>
                <span className="font-mono text-3xl font-black text-white tracking-tight z-10">
                  {stats ? stats.registeredCount : '--'}
                </span>
              </div>

              <div className="bg-zinc-900/60 border border-purple-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center shadow-[inset_0_0_20px_rgba(168,85,247,0.02)]">
                <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none" />
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1 z-10 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Committees
                </span>
                <span className="font-mono text-3xl font-black text-white tracking-tight z-10">
                  {stats ? stats.committeeCount : '--'}
                </span>
              </div>

              <div className="bg-zinc-900/60 border border-rose-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-center shadow-[inset_0_0_20px_rgba(244,63,94,0.02)]">
                <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-rose-500/5 to-transparent pointer-events-none" />
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 z-10 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Exited
                </span>
                <span className="font-mono text-3xl font-black text-white tracking-tight z-10">
                  {stats ? stats.exitCount : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* CHECK-IN VELOCITY CHART */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-zinc-100 flex items-center gap-2 border-b border-white/5 pb-4 relative z-10">
              <Activity className="w-4 h-4 text-sky-500" />
              Velocity Flow (Scans/Hour)
            </h3>
            
            <div className="h-44 flex items-end gap-2 px-4 pb-6 relative z-10 group">
              {stats && stats.velocityData && stats.velocityData.length > 0 ? (
                stats.velocityData.map((d: any, i: number) => {
                  const maxCount = Math.max(...stats.velocityData.map((x: any) => x.count));
                  const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group/bar relative">
                      <div 
                        style={{ height: `${height}%`, minHeight: '4px' }}
                        className="w-full bg-gradient-to-t from-sky-600/50 to-sky-400 rounded-t-md transition-all duration-500 group-hover/bar:from-sky-400 group-hover/bar:to-sky-300 relative border-t border-sky-300 shadow-[0_-5px_15px_rgba(14,165,233,0.3)]"
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                            {d.count} Scans
                         </div>
                      </div>
                      <span className="absolute -bottom-6 text-[9px] font-black text-zinc-500 group-hover/bar:text-zinc-300 transition-colors uppercase tracking-widest mt-2">
                        {d.time}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 italic bg-zinc-900/50 rounded-xl border border-white/5 p-4 border-dashed">
                  <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50">Waiting for live signal activity...</p>
                </div>
              )}
            </div>
            {/* Ambient Background Glow for Chart */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-sky-500/5 blur-[50px] pointer-events-none" />
          </div>

          <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-zinc-100 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Committees
              </div>
              {isFetchingStats ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-zinc-500 bg-zinc-950 px-3 py-1.5 rounded-full border border-white/5 uppercase shadow-inner">
                  <Clock className="w-3 h-3" />
                  Live Sync
                </div>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats && stats.committeeStats ? (
                Object.entries(stats.committeeStats)
                  .sort((a: any, b: any) => (b[1].comm_present / b[1].total) - (a[1].comm_present / a[1].total)) // Sort by completion percentage
                  .map(([comm, data]: any) => {
                    const regPercentage = data.total > 0 ? Math.round((data.reg_present / data.total) * 100) : 0;
                    const commPercentage = data.total > 0 ? Math.round((data.comm_present / data.total) * 100) : 0;
                    return (
                      <div key={comm} className="bg-zinc-950/80 border border-white/5 p-5 rounded-2xl relative overflow-hidden group shadow-inner">
                        <div 
                          className="absolute top-0 left-0 h-1/2 bg-emerald-500/5 transition-all duration-1000 ease-out z-0 border-b border-emerald-500/10" 
                          style={{ width: `${regPercentage}%` }}
                        />
                        <div 
                          className="absolute bottom-0 left-0 h-1/2 bg-purple-500/10 transition-all duration-1000 ease-out z-0 border-t border-purple-500/20 shadow-[inset_0_5px_10px_rgba(168,85,247,0.1)]" 
                          style={{ width: `${commPercentage}%` }}
                        />
                        <div className="relative z-10 flex justify-between items-end">
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Room</span>
                            <span className="font-bold text-white text-sm leading-none block line-clamp-1">{comm}</span>
                          </div>
                          <div className="text-right flex items-center justify-end gap-3.5">
                            <div className="flex flex-col items-end">
                              <span className="text-[8px] uppercase tracking-[0.2em] text-emerald-500 font-black">Reg</span>
                              <span className="text-base font-black font-mono text-emerald-100 leading-none">
                                {data.reg_present}
                              </span>
                            </div>
                            <div className="flex flex-col items-end border-l border-white/5 pl-3">
                              <span className="text-[8px] uppercase tracking-[0.2em] text-purple-400 font-black">Com</span>
                              <span className="text-base font-black font-mono text-purple-100 leading-none">
                                {data.comm_present}
                              </span>
                            </div>
                            <div className="flex flex-col items-end border-l border-white/5 pl-3">
                               <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500 font-black">Tot</span>
                               <span className="text-base font-black font-mono text-zinc-400 leading-none">{data.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                })
              ) : (
                <div className="col-span-full h-32 flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                  Loading telemetry...
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-zinc-100 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Live Network (Last 15 Scans)
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </span>
            </h3>

            <div className="space-y-2">
              {stats && stats.recentScans ? (
                stats.recentScans.length > 0 ? (
                  stats.recentScans.map((scan: any) => (
                    <div key={scan.id} className="flex justify-between items-center bg-zinc-950/80 border border-white/5 pr-4 rounded-xl overflow-hidden group hover:border-white/10 transition-colors shadow-inner">
                      <div className="flex items-center">
                        <div className={`w-1.5 h-[50px] flex-shrink-0 mr-4 shadow-xl ${scan.checkpoint === 'registration' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-purple-500 shadow-purple-500/50'}`}></div>
                        <div className="py-2">
                          <p className="text-xs font-bold text-white mb-1">{scan.full_name}</p>
                          <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 line-clamp-1">
                            {scan.country} <span className="opacity-50">•</span> {scan.committee}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md leading-none ${scan.checkpoint === 'registration' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                           {scan.checkpoint}
                        </span>
                        <p className="text-[10px] font-mono font-bold text-zinc-400">
                          {new Date(scan.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-zinc-500 py-8 font-black uppercase tracking-widest">No activity yet on Day {activeDay}.</p>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-zinc-600 space-y-4">
                  <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Link...</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}