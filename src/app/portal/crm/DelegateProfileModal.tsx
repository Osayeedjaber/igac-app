import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Lock, CheckCircle2, History, Send, 
  Settings2, Activity, Edit2, Save, Trash2, 
  Mail, User, Flag, Building2, Calendar, 
  Fingerprint, AlertCircle, ShieldCheck, CreditCard, ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { fetchDelegateCheckinsAction, editDelegateAction, editDelegateCheckinAction, deleteDelegateCheckinAction } from './actions';

export default function DelegateProfileModal({ delegate: initialDelegate, onClose }: { delegate: any; onClose: () => void }) {
  const [delegate, setDelegate] = useState(initialDelegate);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '', email: '', country: '', committee: '', institution: '', transaction_id: '', mail_status: ''
  });
  const [editLogsForm, setEditLogsForm] = useState<any[]>([]);

  // Institution & Transaction Data
  const [showTransaction, setShowTransaction] = useState(false);
  const [transPassword, setTransPassword] = useState('');
  const [transError, setTransError] = useState('');

  // Email status
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditing) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, isEditing]);

  useEffect(() => {
    async function loadCheckins() {
      try {
        const data = await fetchDelegateCheckinsAction(delegate.id);
        setCheckins(data || []);
      } catch (err) {
        console.error('Failed to load checkins', err);
      }
      setLoadingLogs(false);
    }
    if (delegate) loadCheckins();
  }, [delegate]);

  const handleRevealTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (transPassword === 'osayeed5889@' || transPassword === 'igacadmin2026') {
      setShowTransaction(true);
      setTransError('');
    } else {
      setTransError('ACCESS DENIED. INVALID CREDENTIALS.');
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delegateId: delegate.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');
      alert('Email dispatched successfully!');
      setDelegate({ ...delegate, mail_status: 'SENT', allocation_mail_sent_at: new Date().toISOString() });
    } catch (err: any) {
      alert(err.message);
    }
    setSendingEmail(false);
    setShowEmailConfirm(false);
  };

  const startEditing = () => {
    setEditForm({
      full_name: delegate.full_name, email: delegate.email,
      country: delegate.country || '', committee: delegate.committee || '',
      institution: delegate.institution || '', transaction_id: delegate.transaction_id || '',
      mail_status: delegate.mail_status || 'PENDING'
    });
    setEditLogsForm(checkins.map(c => ({ id: c.id, checkpoint: c.checkpoint, day: c.day })));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!window.confirm(`Are you sure you want to commit changes to the main database?`)) return;
    
    setSavingEdit(true);
    try {
      const updated = await editDelegateAction(delegate.id, editForm);
      setDelegate(updated);

      for (const lg of editLogsForm) {
        if (lg._deleted) {
          await deleteDelegateCheckinAction(lg.id);
        } else {
          const origLog = checkins.find(c => c.id === lg.id);
          if (origLog && (origLog.checkpoint !== lg.checkpoint || origLog.day !== lg.day)) {
            await editDelegateCheckinAction(lg.id, { checkpoint: lg.checkpoint, day: lg.day });
          }
        }
      }
      
      const newCheckins = await fetchDelegateCheckinsAction(delegate.id);
      setCheckins(newCheckins || []);
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to update profile or logs: ' + err.message);
    }
    setSavingEdit(false);
  };

  const updateLogField = (logId: string, field: string, value: any) => {
    setEditLogsForm(prev => prev.map(lg => lg.id === logId ? { ...lg, [field]: value } : lg));
  };

  const markLogDeleted = (logId: string) => {
    setEditLogsForm(prev => prev.map(lg => lg.id === logId ? { ...lg, _deleted: !lg._deleted } : lg));
  };

  if (!mounted || !delegate) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[200] grid place-items-center bg-black/90 backdrop-blur-xl p-0 sm:p-4 overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="w-full h-full sm:w-auto sm:max-w-6xl sm:h-[85vh] sm:aspect-[16/9] bg-zinc-950/90 backdrop-blur-3xl border border-white/5 shadow-[0_0_120px_rgba(245,158,11,0.15)] sm:rounded-[2.5rem] flex flex-col animate-in zoom-in-95 duration-500 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

        {/* Global Modal Header */}
        <div className="flex-shrink-0 h-16 border-b border-white/5 flex items-center justify-between px-6 sm:px-10 bg-black/40 z-10">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-amber-500" />
             <span className="text-xs sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Delegate Profile</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-rose-500/20 transition-all border border-white/5 group z-50">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* 3-Column Dossier Grid */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 w-full">
          
          {/* COLUMN 1: Secure Identity (Left) */}
          <div className="w-full lg:w-[320px] border-r border-white/5 bg-black/40 flex flex-col items-center py-10 px-8 relative overflow-y-auto custom-scrollbar">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-6 relative">
              <div className="absolute -inset-2 rounded-[2rem] border border-amber-500/20 animate-[spin_10s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
              <User className="w-10 h-10 text-amber-500" />
            </div>

            {isEditing ? (
               <input 
                 value={editForm.full_name} 
                 onChange={e => setEditForm({...editForm, full_name: e.target.value})} 
                 className="w-full bg-black border border-amber-500/50 text-white rounded-lg px-3 py-2 text-center font-bold text-xl mb-4 outline-none focus:ring-2 focus:ring-amber-500/20"
               />
            ) : (
                <h2 className="text-2xl font-black text-white text-center leading-tight mb-4 tracking-tight drop-shadow-md">
                {delegate.full_name}
                </h2>
            )}

            <div className="flex flex-col gap-2 w-full mb-10">
              <div className="w-full bg-black/50 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center shadow-inner gap-1">
                <span className="text-[9px] uppercase font-black text-zinc-600 tracking-[0.2em]">Assignment</span>
                <span className="text-xs font-black text-amber-500 uppercase tracking-widest">{delegate.committee || 'Unallocated'}</span>
              </div>
              <div className="w-full bg-black/50 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center shadow-inner gap-1">
                 <span className="text-[9px] uppercase font-black text-zinc-600 tracking-[0.2em]">Delegation</span>
                 <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest truncate max-w-[200px]">{delegate.country || 'N/A'}</span>
              </div>
            </div>

            <div className="w-full mt-auto flex flex-col items-center group">
              <div className="p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border-4 border-zinc-200 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                <QRCodeSVG 
                  value={delegate.qr_token} 
                  size={160}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className="mt-6 flex flex-col items-center gap-2 w-full">
                <div className="flex items-center gap-2">
                   <Fingerprint className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Secured Token</span>
                </div>
                <div className="px-3 py-2 w-full rounded-xl bg-black border border-white/10 text-zinc-400 text-[10px] font-mono font-bold text-center group-hover:border-amber-500/50 transition-colors">
                  {delegate.qr_token}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Vault (Center) */}
          <div className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-y-auto custom-scrollbar">
            <div className="sticky top-0 z-20 flex items-center justify-between px-10 py-6 bg-zinc-950/80 backdrop-blur-lg border-b border-white/5 gap-4">
               <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 whitespace-nowrap shrink-0">
                 <Settings2 className="w-5 h-5 text-amber-500 shrink-0" /> Information Panel
               </h3>
               
               {isEditing ? (
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={savingEdit} 
                      className="h-10 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {savingEdit ? 'Committing...' : 'Commit Changes'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="h-10 px-4 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
               ) : (
                  <button 
                    onClick={startEditing} 
                    className="h-10 px-5 rounded-xl bg-white/5 text-amber-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all shadow-inner"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modify Protocol
                  </button>
               )}
            </div>

            <div className="p-10 space-y-8 flex-1">
              
              {/* General Info Grid */}
              <div className="space-y-4">
                 <div className="border border-white/5 bg-black/40 rounded-2xl overflow-hidden shadow-inner">
                    <DataRow icon={<Mail />} label="Email Address" value={delegate.email} isEditing={isEditing} 
                             editNode={<input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-3 py-1.5 text-sm outline-none text-white focus:border-amber-500" />} />
                    
                    <DataRow icon={<Building2 />} label="Institution" value={delegate.institution || 'NOT PROVIDED'} isEditing={isEditing} 
                             editNode={<input value={editForm.institution} onChange={e => setEditForm({...editForm, institution: e.target.value})} className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-3 py-1.5 text-sm outline-none text-white focus:border-amber-500" />} />
                    
                    <DataRow icon={<Flag />} label="Assigned Country" value={delegate.country || 'UNALLOCATED'} isEditing={isEditing} 
                             editNode={<input value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-3 py-1.5 text-sm outline-none text-white focus:border-amber-500" />} />
                    
                    <DataRow icon={<Activity />} label="Committee" value={delegate.committee || 'UNALLOCATED'} isEditing={isEditing} 
                             editNode={<input value={editForm.committee} onChange={e => setEditForm({...editForm, committee: e.target.value})} className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-3 py-1.5 text-sm outline-none text-white focus:border-amber-500" />} />
                 </div>
              </div>

              {/* Status & Financial Settings */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Financial Vault */}
                <div className="bg-zinc-950/80 border border-white/5 p-6 rounded-3xl outline outline-1 outline-offset-4 outline-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <CreditCard className="w-24 h-24" />
                   </div>
                   <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                     <Lock className="w-3.5 h-3.5 text-emerald-500" /> Transaction Data
                   </h4>

                   <div className="relative z-10">
                     {isEditing ? (
                       <input value={editForm.transaction_id} onChange={e => setEditForm({...editForm, transaction_id: e.target.value})} className="w-full bg-black border border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400 outline-none" />
                     ) : !showTransaction ? (
                        <form onSubmit={handleRevealTransaction} className="space-y-3 mt-2">
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-colors" />
                            <input
                              type="password"
                              placeholder="AUTHORIZATION KEY"
                              value={transPassword}
                              onChange={(e) => setTransPassword(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black text-white outline-none focus:border-emerald-500/50 transition uppercase tracking-[0.2em]"
                            />
                          </div>
                          {transError && <p className="text-[9px] text-rose-500 font-black ml-1 uppercase tracking-tighter shadow-sm">{transError}</p>}
                          <button type="submit" className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-xl border border-emerald-500/20 transition-all uppercase tracking-[0.2em] shadow-[inset_0_0_10px_rgba(16,185,129,0.1)] active:scale-95">
                            DECRYPT PAYLOAD
                          </button>
                        </form>
                     ) : (
                       <div className="bg-black/80 px-4 py-3 rounded-xl border border-emerald-500/30 flex items-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                         <span className="font-mono text-xs text-emerald-400 tracking-widest break-all font-bold">{delegate.transaction_id || 'NO RECORD FOUND'}</span>
                       </div>
                     )}
                   </div>
                </div>

                {/* Dispatch Status */}
                <div className="bg-zinc-950/80 border border-white/5 p-6 rounded-3xl outline outline-1 outline-offset-4 outline-white/5 flex flex-col justify-between">
                   <div>
                       <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4 flex items-center gap-2">
                         <Send className="w-3.5 h-3.5 text-blue-500" /> Dispatch Status
                       </h4>

                       {isEditing ? (
                          <select 
                            value={editForm.mail_status} 
                            onChange={e => setEditForm({...editForm, mail_status: e.target.value})} 
                            className="w-full bg-black border border-blue-500/30 text-white rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500 font-bold uppercase tracking-wider"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SENT">SENT</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                       ) : (
                          <div className="space-y-1 bg-black/40 p-4 rounded-2xl border border-white/5">
                             <span className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${
                               delegate.mail_status === 'SENT' ? 'text-emerald-500' : 
                               delegate.mail_status === 'PROCESSING' ? 'text-amber-500 animate-pulse' : 
                               delegate.mail_status === 'FAILED' ? 'text-rose-500' : 'text-zinc-400'
                             }`}>
                               <Activity className="w-4 h-4" /> {delegate.mail_status || 'AWAITING DISPATCH'}
                             </span>
                             {delegate.allocation_mail_sent_at && (
                                <p className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase mt-2">
                                  LAST {format(new Date(delegate.allocation_mail_sent_at), 'MMM d yyyy, h:mm a')}
                                </p>
                             )}
                          </div>
                       )}
                   </div>

                   {!isEditing && (
                     <div className="mt-6 relative">
                       {showEmailConfirm ? (
                          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-xl border border-rose-500/30 flex flex-col justify-center items-center p-3 animate-in fade-in duration-200 shadow-[0_0_20px_rgba(244,63,94,0.1)] left-0 right-0 z-10 bottom-0 top-0">
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> CONFIRM TRANSMISSION</span>
                            <div className="flex gap-2 w-full">
                               <button onClick={handleSendEmail} className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-rose-500/20 w-fit">TRANSMIT</button>
                               <button onClick={() => setShowEmailConfirm(false)} className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-inner w-fit border border-white/5">ABORT</button>
                            </div>
                          </div>
                       ) : null}
                       
                       <button 
                          onClick={() => setShowEmailConfirm(true)}
                          disabled={sendingEmail}
                          className="w-full group relative flex items-center justify-center gap-2 h-12 bg-zinc-900 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:text-blue-400 active:scale-95 disabled:opacity-50"
                        >
                          <Send className={`w-4 h-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 ${sendingEmail ? 'animate-pulse' : ''}`} />
                          {sendingEmail ? 'SENDING EMAIL...' : delegate.mail_status === 'SENT' ? 'RE-SEND EMAIL' : 'DISPATCH EMAIL'}
                        </button>
                     </div>
                   )}
                </div>

              </div>

            </div>
          </div>

          {/* COLUMN 3: Telemetry (Right) */}
          <div className="w-full lg:w-[300px] border-l border-white/5 bg-zinc-950/80 flex flex-col relative z-20">
             
             <div className="flex-shrink-0 sticky top-0 px-8 py-6 border-b border-white/5 bg-black/60 backdrop-blur-xl z-10">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                  <History className="w-4 h-4 text-emerald-500" /> Access Logs
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">{checkins.length} ENTRIES LOGGED</span>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative">
                {loadingLogs ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                     <Activity className="w-6 h-6 text-amber-500 animate-spin" />
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SYNCING RADAR</span>
                  </div>
                ) : checkins.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8 opacity-50">
                     <History className="w-10 h-10 text-zinc-600 mb-2" />
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed">No telemetry signatures detected on radar.</span>
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                     
                     {isEditing ? editLogsForm.map((log, idx) => (
                        <div key={log.id} className={`relative flex items-center gap-3 group transition-all ${log._deleted ? 'opacity-30 grayscale' : ''}`}>
                           
                           <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black/60 text-amber-500 shadow-inner shrink-0 relative z-10 box-border">
                              <span className="text-[10px] font-black">{idx + 1}</span>
                           </div>
                           
                           <div className="flex-1 bg-black/60 p-3 rounded-2xl border border-white/10 shadow-lg relative group-hover:border-amber-500/30 transition-colors">
                              <div className="flex flex-col gap-2">
                                 <select value={log.checkpoint} disabled={log._deleted} onChange={e => updateLogField(log.id, 'checkpoint', e.target.value)} className="w-full bg-zinc-950 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1.5 outline-none">
                                    <option value="registration">REGISTRATION</option>
                                    <option value="committee">COMMITTEE</option>
                                 </select>
                                 <select value={log.day || ''} disabled={log._deleted}  onChange={e => updateLogField(log.id, 'day', parseInt(e.target.value))} className="w-full bg-zinc-950 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-1.5 outline-none">
                                    <option value="1">DAY 1</option>
                                    <option value="2">DAY 2</option>
                                    <option value="3">DAY 3</option>
                                 </select>
                                 <button onClick={() => markLogDeleted(log.id)} className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${log._deleted ? 'bg-zinc-800 text-zinc-500' : 'bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20'}`}>
                                    {log._deleted ? 'RESTORE LOG' : 'PURGE LOG'}
                                 </button>
                              </div>
                           </div>

                        </div>
                     )) : checkins.map((log, idx) => (
                        <div key={log.id} className={`relative flex items-center gap-3 group`}>
                           
                           <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500/30 bg-black/80 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0 relative z-10 box-border group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                              <CheckCircle2 className="w-4 h-4" />
                           </div>
                           
                           <div className="flex-1 bg-black/40 backdrop-blur-sm p-3.5 rounded-2xl border border-white/5 shadow-inner hover:border-emerald-500/30 transition-colors group-hover:-translate-y-0.5 duration-300">
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-0.5 rounded text-[8px] font-black text-amber-500 bg-amber-500/10 uppercase tracking-widest border border-amber-500/20">DAY {log.day}</span>
                              </div>
                              <h4 className="text-[11px] font-black text-white uppercase tracking-wider mb-2 leading-tight">{log.checkpoint}</h4>
                              <time className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-tighter">
                                {format(new Date(log.scanned_at), 'h:mm:ss a - MMM d')}
                              </time>
                           </div>

                        </div>
                     ))}
                     
                  </div>
                )}
             </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

function DataRow({ icon, label, value, isEditing, editNode }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-4 px-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors gap-3">
       <div className="flex items-center gap-3 w-48 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
             {(() => {
                const IconComponent = icon.type;
                return <IconComponent className="w-3.5 h-3.5" />;
             })()}
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{label}</span>
       </div>
       <div className="flex-1 min-w-0 flex items-center justify-end sm:justify-start">
          {isEditing ? editNode : (
             <span className="text-xs font-bold text-white break-all">{value}</span>
          )}
       </div>
    </div>
  );
}
