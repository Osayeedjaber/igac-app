'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Link as LinkIcon, 
  Download, 
  RefreshCw,
  Settings2,
  Table,
  CheckSquare
} from 'lucide-react';
import { addDelegatesBatchAction, fetchSystemSettingsAction, updateSystemSettingsAction, fetchDelegatesAction } from './actions';
import { Skeleton } from "@/components/ui/skeleton";

type Mode = 'IMPORT' | 'EXPORT';
type Source = 'CSV' | 'SHEETDB';

export function IngestionTab() {
  const [mode, setMode] = useState<Mode>('IMPORT');
  const [source, setSource] = useState<Source>('CSV');

  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // SheetDB Config
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  // Import State
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({
    full_name: '',
    email: '',
    committee: '',
    country: '',
    position: '',
    institution: ''
  });
  const [previewStep, setPreviewStep] = useState(false);

  // Stats
  const [stats, setStats] = useState<{ total: number; success: number; failed: number } | null>(null);

  // Load Config
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setIsInitialLoading(true);
    try {
      const data = await fetchSystemSettingsAction();
      if (data && data.sheetdb_url) {
        setSheetUrl(data.sheetdb_url);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitialLoading(false);
    }
  }

  async function saveSheetUrl() {
    setIsSavingUrl(true);
    setMessage(null);
    try {
      await updateSystemSettingsAction({ sheetdb_url: sheetUrl });
      setMessage({ type: 'success', text: 'Sheet API URL successfully saved to global settings.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Failed to save URL: ' + e.message });
    }
    setIsSavingUrl(false);
  }

  // --- IMPORT FLOW ---
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);
    setPreviewStep(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRawHeaders(results.meta.fields || []);
        setRawData(results.data);
        autoMapHeaders(results.meta.fields || []);
        setPreviewStep(true);
        setLoading(false);
      },
      error: (err) => {
        setMessage({ type: 'error', text: 'CSV Parse Error: ' + err.message });
        setLoading(false);
      }
    });
  };

  const loadFromSheetDb = async () => {
    if (!sheetUrl) {
       setMessage({ type: 'error', text: 'Please enter and save a SheetDB URL first.' });
       return;
    }
    setLoading(true);
    setMessage(null);
    setPreviewStep(false);

    try {
      const res = await fetch(sheetUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No data found or invalid format from SheetDB.");
      }

      const headers = Object.keys(data[0]);
      setRawHeaders(headers);
      setRawData(data);
      autoMapHeaders(headers);
      setPreviewStep(true);
    } catch (e: any) {
      setMessage({ type: 'error', text: 'SheetDB Fetch Error: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  const autoMapHeaders = (headers: string[]) => {
    const newMappings: Record<string, string> = {
      full_name: '', email: '', committee: '', country: '', position: '', institution: ''
    };
    
    const hLower = headers.map(h => h.toLowerCase());
    
    headers.forEach((h, i) => {
      const lower = hLower[i];
      if (lower.includes('name') && !newMappings.full_name) newMappings.full_name = h;
      if (lower.includes('mail') && !newMappings.email) newMappings.email = h;
      if (lower.includes('committee') && !newMappings.committee) newMappings.committee = h;
      if (lower.includes('country') && !newMappings.country) newMappings.country = h;
      if ((lower.includes('position') || lower.includes('type') || lower.includes('role')) && !newMappings.position) newMappings.position = h;
      if ((lower.includes('institution') || lower.includes('school') || lower.includes('university') || lower.includes('org')) && !newMappings.institution) newMappings.institution = h;
    });

    setMappings(newMappings);
  };

  const confirmAndImport = async () => {
    if (!mappings.full_name || !mappings.email) {
      setMessage({ type: 'error', text: 'Mapping Error: Full Name and Email are strictly required.' });
      return;
    }

    if (!confirm(`Are you sure you want to import ${rawData.length} rows into the live database?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setStats(null);

    const batchToInsert = [];
    let failCount = 0;

    for (const row of rawData) {
      const name = row[mappings.full_name];
      const email = row[mappings.email];
      
      if (!name || !email) {
        failCount++;
        continue;
      }

      const qrToken = `DEL-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now()}`;
      batchToInsert.push({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        committee: mappings.committee ? (row[mappings.committee]?.trim() || null) : null,
        country: mappings.country ? (row[mappings.country]?.trim() || null) : null,
        position: mappings.position ? (row[mappings.position]?.trim() || null) : null,
        institution: mappings.institution ? (row[mappings.institution]?.trim() || null) : null,
        qr_token: qrToken,
        mail_status: 'PENDING'
      });
    }

    try {
      if (batchToInsert.length > 0) {
        await addDelegatesBatchAction(batchToInsert);
      }
      setStats({ total: rawData.length, success: batchToInsert.length, failed: failCount });
      setMessage({
        type: batchToInsert.length > 0 ? 'success' : 'error',
        text: `Successfully imported ${batchToInsert.length} delegates. (${failCount} bypassed due to missing names/emails).`,
      });
      setPreviewStep(false);
      setRawData([]);
    } catch (err: any) {
      setMessage({ type: 'error', text: `Insertion failed: ${err.message}` });
    }
    
    setLoading(false);
  };

  // --- EXPORT FLOW ---
  const confirmAndExport = async () => {
    if (!confirm(`Are you sure you want to export the entire Delegate Registry to ${source}?`)) return;

    setLoading(true);
    setMessage(null);

    try {
      // Fetch all delegates
      const delegates = await fetchDelegatesAction();
      
      if (!delegates || delegates.length === 0) {
         setMessage({ type: 'error', text: 'Database is empty. Nothing to export.' });
         setLoading(false);
         return;
      }

      // Map to strict properties for export
      const rows = delegates.map((d: any) => ({
         ID: d.id,
         DelegateCode: d.qr_token, // Added for clarity
         FullName: d.full_name,
         Email: d.email,
         Committee: d.committee || '',
         Country: d.country || '',
         Position: d.position || '',
         Institution: d.institution || '',
         QRToken: d.qr_token,
         RegisteredAt: d.created_at
      }));

      if (source === 'CSV') {
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Delegates_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage({ type: 'success', text: `Successfully generated and downloaded CSV for ${rows.length} delegates.` });
      } 
      else if (source === 'SHEETDB') {
        if (!sheetUrl) throw new Error("No SheetDB URL configured.");
        
        // Pushing data to SheetDB. Usually format requires an array of objects.
        // NOTE: Standard SheetDB API appends rows.
        const res = await fetch(sheetUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: rows })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: res.statusText }));
          const errMsg = errorData.error || res.statusText;
          if (typeof errMsg === 'string' && errMsg.includes("Spreadsheet is empty")) {
            throw new Error(
              "SheetDB requires headers to exist before pushing data! " +
              "Please open your Google Sheet and paste these exact headers into Row 1: " +
              "ID, DelegateCode, FullName, Email, Committee, Country, Position, Institution, QRToken, RegisteredAt"
            );
          }
          throw new Error(errMsg);
        }

        setMessage({ type: 'success', text: `Successfully synced ${rows.length} delegates to your Google Sheet.` });
      }

    } catch (e: any) {
      setMessage({ type: 'error', text: 'Export failed: ' + e.message });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-500" />
            Data Ingestion Hub
          </h2>
          <p className="text-sm text-zinc-400">Map and synchronize massive datasets bi-directionally.</p>
        </div>

        {isInitialLoading ? (
          <Skeleton className="h-10 w-48 rounded-lg" />
        ) : (
          <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => {setMode('IMPORT'); setPreviewStep(false); setMessage(null);}} 
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${mode === 'IMPORT' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              IMPORT
            </button>
            <button 
               onClick={() => {setMode('EXPORT'); setPreviewStep(false); setMessage(null);}} 
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${mode === 'EXPORT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              EXPORT
            </button>
          </div>
        )}
      </div>

      {isInitialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-96 w-full md:col-span-2 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Global Config Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
               <h3 className="text-sm font-bold mb-4 text-zinc-100 flex items-center gap-2">
                 <Settings2 className="w-4 h-4 text-blue-400" /> API Connections
               </h3>
               <div className="space-y-3">
                 <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">SheetDB.io URL endpoint</label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={sheetUrl}
                     onChange={(e) => setSheetUrl(e.target.value)}
                     className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 transition outline-none font-mono"
                     placeholder="https://sheetdb.io/api/v1/..."
                   />
                   <button onClick={saveSheetUrl} disabled={isSavingUrl} className="px-4 py-2 bg-blue-600/20 text-blue-400 font-bold rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                     {isSavingUrl ? '...' : 'Save'}
                   </button>
                 </div>
                 <p className="text-[10px] text-zinc-500 font-semibold">Connects directly to your Google Sheet without hardcoding logic.</p>
               </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-center">
              <h3 className="text-sm font-bold mb-4 text-zinc-100 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-400" /> Target Format
              </h3>
              <div className="flex bg-black/50 rounded-lg p-1 border border-zinc-800">
                {(['CSV', 'SHEETDB'] as Source[]).map(s => (
                  <button 
                    key={s}
                    onClick={() => setSource(s)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded transition-all flex justify-center items-center gap-2 ${source === s ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                  >
                    {s === 'CSV' ? <UploadCloud className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    {s === 'CSV' ? 'Local CSV' : 'Google Sheet API'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border shadow-lg ${message.type === 'success' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-red-950/30 border-red-500/30 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <div>
            <p className="font-bold text-sm tracking-wide">{message.text}</p>
            {stats && (
              <p className="mt-1 text-xs font-semibold opacity-80">Parsed: {stats.total} | Successful Adds: {stats.success} | By-passed Errors: {stats.failed}</p>
            )}
          </div>
        </div>
      )}

      {/* ACTION PANELS */}
      {!previewStep && mode === 'IMPORT' && (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-500/50 transition duration-300">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            {source === 'CSV' ? <UploadCloud className="w-8 h-8 text-blue-400" /> : <RefreshCw className="w-8 h-8 text-blue-400" />}
          </div>
          
          <div>
            {source === 'CSV' ? (
              <label className="cursor-pointer text-sm font-bold text-white px-6 py-3 bg-blue-600 hover:bg-blue-500 transition rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95 inline-block">
                {loading ? 'Processing Document...' : 'Select CSV Target'}
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" disabled={loading} />
              </label>
            ) : (
              <button 
                onClick={loadFromSheetDb} 
                disabled={loading}
                className="cursor-pointer text-sm font-bold text-white px-6 py-3 bg-blue-600 hover:bg-blue-500 transition rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95 inline-block disabled:opacity-50"
              >
                {loading ? 'Fetching API Payload...' : 'Load Spreadhseet Headers'}
              </button>
            )}
          </div>
          
          <p className="text-xs text-zinc-500 mt-2 font-medium">
            {source === 'CSV' ? 'Once verified, you will be prompted to map structural fields.' : 'Ensuring public API connections are set before pulling headers.'}
          </p>
        </div>
      )}

      {!previewStep && mode === 'EXPORT' && (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500/50 transition duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <Download className="w-8 h-8 text-emerald-400" />
          </div>
          
          <button 
            onClick={confirmAndExport} 
            disabled={loading}
            className="cursor-pointer text-sm font-bold text-emerald-950 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 transition rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 inline-block disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Processing Protocol...' : (source === 'CSV' ? 'Download Full Registry CSV' : 'Push Data Pipeline Sync')}
          </button>
          
          <p className="text-xs text-zinc-500 mt-2 font-medium">
            {source === 'CSV' ? 'Includes full database identities and encoded transaction stamps.' : 'Will POST JSON bodies strictly to the specified Google Sheet endpoint.'}
          </p>
        </div>
      )}

      {/* MAPPING UI & PREVIEW (Only for IMPORT) */}
      {previewStep && mode === 'IMPORT' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-bl-lg flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
               {rawData.length} Target Rows Loaded
            </div>

            <h3 className="text-lg font-bold text-white mb-6">Structural Column Mapping</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
               {[
                 { key: 'full_name', label: 'Full Name', required: true },
                 { key: 'email', label: 'Email Address', required: true },
                 { key: 'committee', label: 'Committee', required: false },
                 { key: 'country', label: 'Country', required: false },
                 { key: 'position', label: 'Delegation Type / Position', required: false },
                 { key: 'transaction_id', label: 'Transaction ID', required: false }
               ].map((field) => (
                 <div key={field.key} className="flex flex-col gap-1.5">
                   <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                     <span>{field.label} {field.required && <span className="text-rose-500">*</span>}</span>
                   </label>
                   <select
                     value={mappings[field.key as keyof typeof mappings]}
                     onChange={(e) => setMappings({...mappings, [field.key]: e.target.value})}
                     className={`w-full bg-black/50 border rounded-lg px-3 py-2.5 text-sm text-white outline-none transition ${mappings[field.key] ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-zinc-800 focus:border-zinc-600'}`}
                   >
                     <option value="" className="bg-zinc-900 text-zinc-400">-- Ignore --</option>
                     {rawHeaders.map(h => (
                       <option key={h} value={h} className="bg-zinc-900 text-white">{h}</option>
                     ))}
                   </select>
                 </div>
               ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <button onClick={() => setPreviewStep(false)} className="text-sm font-bold text-zinc-500 hover:text-white transition">
                 Discard Payload
               </button>

               <button 
                 onClick={confirmAndImport}
                 disabled={loading || !mappings.full_name || !mappings.email}
                 className="cursor-pointer text-sm font-bold text-emerald-950 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 transition rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
               >
                 <CheckSquare className="w-5 h-5" />
                 {loading ? 'Running Injectors...' : 'Confirm Pipeline Injection'}
               </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}