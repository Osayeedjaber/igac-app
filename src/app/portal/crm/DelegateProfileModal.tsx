import { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, History, Send, ShieldAlert, KeyRound, Edit2, Save, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { fetchDelegateCheckinsAction, editDelegateAction, editDelegateCheckinAction, deleteDelegateCheckinAction } from './actions';

export function DelegateProfileModal({ delegate: initialDelegate, onClose }: { delegate: any; onClose: () => void }) {
  const [delegate, setDelegate] = useState(initialDelegate);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '', email: '', country: '', committee: '', transaction_id: '', mail_status: ''
  });
  const [editLogsForm, setEditLogsForm] = useState<any[]>([]);

  // Transaction ID
  const [transPassword, setTransPassword] = useState('');
  const [showTransaction, setShowTransaction] = useState(false);
  const [transError, setTransError] = useState('');

  // Email status
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

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
    if (transPassword === 'osayeed5889@') {
      setShowTransaction(true);
      setTransError('');
    } else {
      setTransError('Incorrect financial password.');
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
      // Need to inform the parent to refresh the grid or just handle state visually here.
      setDelegate({
        ...delegate,
        mail_status: 'SENT',
        allocation_mail_sent_at: new Date().toISOString()
      });
    } catch (err: any) {
      alert(err.message);
    }
    setSendingEmail(false);
    setShowEmailConfirm(false);
  };

  const startEditing = () => {
    setEditForm({
      full_name: delegate.full_name,
      email: delegate.email,
      country: delegate.country || '',
      committee: delegate.committee || '',
      transaction_id: delegate.transaction_id || '',
      mail_status: delegate.mail_status || 'PENDING'
    });
    setEditLogsForm(checkins.map(c => ({ id: c.id, checkpoint: c.checkpoint, day: c.day })));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!window.confirm(`Are you sure you want to save changes to ${delegate.full_name} and their logs?`)) return;
    
    setSavingEdit(true);
    try {
      const updated = await editDelegateAction(delegate.id, editForm);
      setDelegate(updated);

      // Save logs
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

  if (!delegate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm p-4">
      {/* Slide-out Panel */}
      <div className="w-full max-w-2xl h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl rounded-l-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex-1 mr-4">
            {!isEditing ? (
              <>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {delegate.full_name}
                  <button onClick={startEditing} className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-zinc-500">{delegate.qr_token}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {delegate.committee || 'Unallocated'}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={editForm.full_name} 
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})} 
                  className="bg-black border border-zinc-700 text-white rounded px-2 py-1 text-xl font-bold outline-none focus:border-sky-500 w-full"
                />
                <button onClick={handleSaveEdit} disabled={savingEdit} className="p-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition disabled:opacity-50 min-w-max">
                  <Save className="w-4 h-4" /> {savingEdit ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          {!isEditing && (
            <button onClick={onClose} className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-rose-500/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity & Contact */}
            <div className="col-span-2 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Contact Info</h3>
                <div className="space-y-3">
                  {!isEditing ? (
                    <>
                      <p className="text-sm"><span className="text-zinc-500 w-24 inline-block">Email:</span> <span className="text-zinc-200 font-medium">{delegate.email}</span></p>
                      <p className="text-sm"><span className="text-zinc-500 w-24 inline-block">Country:</span> <span className="text-zinc-200 font-medium">{delegate.country || 'N/A'}</span></p>
                      <p className="text-sm"><span className="text-zinc-500 w-24 inline-block">Committee:</span> <span className="text-zinc-200 font-medium">{delegate.committee || 'Unallocated'}</span></p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-sm">
                        <span className="text-zinc-500 w-24 inline-block">Email:</span>
                        <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="flex-1 bg-black border border-zinc-700 text-white rounded px-2 py-1 outline-none focus:border-sky-500" />
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-zinc-500 w-24 inline-block">Country:</span>
                        <input type="text" value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} className="flex-1 bg-black border border-zinc-700 text-white rounded px-2 py-1 outline-none focus:border-sky-500" />
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-zinc-500 w-24 inline-block">Committee:</span>
                        <input type="text" value={editForm.committee} onChange={e => setEditForm({...editForm, committee: e.target.value})} className="flex-1 bg-black border border-zinc-700 text-white rounded px-2 py-1 outline-none focus:border-sky-500" />
                      </div>
                    </>
                  )}
                  <p className="text-sm"><span className="text-zinc-500 w-24 inline-block">Status:</span>
                    {!isEditing ? (
                      <span className="text-zinc-200 font-medium">
                        {delegate.mail_status === 'SENT' ? (
                          <span className="text-emerald-400 flex items-center gap-1 inline-flex">
                            <CheckCircle2 className="w-3 h-3" /> Sent ({format(new Date(delegate.allocation_mail_sent_at || Date.now()), 'MMM d, h:mm a')})
                          </span>
                        ) : delegate.mail_status === 'PROCESSING' ? (
                          <span className="text-sky-400 animate-pulse">Processing...</span>
                        ) : delegate.mail_status === 'FAILED' ? (
                          <span className="text-rose-400">Failed</span>
                        ) : (
                          <span className="text-yellow-500">Pending</span>
                        )}
                      </span>
                    ) : (
                      <select 
                        value={editForm.mail_status} 
                        onChange={e => setEditForm({...editForm, mail_status: e.target.value})} 
                        className="bg-black border border-zinc-700 text-white rounded px-2 py-1 outline-none focus:border-sky-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SENT">Sent</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    )}
                  </p>
                </div>
              </div>

              {/* Transaction Block */}
              <div className="bg-zinc-900/50 border border-red-900/30 p-5 rounded-xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 p-3 opacity-[0.03] group-hover:opacity-[0.05] transition pointer-events-none">
                  <ShieldAlert className="w-48 h-48 text-rose-500" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Financial Data
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{delegate.committee || 'Unallocated'}</span>
                </div>

                {!showTransaction ? (
                  <form onSubmit={handleRevealTransaction} className="flex gap-2 isolate z-10 relative mt-4">
                    <input
                      type="password"
                      placeholder="Admin Key..."
                      className="w-full bg-black/50 border border-red-900/50 rounded px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition placeholder:text-zinc-600 font-mono"
                      value={transPassword}
                      onChange={e => setTransPassword(e.target.value)}
                    />
                    <button type="submit" className="bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-400 text-sm font-bold px-4 py-2 rounded transition whitespace-nowrap uppercase tracking-wider">
                      Reveal
                    </button>
                    {transError && <span className="text-[10px] text-rose-500 absolute -bottom-5 left-0 uppercase font-bold">{transError}</span>}
                  </form>
                ) : (
                  <div className="relative z-10">
                    {!isEditing ? (
                      <div className="bg-black/50 border border-emerald-900/50 p-3 rounded font-mono text-emerald-400 break-all flex items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <KeyRound className="w-4 h-4 mr-3 shrink-0 opacity-50" />
                        <span className="tracking-wider">{delegate.transaction_id || 'NO_TRANSACTION_ID_FOUND'}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-rose-400">Edit Transaction ID</label>
                        <input
                          type="text"
                          value={editForm.transaction_id}
                          onChange={e => setEditForm({...editForm, transaction_id: e.target.value})}
                          className="w-full bg-black border border-rose-900/50 rounded px-3 py-2 text-emerald-400 text-sm outline-none focus:border-rose-500 transition font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Col */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-lg border-4 border-zinc-200">
              <QRCodeSVG 
                value={delegate.qr_token} 
                size={140}
                level="H"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#ffffff"
              />
              <p className="text-[10px] text-zinc-500 font-mono mt-3 break-all text-center leading-tight">
                {delegate.qr_token}
              </p>
            </div>
          </div>

          {/* Check-ins */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-800/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Access Logs</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">{delegate.committee || 'Unallocated'}</span>
            </div>
            
            {loadingLogs ? (
              <div className="p-6 text-center text-sm text-zinc-500">Loading logs...</div>
            ) : checkins.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500 italic">No check-ins recorded yet.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {isEditing ? editLogsForm.map(log => (
                  <div key={log.id} className={`flex justify-between items-center p-4 ${log._deleted ? 'opacity-50 line-through' : ''}`}>
                    <div className="space-y-2 flex-1 mr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs w-20">Checkpoint:</span>
                        <select value={log.checkpoint} disabled={log._deleted} onChange={e => updateLogField(log.id, 'checkpoint', e.target.value)} className="flex-1 bg-black border border-zinc-700 text-white rounded px-2 py-1 text-sm outline-none focus:border-sky-500 appearance-none">
                          <option value="registration">registration</option>
                          <option value="committee">committee</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-xs w-20">Day:</span>
                        <select value={log.day || ''} disabled={log._deleted} onChange={e => updateLogField(log.id, 'day', parseInt(e.target.value))} className="w-16 bg-black border border-zinc-700 text-white rounded px-2 py-1 text-sm outline-none focus:border-sky-500 appearance-none">
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => markLogDeleted(log.id)} className={`p-2 rounded hover:text-white transition ${log._deleted ? 'text-zinc-500 bg-zinc-800' : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'}`}>
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : checkins.map(log => (
                  <div key={log.id} className="flex justify-between items-center p-4 hover:bg-zinc-800/20">
                    <div>
                      <p className="text-sm text-zinc-200 font-medium">Checkpoint: {log.checkpoint}</p>
                      <p className="text-xs text-zinc-500">Scanned by: {log.scanned_by?.full_name || 'System'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-sky-400 font-medium">Day {log.day}</p>
                      <p className="text-xs text-zinc-500">
                        {format(new Date(log.scanned_at), 'h:mm a, MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
          <div>
            {showEmailConfirm ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-rose-400 font-medium">Are you sure?</span>
                <button onClick={handleSendEmail} disabled={sendingEmail} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-sm font-medium transition">
                  {sendingEmail ? 'Dispatching...' : 'Yes, Send Now'}
                </button>
                <button onClick={() => setShowEmailConfirm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium transition">
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowEmailConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-black rounded font-bold text-sm transition shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <Send className="w-4 h-4" /> Dispatch QR Email
              </button>
            )}
          </div>
          
          {!isEditing && (
            <button onClick={startEditing} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}