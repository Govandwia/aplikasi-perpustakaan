"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SyncConflict } from "@/hooks/useSync";

interface SyncDialogProps {
  conflicts: SyncConflict[];
  onResolve: (conflict: SyncConflict, choose: "local" | "cloud") => void;
}

export function SyncDialog({ conflicts, onResolve }: SyncDialogProps) {
  if (conflicts.length === 0) return null;

  // We process one conflict at a time for simplicity
  const currentConflict = conflicts[0];
  const type = currentConflict.type;
  
  // A helper to format timestamps nicely
  const formatTime = (ts: number) => {
    if (!ts) return "Tidak diketahui";
    return new Date(ts).toLocaleString();
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Perbedaan Data Ditemukan</DialogTitle>
          <DialogDescription>
            Terdapat perbedaan data {type === "buku" ? "Buku" : "Transaksi"} antara data di laptop Anda dengan data di Firebase (Cloud).
            Terdapat {conflicts.length} perbedaan data yang harus ditinjau.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="border rounded-lg p-4 bg-slate-50 relative">
            <span className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase">
              Data Laptop
            </span>
            {currentConflict.localData ? (
              <>
                <h4 className="font-semibold text-slate-900 mb-2 mt-2">
                  {type === "buku" ? currentConflict.localData.judul : currentConflict.localData.nama_peminjam}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Terakhir diubah:<br/>
                  <strong className="text-slate-700">{formatTime(currentConflict.localTime)}</strong>
                </p>
                <Button 
                  variant="outline" 
                  className="w-full bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                  onClick={() => onResolve(currentConflict, "local")}
                >
                  Gunakan Versi Laptop
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-slate-400">
                <p className="text-sm">Data belum ada di Laptop</p>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-slate-50 relative">
            <span className="absolute top-0 right-0 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase">
              Data Cloud
            </span>
            {currentConflict.cloudData ? (
              <>
                <h4 className="font-semibold text-slate-900 mb-2 mt-2">
                  {type === "buku" ? currentConflict.cloudData.judul : currentConflict.cloudData.nama_peminjam}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Terakhir diubah:<br/>
                  <strong className="text-slate-700">{formatTime(currentConflict.cloudTime)}</strong>
                </p>
                <Button 
                  variant="outline" 
                  className="w-full bg-white text-orange-700 border-orange-200 hover:bg-orange-50"
                  onClick={() => onResolve(currentConflict, "cloud")}
                >
                  Gunakan Versi Cloud
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-slate-400">
                <p className="text-sm">Data belum ada di Server</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
           <p className="text-xs text-slate-400 italic">
             Pilihan Anda akan menimpa data yang tidak dipilih secara permanen.
           </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
