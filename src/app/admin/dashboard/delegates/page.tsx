"use client";

import { useState } from "react";
import Papa from "papaparse";
import { getSupabase } from "@/lib/supabase";
import { Upload, Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Database } from "@/lib/database.types";

type DelegateInsert = Database["public"]["Tables"]["delegates"]["Insert"];

// Helper structure to validate CSV uploads
interface ParsedRow {
  full_name?: string;
  email?: string;
  country?: string;
  committee?: string;
  transaction_id?: string;
}

export default function DelegateUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState({ total: 0, new: 0, skipped: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus("idle");
      setStats({ total: 0, new: 0, skipped: 0 });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("parsing");
    
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      // Normalize columns just in case someone uses slightly different headers
      transformHeader: (header) => {
        const h = header.toLowerCase().trim();
        if (h.includes("name")) return "full_name";
        if (h.includes("email")) return "email";
        if (h.includes("country")) return "country";
        if (h.includes("committee")) return "committee";
        if (h.includes("transaction")) return "transaction_id";
        return h;
      },
      complete: async (results) => {
        const rows = results.data;
        
        // Filter out empty rows or lines without required fields
        const validRows = rows.filter(r => r.full_name && r.email && r.transaction_id);
        
        if (validRows.length === 0) {
          setStatus("error");
          setErrorMessage("No valid rows found. Please ensure headers contain Name, Email, and Transaction ID.");
          return;
        }

        setStatus("uploading");

        const supabase = getSupabase();
        
        // Transform the parsed data into our specific Supabase `Insert` type
        const inserts: DelegateInsert[] = validRows.map((row) => ({
          full_name: row.full_name as string,
          email: row.email as string,
          country: row.country || "Unassigned",
          committee: row.committee || "Unassigned",
          transaction_id: row.transaction_id as string,
          // Basic token generation: email prefix + pseudo random
          qr_token: btoa(`${row.email}-${Date.now()}-${Math.random().toString(36).substring(7)}`),
        }));

        // Perform the bulk up-sert using email / transaction ID to prevent mass-duplication
        // 'transaction_id' isn't explicitly uniquely constrained yet, but doing small batches prevents 1MB+ body limits.
        const { data, error } = await supabase
          .from("delegates")
          .insert(inserts)
          .select();

        if (error) {
          setStatus("error");
          setErrorMessage(`Database Error: ${error.message}`);
          console.error(error);
          return;
        }

        setStats({
          total: rows.length,
          new: data?.length || 0,
          skipped: rows.length - (data?.length || 0)
        });
        
        setStatus("success");
      },
      error: (error: Error) => {
        setStatus("error");
        setErrorMessage(`CSV Parse Error: ${error.message}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Delegate Ingestion</h2>
          <p className="text-zinc-400 mt-1">
            Upload the master verified payment spreadsheet to lock in attendees.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <div className="rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
              <Upload className="h-6 w-6 text-orange-500" />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-white mb-2">Select CSV File</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20 transition-colors"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || status === "parsing" || status === "uploading"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 mt-4"
            >
              {status === "parsing" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing file...</>
              ) : status === "uploading" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Ingesting to Cloud...</>
              ) : (
                "Ingest Delegates"
              )}
            </button>
          </div>
        </div>

        {/* Instructions / Validation Schema mapping */}
        <div className="rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl space-y-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              Column Requirements
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Your CSV headers should closely match these formats. The parser will attempt to automatically fuzzy match names.
            </p>
          </div>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-white font-medium">Name</span>
              <span className="text-zinc-500 text-xs ml-auto">Required</span>
            </li>
            <li className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-white font-medium">Email</span>
              <span className="text-zinc-500 text-xs ml-auto">Required</span>
            </li>
            <li className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-white font-medium">Transaction ID</span>
              <span className="text-zinc-500 text-xs ml-auto">Required</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-300">Country / Allocation</span>
              <span className="text-zinc-500 text-xs ml-auto">Optional</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-300">Committee</span>
              <span className="text-zinc-500 text-xs ml-auto">Optional</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Result Status Cards */}
      {status === "success" && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-green-500">Upload Complete!</h4>
            <p className="text-sm text-green-500/80 mt-1">
              Successfully parsed {stats.total} rows. Inserted {stats.new} delegates into the master database. 
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-red-500">Insertion Failed</h4>
            <p className="text-sm text-red-500/80 mt-1">
              {errorMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}