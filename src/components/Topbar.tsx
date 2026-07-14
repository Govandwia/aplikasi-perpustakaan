"use client";

import { Search, RefreshCw, Wifi, WifiOff, Cloud } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useSync } from "@/hooks/useSync";
import { SyncDialog } from "./SyncDialog";

export function Topbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  
  const { isOnline, isSyncing, lastSyncTime, conflicts, syncData, resolveConflict } = useSync();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim() !== "") {
      router.push(`/katalog?q=${encodeURIComponent(query)}`);
    }
  };

  const formatLastSync = (ts: number | null) => {
    if (!ts) return "Belum sinkron";
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Cari buku di seluruh perpustakaan... (Tekan Enter)" 
            className="pl-9 bg-slate-50 border-slate-200 rounded-lg h-9 focus-visible:ring-slate-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-medium shadow-sm">
            /
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50">
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-xs font-semibold text-slate-600">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right flex flex-col justify-center">
              <span className="text-[10px] font-medium text-slate-400 uppercase leading-none">Sync Terakhir</span>
              <span className="text-xs font-semibold text-slate-700">{formatLastSync(lastSyncTime)}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={syncData}
              disabled={!isOnline || isSyncing}
              className="h-8 border-slate-200 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isSyncing ? "animate-spin text-blue-500" : "text-slate-500"}`} />
              {isSyncing ? "Menyelaraskan..." : "Sinkronisasi"}
            </Button>
          </div>
        </div>
      </div>
      
      <SyncDialog conflicts={conflicts} onResolve={resolveConflict} />
    </>
  );
}
