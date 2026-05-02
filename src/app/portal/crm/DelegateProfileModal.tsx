import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Lock, CheckCircle2, History, Send, 
  Settings2, Activity, Edit2, Save, Mail, User, Flag, Building2, Fingerprint, CreditCard, AlertCircle
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
      setTransError('Invalid credentials.');
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
    if (!window.confirm(`Are you sure you want to save changes?`)) return;
    
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
      alert('Failed to update profile: ' + err.message);
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
      className="fixed inset-0 z-[200] flex justify-center items-center bg-black/80 backdrop-blur-md p-4 overflow-hidden"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="w-full max-w-6xl h-[90vh] max-h-[900px] bg-zinc-950 border border-amber-500/30 rounded-xl shadow-2xl flex flex-col relative overflow-hidden shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 z-10">
          <div className="flex items-center gap-3">
             <User className="w-5 h-5 text-amber-500" />
             <h2 className="text-base font-semibold text-zinc-100 uppercase tracking-wider">Delegate Profile</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
          
          {/* COLUMN 1: Profile Summary (Left) */}
          <div data-lenis-prevent className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/30 flex flex-col items-center py-8 px-6 overflow-y-auto">
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-amber-500/20 flex items-center justify-center mb-4 text-amber-500/80">
              <User className="w-10 h-10" />
            </div>

            {isEditing ? (
               <input 
                 value={editForm.full_name} 
                 onChange={e => setEditForm({...editForm, full_name: e.target.value})} 
                 className="w-full bg-zinc-800 border border-amber-500/30 text-amber-400 rounded-lg px-3 py-2 text-center font-semibold text-lg mb-6 outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
               />
            ) : (
               <h3 className="text-xl font-bold text-amber-500 text-center mb-6 break-words px-2">
                 {delegate.full_name}
               </h3>
            )}

            <div className="w-full space-y-3 mb-8">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 flex flex-col">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Committee</span>
                <span className="text-sm font-medium text-zinc-200 mt-1 break-words">{delegate.committee || 'Unallocated'}</span>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 flex flex-col">
                 <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Country / Delegation</span>
                 <span className="text-sm font-medium text-zinc-200 mt-1 break-words">{delegate.country || 'N/A'}</span>
              </div>
            </div>

            <div className="w-full mt-auto flex flex-col items-center">
              <div className="p-3 bg-zinc-100 rounded-xl shadow-sm mb-3 ring-2 ring-amber-500/20">
                <QRCodeSVG 
                  value={delegate.qr_token} 
                  size={140}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className="flex flex-col items-center gap-1 w-full text-center mt-2">
                 <span className="text-xs font-medium text-amber-600/80 flex items-center gap-1 uppercase tracking-wider">
                   <Fingerprint className="w-3.5 h-3.5" /> Delegate Token
                 </span>
                 <div className="px-3 py-1.5 w-full rounded bg-zinc-900 border border-zinc-800 text-amber-400 text-sm font-mono truncate">
                   {delegate.qr_token}
                 </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Details & Actions (Center / Right) */}
          <div data-lenis-prevent className="flex-1 flex flex-col overflow-y-auto bg-zinc-950">
            <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
               <h4 className="text-base font-semibold text-amber-500 flex items-center gap-2">
                 <Settings2 className="w-5 h-5 text-amber-600/70" /> General Information
               </h4>
               
               {isEditing ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-700 transition border border-zinc-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={savingEdit} 
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50 border border-amber-600/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      <Save className="w-4 h-4" /> {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
               ) : (
                  <button 
                    onClick={startEditing} 
                    className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-amber-500 font-medium text-sm flex items-center gap-2 hover:bg-zinc-800 hover:border-amber-500/30 transition"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
               )}
            </div>

            <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
              
              {/* Left Column: Info, Transactions, Status */}
              <div className="flex flex-col gap-8">
                {/* Info Form */}
                <div className="space-y-4">
                   <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800/50 bg-zinc-900/30">
                      <DataRow icon={<Mail />} label="Email Address" value={delegate.email} isEditing={isEditing} 
                               editNode={<input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-zinc-800/80 border border-amber-500/30 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-500 text-zinc-200" />} />
                      
                      <DataRow icon={<Building2 />} label="Institution" value={delegate.institution || 'Not Provided'} isEditing={isEditing} 
                               editNode={<input value={editForm.institution} onChange={e => setEditForm({...editForm, institution: e.target.value})} className="w-full bg-zinc-800/80 border border-amber-500/30 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-500 text-zinc-200" />} />
                      
                      <DataRow icon={<Flag />} label="Country" value={delegate.country || 'Unallocated'} isEditing={isEditing} 
                               editNode={<input value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} className="w-full bg-zinc-800/80 border border-amber-500/30 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-500 text-zinc-200" />} />
                      
                      <DataRow icon={<Activity />} label="Committee" value={delegate.committee || 'Unallocated'} isEditing={isEditing} 
                               editNode={<input value={editForm.committee} onChange={e => setEditForm({...editForm, committee: e.target.value})} className="w-full bg-zinc-800/80 border border-amber-500/30 rounded-md px-3 py-2 text-sm outline-none focus:border-amber-500 text-zinc-200" />} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8">
                  {/* Transactions Area */}
                  <div className="border border-zinc-800 bg-zinc-900/40 p-6 rounded-xl flex flex-col justify-between">
                     <div>
                       <h5 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                         <CreditCard className="w-4 h-4 text-amber-600/70" /> Transaction Data
                       </h5>

                       <div className="relative">
                         {isEditing ? (
                           <div>
                             <label className="text-xs font-semibold text-zinc-400 block mb-1">Transaction ID</label>
                             <input value={editForm.transaction_id} onChange={e => setEditForm({...editForm, transaction_id: e.target.value})} className="w-full bg-zinc-800/80 border border-amber-500/30 rounded-md px-3 py-2 text-sm font-mono text-zinc-200 outline-none" />
                           </div>
                         ) : !showTransaction ? (
                            <form onSubmit={handleRevealTransaction} className="flex flex-col gap-3">
                              <label className="text-xs text-zinc-500">Please enter your authorization key to view transaction details.</label>
                              <div className="relative border border-zinc-700/50 rounded-md overflow-hidden bg-zinc-800 flex focus-within:ring-1 focus-within:ring-amber-500 shadow-inner">
                                <div className="pl-3 py-2 flex items-center justify-center text-zinc-500">
                                   <Lock className="w-4 h-4" />
                                </div>
                                <input
                                  type="password"
                                  placeholder="Authorization Key"
                                  value={transPassword}
                                  onChange={(e) => setTransPassword(e.target.value)}
                                  className="w-full bg-transparent px-3 py-2 text-sm outline-none text-zinc-200"
                                />
                              </div>
                              {transError && <p className="text-xs text-red-400 font-medium">{transError}</p>}
                              <button type="submit" className="w-full py-2 bg-zinc-800 text-amber-500 hover:bg-zinc-700 hover:text-amber-400 border border-zinc-700 hover:border-amber-500/30 text-sm font-semibold rounded-md transition-colors">
                                Reveal Data
                              </button>
                            </form>
                         ) : (
                           <div className="bg-zinc-800/80 px-4 py-3 rounded-md border border-amber-500/20">
                             <span className="text-sm text-zinc-300 font-mono break-all">{delegate.transaction_id || 'No transaction ID recorded'}</span>
                           </div>
                         )}
                       </div>
                     </div>
                  </div>

                  {/* Status / Mail */}
                  <div className="border border-zinc-800 bg-zinc-900/40 p-6 rounded-xl flex flex-col justify-between">
                     <div>
                         <h5 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                           <Send className="w-4 h-4 text-amber-600/70" /> Mailing Status
                         </h5>

                         {isEditing ? (
                            <div>
                              <label className="text-xs font-semibold text-zinc-400 block mb-1">Status</label>
                              <select 
                                value={editForm.mail_status} 
                                onChange={e => setEditForm({...editForm, mail_status: e.target.value})} 
                                className="w-full bg-zinc-800/80 border border-amber-500/30 text-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="SENT">SENT</option>
                                <option value="FAILED">FAILED</option>
                              </select>
                            </div>
                         ) : (
                            <div className="space-y-1 bg-zinc-800/80 p-4 rounded-md border border-zinc-700/50">
                               <span className={`text-sm font-semibold flex items-center gap-1.5 ${
                                 delegate.mail_status === 'SENT' ? 'text-green-400' : 
                                 delegate.mail_status === 'PROCESSING' ? 'text-yellow-400' : 
                                 delegate.mail_status === 'FAILED' ? 'text-red-400' : 'text-zinc-400'
                               }`}>
                                 <Activity className="w-4 h-4" /> {delegate.mail_status || 'PENDING'}
                               </span>
                               {delegate.allocation_mail_sent_at && (
                                  <p className="text-xs text-zinc-500 mt-1 font-medium">
                                    Last updated: {format(new Date(delegate.allocation_mail_sent_at), 'MMM d, yyyy - h:mm a')}
                                  </p>
                               )}
                            </div>
                         )}
                     </div>

                     {!isEditing && (
                       <div className="mt-6 relative">
                         {showEmailConfirm ? (
                            <div className="absolute inset-0 bg-zinc-900 border border-zinc-700/50 rounded-md flex flex-col justify-center p-4 z-10 shadow-lg backdrop-blur-sm">
                              <span className="text-sm font-semibold text-zinc-200 mb-3 text-center">Confirm sending email?</span>
                              <div className="flex gap-2 w-full">
                                 <button onClick={handleSendEmail} className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded text-sm font-bold transition">Yes, Send</button>
                                 <button onClick={() => setShowEmailConfirm(false)} className="flex-1 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded text-sm font-medium transition border border-zinc-600">Cancel</button>
                              </div>
                            </div>
                         ) : null}
                         
                         <button 
                            onClick={() => setShowEmailConfirm(true)}
                            disabled={sendingEmail}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-amber-500/30 text-amber-500 rounded-md font-medium text-sm transition disabled:opacity-50 mt-4"
                          >
                            <Send className="w-4 h-4" />
                            {sendingEmail ? 'Sending...' : delegate.mail_status === 'SENT' ? 'Resend Mail' : 'Dispatch Mail'}
                          </button>
                       </div>
                     )}
                  </div>
                </div>
              </div>

              {/* Logs Section (Right Column) */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden flex flex-col bg-zinc-900/40">
                 <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-600/70" /> Attendance Logs
                    </h5>
                    <span className="text-xs font-semibold bg-zinc-800 border border-zinc-700 text-amber-500 px-2 py-1 rounded">
                       {checkins.length} Entries
                    </span>
                 </div>
                 <div className="p-6 flex flex-col gap-4">
                    {loadingLogs ? (
                      <div className="py-8 text-center text-sm text-zinc-500 font-medium">Loading logs...</div>
                    ) : checkins.length === 0 ? (
                      <div className="py-8 text-center text-sm text-zinc-500 font-medium">No attendance logs found.</div>
                    ) : (
                      <div className="space-y-3">
                         {isEditing ? editLogsForm.map((log, idx) => (
                            <div key={log.id} className={`flex items-start gap-4 p-4 border border-zinc-800 rounded-lg ${log._deleted ? 'opacity-50 bg-red-950/20' : 'bg-zinc-800/50'}`}>
                               <div className="flex-1 grid grid-cols-2 gap-3">
                                  <div>
                                     <label className="text-xs font-semibold text-zinc-400 mb-1 block">Checkpoint</label>
                                     <select value={log.checkpoint} disabled={log._deleted} onChange={e => updateLogField(log.id, 'checkpoint', e.target.value)} className="w-full bg-zinc-900 border border-amber-500/30 text-zinc-200 text-sm rounded px-2 py-1.5 outline-none">
                                        <option value="registration">REGISTRATION</option>
                                        <option value="committee">COMMITTEE</option>
                                     </select>
                                  </div>
                                  <div>
                                     <label className="text-xs font-semibold text-zinc-400 mb-1 block">Day</label>
                                     <select value={log.day || ''} disabled={log._deleted} onChange={e => updateLogField(log.id, 'day', parseInt(e.target.value))} className="w-full bg-zinc-900 border border-amber-500/30 text-zinc-200 text-sm rounded px-2 py-1.5 outline-none">
                                        <option value="1">DAY 1</option>
                                        <option value="2">DAY 2</option>
                                        <option value="3">DAY 3</option>
                                     </select>
                                  </div>
                               </div>
                               <button onClick={() => markLogDeleted(log.id)} className={`mt-5 px-3 py-1.5 rounded text-xs font-semibold transition border ${log._deleted ? 'bg-zinc-800 border-zinc-600 text-zinc-300' : 'bg-red-950/50 border-red-500/50 text-red-400 hover:bg-red-900/50'}`}>
                                  {log._deleted ? 'Restore' : 'Delete'}
                               </button>
                            </div>
                         )) : checkins.map((log, idx) => (
                            <div key={log.id} className="flex items-center justify-between p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-lg">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                                   <CheckCircle2 className="w-4 h-4" />
                                 </div>
                                 <div className="min-w-0">
                                   <p className="text-sm font-semibold text-zinc-200 uppercase truncate">{log.checkpoint}</p>
                                   <p className="text-xs text-zinc-500 mt-0.5 truncate">{format(new Date(log.scanned_at), 'MMMM d, yyyy - h:mm a')}</p>
                                 </div>
                               </div>
                               <span className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/50 text-xs font-semibold text-amber-500 flex-shrink-0 ml-2">
                                 Day {log.day}
                               </span>
                            </div>
                         ))}
                      </div>
                    )}
                 </div>
              </div>
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
    <div className="flex flex-col sm:flex-row sm:items-start py-4 px-6 bg-transparent">
       <div className="flex items-center gap-2 w-48 shrink-0 mb-2 sm:mb-0 pt-0.5">
          <div className="text-amber-600/70">
             {(() => {
                const IconComponent = icon.type;
                if (!IconComponent) return null;
                return <IconComponent className="w-4 h-4" />;
             })()}
          </div>
          <span className="text-sm font-medium text-zinc-400">{label}</span>
       </div>
       <div className="flex-1 min-w-0">
          {isEditing ? editNode : (
             <span className="text-sm font-semibold text-zinc-200 block whitespace-normal break-words leading-relaxed">{value}</span>
          )}
       </div>
    </div>
  );
}
