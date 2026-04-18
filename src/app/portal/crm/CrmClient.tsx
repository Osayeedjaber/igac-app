'use client';

import { useState, useEffect } from 'react';
import { Users, UploadCloud, LayoutList, Activity, LogOut, ShieldAlert, Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Tab = 'registry' | 'ingestion' | 'committees' | 'logs' | 'secretariat' | 'command';

export default function CrmClient() {
  const [activeTab, setActiveTab] = useState<Tab>('registry');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [delegates, setDelegates] = useState<any[]>([]);
  const [selectedDelegateId, setSelectedDelegateId] = useState<string | null>(null);
  const router = useRouter();

  // Load delegates for search cache
  useEffect(() => {
    fetchDelegatesAction().then(setDelegates);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (type: 'tab' | 'delegate', value: string) => {
    if (type === 'tab') {
      setActiveTab(value as Tab);
    } else {
      // Find delegate and open registry + modal
      setActiveTab('registry');
      setSelectedDelegateId(value);
    }
  };

  const getBreadcrumbLabel = (tab: Tab) => {
    switch (tab) {
      case 'registry': return 'Delegate Registry';
      case 'ingestion': return 'Data Ingestion';
      case 'committees': return 'Committees & Allocation';
      case 'logs': return 'Live Scan Logs';
      case 'secretariat': return 'Secretariat Profiles';
      case 'command': return 'Command Center';
      default: return '';
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/crm-logout', { method: 'POST' });
    router.push('/portal/crm/login');
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black relative selection:bg-amber-500/50 selection:text-black font-sans">
      {/* Premium Background Layers */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-amber-500/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5 bg-black/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-gradient-to-b from-zinc-900 to-black p-0.5 rounded-2xl border border-white/10 group">
            <div className="absolute inset-0 bg-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image 
              src="/Imun/Logo/Golden.png" 
              alt="IGAC Logo" 
              fill
              className="object-contain p-2"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black tracking-tight text-white leading-none">Operations Hub</h1>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] uppercase font-black tracking-widest text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                Live
              </span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 leading-none">
              Secretariat Control Room
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="group flex items-center gap-2.5 px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-xl bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-zinc-400"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Lock Terminal
        </button>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 px-8 py-4 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 shrink-0 overflow-x-auto shadow-inner no-scrollbar">
        <div className="flex space-x-2">
          <TabButton active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} icon={<Users className="w-4 h-4" />} label="Registry" />
          <TabButton active={activeTab === 'ingestion'} onClick={() => setActiveTab('ingestion')} icon={<UploadCloud className="w-4 h-4" />} label="Ingestion" />
          <TabButton active={activeTab === 'committees'} onClick={() => setActiveTab('committees')} icon={<LayoutList className="w-4 h-4" />} label="Committees" />
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Activity className="w-4 h-4" />} label="Scan Logs" />
          <TabButton active={activeTab === 'secretariat'} onClick={() => setActiveTab('secretariat')} icon={<ShieldAlert className="w-4 h-4" />} label="Secretariat" />
          <div className="w-px h-6 bg-white/10 mx-2 self-center" />
          <TabButton active={activeTab === 'command'} onClick={() => setActiveTab('command')} icon={<Radio className={`w-4 h-4 ${activeTab === 'command' ? 'text-black' : 'text-amber-500'}`} />} label="Command Center" />
        </div>
      </nav>

      {/* Breadcrumbs Section */}
      <div className="relative z-10 px-8 py-3 bg-black/40 border-b border-white/5 backdrop-blur-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/portal/dashboard" className="text-zinc-600 hover:text-amber-500 transition-colors font-semibold text-xs tracking-wide">Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-800" />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => setActiveTab('registry')} className="cursor-pointer text-zinc-600 hover:text-amber-500 transition-colors font-semibold text-xs tracking-wide">CRM</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-zinc-800" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-amber-500 font-bold tracking-widest uppercase text-[10px]">{getBreadcrumbLabel(activeTab)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {activeTab === 'registry' && <RegistryTab initialSelectedId={selectedDelegateId} onClearSelection={() => setSelectedDelegateId(null)} />}
            {activeTab === 'ingestion' && <IngestionTab />}
            {activeTab === 'committees' && <CommitteesTab />}
            {activeTab === 'logs' && <ScanLogsTab />}
            {activeTab === 'secretariat' && <SecretariatTab />}
            {activeTab === 'command' && <CommandCenterTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
        onSelect={handleSelect}
        delegates={delegates}
      />
    </div>
  );
}

import { RegistryTab } from './RegistryTab';
import { IngestionTab } from './IngestionTab';
import { CommitteesTab } from './CommitteesTab';
import { ScanLogsTab } from './ScanLogsTab';
import { SecretariatTab } from './SecretariatTab';
import { CommandCenterTab } from './CommandCenterTab';
import { CommandPalette } from './CommandPalette';
import { fetchDelegatesAction } from './actions';

// --- Helpers ---

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl border ${
        active 
          ? 'border-amber-500/50 text-black bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
          : 'border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

