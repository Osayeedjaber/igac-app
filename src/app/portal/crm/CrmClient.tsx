'use client';

import { useState } from 'react';
import { Users, UploadCloud, LayoutList, Activity, LogOut, ShieldAlert, Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Tab = 'registry' | 'ingestion' | 'committees' | 'logs' | 'secretariat' | 'command';

export default function CrmClient() {
  const [activeTab, setActiveTab] = useState<Tab>('registry');
  const router = useRouter();

  const handleLogout = async () => {
    // In a real app, you would want to hit an endpoint to clear the HTTP-only cookie, 
    // or at least clear it from the client if it wasn't HTTP-only.
    // For now, redirect to login which could be designed to clear it.
    // To properly clear the HTTP-only cookie, you need an API route.
    await fetch('/api/admin/crm-logout', { method: 'POST' });
    router.push('/portal/crm/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-zinc-950 relative selection:bg-yellow-500/50 selection:text-black">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[500px] pointer-events-none bg-gradient-to-b from-yellow-500/5 to-transparent z-0 blur-3xl opacity-50"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 bg-zinc-900 border-b border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-[0_0_15px_rgba(234,179,8,0.2)] bg-black p-1.5 rounded-full border border-yellow-500/20">
            <Image 
              src="/Imun/Logo/Golden.png" 
              alt="IGAC Logo" 
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Operations Hub</h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                Live
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500/80 leading-none">
              Secretariat Control Room
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all rounded-md bg-zinc-800 text-zinc-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Lock Terminal
        </button>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0 overflow-x-auto shadow-inner">
        <div className="flex space-x-2">
          <TabButton 
            active={activeTab === 'registry'} 
            onClick={() => setActiveTab('registry')} 
            icon={<Users className="w-4 h-4" />} 
            label="Registry" 
          />
          <TabButton 
            active={activeTab === 'ingestion'} 
            onClick={() => setActiveTab('ingestion')} 
            icon={<UploadCloud className="w-4 h-4" />} 
            label="Ingestion" 
          />
          <TabButton 
            active={activeTab === 'committees'} 
            onClick={() => setActiveTab('committees')} 
            icon={<LayoutList className="w-4 h-4" />} 
            label="Committees" 
          />
          <TabButton 
            active={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')} 
            icon={<Activity className="w-4 h-4" />} 
            label="Scan Logs" 
          />
          <TabButton 
            active={activeTab === 'secretariat'} 
            onClick={() => setActiveTab('secretariat')} 
            icon={<ShieldAlert className="w-4 h-4" />} 
            label="Secretariat" 
          />
          <TabButton 
            active={activeTab === 'command'} 
            onClick={() => setActiveTab('command')} 
            icon={<Radio className="w-4 h-4 text-emerald-400" />} 
            label="Command Center" 
          />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
        {activeTab === 'registry' && <RegistryTab />}
        {activeTab === 'ingestion' && <IngestionTab />}
        {activeTab === 'committees' && <CommitteesTab />}
        {activeTab === 'logs' && <ScanLogsTab />}
        {activeTab === 'secretariat' && <SecretariatTab />}
        {activeTab === 'command' && <CommandCenterTab />}
      </main>
    </div>
  );
}

import { RegistryTab } from './RegistryTab';
import { IngestionTab } from './IngestionTab';
import { CommitteesTab } from './CommitteesTab';
import { ScanLogsTab } from './ScanLogsTab';
import { SecretariatTab } from './SecretariatTab';
import { CommandCenterTab } from './CommandCenterTab';

// --- Helpers ---

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold transition-all rounded-full border ${
        active 
          ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
          : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
