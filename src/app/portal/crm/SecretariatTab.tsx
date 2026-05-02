'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Loader2, CheckCircle2, ShieldAlert, Activity, Edit2, Trash2, Mail } from 'lucide-react';
import { 
  fetchSecretariatsAction, 
  updateSecretariatAccountAction, 
  deleteSecretariatAccountAction,
  sendSecretariatInvitationAction 
} from './actions';

export function SecretariatTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [secretariats, setSecretariats] = useState<any[]>([]);
  const [invitationMode, setInvitationMode] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setIsFetching(true);
    try {
      const data = await fetchSecretariatsAction();
      setSecretariats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      if (editingId) {
        await updateSecretariatAccountAction(editingId, formData);
        setMessage({ type: 'success', text: 'Account updated successfully!' });
        setEditingId(null);
      } else {
        if (invitationMode) {
          await sendSecretariatInvitationAction(formData);
          setMessage({ type: 'success', text: 'Invitation email sent successfully!' });
        } else {
          // Fallback to direct creation if needed, though invitation is preferred
          const { createSecretariatAccountAction } = await import('./actions');
          await createSecretariatAccountAction(formData);
          setMessage({ type: 'success', text: 'Account created successfully!' });
        }
      }
      (e.target as HTMLFormElement).reset();
      await loadMembers(); // refresh list
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to process request' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    
    setIsLoading(true);
    setMessage(null);
    try {
      await deleteSecretariatAccountAction(id);
      setMessage({ type: 'success', text: 'Account deleted successfully!' });
      if (editingId === id) setEditingId(null);
      await loadMembers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(sec: any) {
    setEditingId(sec.id);
    setMessage(null);
    setTimeout(() => {
      // Find form inputs by name instead of refs to be quick
      const form = document.getElementById('secretariat-form') as HTMLFormElement;
      if (form) {
        (form.elements.namedItem('fullName') as HTMLInputElement).value = sec.full_name || '';
        (form.elements.namedItem('username') as HTMLInputElement).value = sec.username || '';
      }
    }, 50);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            Secretariat
          </h2>
          <p className="text-sm text-zinc-400">Manage portal access credentials and live scanning parameters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Col - Create Form */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] pointer-events-none" />
          <h3 className="text-sm font-black mb-6 text-zinc-100 flex items-center justify-between gap-2 uppercase tracking-widest border-b border-white/5 pb-4 relative z-10">
            <div className="flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-amber-500" /> : <UserPlus className="w-4 h-4 text-amber-500" />}
              {editingId ? 'Edit Secretariat' : (invitationMode ? 'Invite Secretariat' : 'New Secretariat')}
            </div>
            {!editingId && (
              <button 
                type="button"
                onClick={() => setInvitationMode(!invitationMode)}
                className="text-[10px] bg-zinc-900 border border-white/10 px-2 py-1 rounded hover:bg-zinc-800 transition-colors"
                title={invitationMode ? "Switch to Direct Creation" : "Switch to Invitation Mode"}
              >
                {invitationMode ? "USE DIRECT" : "USE INVITE"}
              </button>
            )}
          </h3>
          
          {message && (
            <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border shadow-inner relative z-10 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message.type === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />}
              <div className="text-xs font-black uppercase tracking-wider">{message.text}</div>
            </div>
          )}

          <form id="secretariat-form" onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  placeholder="Secretariat Name"
                  className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10 transition-all text-sm font-bold shadow-inner"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="operative@igac.com"
                  className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10 transition-all text-sm font-bold shadow-inner"
                />
              </div>
            </div>

            {(!invitationMode || editingId) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    required={!!(!invitationMode || editingId)}
                    placeholder="e.g. Zaber or subaru"
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10 transition-all text-sm font-bold shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    {editingId ? 'New Passcode (Optional)' : 'Passcode'}
                  </label>
                  <input 
                    type="password" 
                    name="password"
                    required={!!(!editingId && !invitationMode)}
                    minLength={6}
                    placeholder={editingId ? "Leave blank to keep active" : "Minimum 6 characters"}
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10 transition-all text-sm font-bold tracking-widest shadow-inner placeholder:tracking-normal"
                  />
                </div>
              </div>
            )}

            {invitationMode && !editingId && (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                  An invitation will be sent to the email above. The user will be able to set their own password via the secure link provided.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingId(null);
                    setMessage(null);
                    (document.getElementById('secretariat-form') as HTMLFormElement)?.reset();
                  }}
                  className="bg-zinc-900 border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-300 font-black uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-lg text-xs"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={isLoading}
                className={`flex-1 text-xs font-black uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
                  editingId ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> : editingId ? <Edit2 className="w-4 h-4 flex-shrink-0" /> : (invitationMode ? <Mail className="w-4 h-4 flex-shrink-0" /> : <UserPlus className="w-4 h-4 flex-shrink-0" />)}
                {isLoading ? (editingId ? 'Updating...' : (invitationMode ? 'Inviting...' : 'Creating...')) : (editingId ? 'Update Credentials' : (invitationMode ? 'Send Invitation' : 'Create Credentials'))}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col - List & Stats */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Secretariat Roster
            </h3>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg shadow-inner">{secretariats.length} Members</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
            {isFetching ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Roster...</span>
              </div>
            ) : secretariats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-[10px] uppercase font-black tracking-widest border-2 border-dashed border-white/5 bg-black/40 rounded-2xl p-6">
                No secretariat members found.
              </div>
            ) : (
              secretariats.map((sec) => (
                <div key={sec.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/80 border transition-colors group relative overflow-hidden shadow-inner ${sec.status === 'PENDING' ? 'border-amber-500/20 opacity-80' : 'border-white/5 hover:border-amber-500/30'}`}>
                  {/* subtle internal glow */}
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl border flex flex-shrink-0 items-center justify-center font-black shadow-inner uppercase ${sec.status === 'PENDING' ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'}`}>
                      {sec.full_name.charAt(0)}{sec.full_name.split(' ')[1]?.[0] || ''}
                    </div>
                    <div>
                      <h4 className="font-bold text-white leading-tight mb-1 flex items-center gap-2">
                        {sec.full_name}
                        {sec.username && <span className="text-[10px] text-zinc-500 font-mono">(@{sec.username})</span>}
                        {sec.status === 'PENDING' && (
                          <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded tracking-tighter">PENDING ACCEPTANCE</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>{sec.status === 'PENDING' ? 'Status' : 'Clearance'}</span>
                        <span className={`w-1 h-1 rounded-full ${sec.status === 'PENDING' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]'}`}></span>
                        <span className={sec.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'}>{sec.status === 'PENDING' ? 'PENDING' : (sec.role || 'Operative')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 bg-black/40 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-none ml-14 sm:ml-0 relative z-10 shadow-inner sm:shadow-none">
                    {sec.status === 'ACTIVE' && (
                      <div className="flex flex-col items-start sm:items-end mr-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Scans Logged</span>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 shadow-inner">
                          <Activity className="w-3 h-3" />
                          <span className="font-mono font-bold text-xs tracking-wider">{sec.scan_count || 0}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {sec.status === 'ACTIVE' && (
                        <button 
                          onClick={() => startEdit(sec)}
                          className="bg-zinc-900 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 p-2 rounded-lg border border-white/5 transition-colors"
                          title="Edit Account"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(sec.id, sec.full_name)}
                        className="bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 p-2 rounded-lg border border-white/5 transition-colors"
                        title={sec.status === 'PENDING' ? "Cancel Invitation" : "Revoke Credentials"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}