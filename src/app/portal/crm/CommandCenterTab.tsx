'use client';

import { useState, useEffect } from 'react';
import { fetchSystemSettingsAction, updateSystemSettingsAction, fetchLiveAnalyticsAction } from './actions';
import { Loader2, Radio, CheckSquare, Settings2, BarChart3, Users, Clock, Activity } from 'lucide-react';

export function CommandCenterTab() {
  const [activeDay, setActiveDay] = useState(1);
  const [activeCheckpoint, setActiveCheckpoint] = useState('registration');
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
      await updateSystemSettingsAction({ active_day: activeDay, active_checkpoint: activeCheckpoint });
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
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
            Command Center
          </h2>
          <p className="text-sm text-zinc-400">Live active event settings and real-time registry analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Settings Master Switch */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50 h-min">
          <h3 className="text-lg font-bold mb-4 text-zinc-100 flex items-center gap-2 pb-4 border-b border-white/5">
            <Settings2 className="w-5 h-5 text-emerald-500" />
            Global Scanner Override
          </h3>
          <p className="text-xs text-zinc-400 mb-6 font-medium leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
            Updating these values will immediately force all physical scanning devices operating in the Secretariat Portal to sync to the specified day and checkpoint.
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Active Conference Day</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(d => (
                  <button
                    key={d}
                    onClick={() => setActiveDay(d)}
                    className={`py-2 rounded-lg font-bold text-sm transition-all ${
                      activeDay === d 
                      ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Active Checkpoint</label>
              <div className="grid grid-cols-3 gap-2">
                {['registration', 'committee', 'both'].map(cp => (
                  <button
                    key={cp}
                    onClick={() => setActiveCheckpoint(cp)}
                    className={`py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all ${
                      activeCheckpoint === cp 
                      ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {cp}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radio className="w-5 h-5" />}
              {isSaving ? 'Syncing Network...' : 'Force Sync Global Scanners'}
            </button>

            {saveMessage && (
              <p className={`text-center text-sm font-bold mt-2 ${saveMessage.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Data Feed */}
        <div className="lg:col-span-2 space-y-6">
          
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center">
              <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
              <Users className="w-8 h-8 text-blue-500 opacity-20 absolute right-4 top-4" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 z-10">Total Database</span>
              <span className="font-mono text-3xl font-black text-white tracking-tight z-10">{stats ? stats.totalDelegates : '--'}</span>
            </div>
            
            <div className="bg-zinc-900 border border-emerald-900/40 rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 z-10 flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Registrations
              </span>
              <span className="font-mono text-3xl font-black text-emerald-50 tracking-tight z-10">
                {stats ? stats.registeredCount : '--'}
              </span>
            </div>

            <div className="bg-zinc-900 border border-purple-900/40 rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.05)]">
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1 z-10 flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                In Committees
              </span>
              <span className="font-mono text-3xl font-black text-purple-50 tracking-tight z-10">
                {stats ? stats.committeeCount : '--'}
              </span>
            </div>

            <div className="bg-zinc-900 border border-rose-900/40 rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.05)]">
              <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 z-10 flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Exited Venue
              </span>
              <span className="font-mono text-3xl font-black text-rose-50 tracking-tight z-10">
                {stats ? stats.exitCount : '--'}
              </span>
            </div>
          </div>

          {/* CHECK-IN VELOCITY CHART */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50">
            <h3 className="text-lg font-bold mb-6 text-zinc-100 flex items-center gap-2 border-b border-white/5 pb-4">
              <Activity className="w-5 h-5 text-emerald-500" />
              Check-in Velocity (Flow Rate/Hour)
            </h3>
            
            <div className="h-48 flex items-end gap-2 px-4 pb-8 relative group">
              {stats && stats.velocityData && stats.velocityData.length > 0 ? (
                stats.velocityData.map((d: any, i: number) => {
                  const maxCount = Math.max(...stats.velocityData.map((x: any) => x.count));
                  const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group/bar relative">
                      <div 
                        style={{ height: `${height}%`, minHeight: '4px' }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-500 group-hover/bar:from-emerald-400 group-hover/bar:to-emerald-300 relative"
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                            {d.count} Scans
                         </div>
                      </div>
                      <span className="absolute -bottom-6 text-[10px] font-bold text-zinc-500 group-hover/bar:text-zinc-300 transition-colors uppercase tracking-tighter">
                        {d.time}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 italic bg-black/20 rounded-lg border border-white/5 p-4 border-dashed">
                  <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs uppercase font-bold tracking-widest opacity-50">Waiting for live signal activity...</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50">
            <h3 className="text-lg font-bold mb-6 text-zinc-100 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Committee Arrival Statistics (Day {activeDay})
              </div>
              {isFetchingStats ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-black p-2 rounded-lg border border-white/5">
                  <Clock className="w-3.5 h-3.5" />
                  Live Feed Refresh 10s
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
                      <div key={comm} className="bg-black/40 border border-white/5 p-4 rounded-xl relative overflow-hidden group">
                        <div 
                          className="absolute top-0 left-0 h-1/2 bg-emerald-500/10 transition-all duration-1000 ease-out z-0" 
                          style={{ width: `${regPercentage}%` }}
                        />
                        <div 
                          className="absolute bottom-0 left-0 h-1/2 bg-purple-500/10 transition-all duration-1000 ease-out z-0" 
                          style={{ width: `${commPercentage}%` }}
                        />
                        <div className="relative z-10 flex justify-between items-end">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Committee Room</span>
                            <span className="font-bold text-white text-base leading-none block line-clamp-1">{comm}</span>
                          </div>
                          <div className="text-right flex items-center justify-end gap-3">
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Reg</span>
                              <span className="text-lg font-black font-mono text-emerald-50 leading-none">
                                {data.reg_present}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold">Comm</span>
                              <span className="text-lg font-black font-mono text-purple-50 leading-none">
                                {data.comm_present}
                              </span>
                            </div>
                            <div className="pl-2 border-l border-white/10 flex flex-col items-end">
                               <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Tot</span>
                               <span className="text-lg font-black font-mono text-zinc-400 leading-none">{data.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                })
              ) : (
                <div className="col-span-full h-32 flex items-center justify-center text-zinc-500">
                  Loading telemetry...
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg shadow-black/50">
            <h3 className="text-lg font-bold mb-6 text-zinc-100 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Live Operations Feed (Last 15 Scans)
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </h3>

            <div className="space-y-3">
              {stats && stats.recentScans ? (
                stats.recentScans.length > 0 ? (
                  stats.recentScans.map((scan: any) => (
                    <div key={scan.id} className="flex justify-between items-center bg-black/40 border border-white/5 pr-4 rounded-lg overflow-hidden group hover:border-emerald-500/20 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-1.5 h-[60px] flex-shrink-0 mr-4 ${scan.checkpoint === 'registration' ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
                        <div className="py-2">
                          <p className="text-sm font-bold text-white mb-0.5">{scan.full_name}</p>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 line-clamp-1">
                            {scan.country} • {scan.committee}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded leading-none ${scan.checkpoint === 'registration' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                           {scan.checkpoint}
                        </span>
                        <p className="text-xs font-mono font-bold text-zinc-400">
                          {new Date(scan.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-zinc-500 py-4 font-medium uppercase tracking-widest">No activity yet on Day {activeDay}.</p>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-zinc-500 space-y-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Awaiting Link...</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}