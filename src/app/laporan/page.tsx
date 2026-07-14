"use client";

import { useEffect, useState, useMemo } from "react";
import { getTransactions, TransaksiWithBuku } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, History, FileText } from "lucide-react";

export default function Laporan() {
  const [transactions, setTransactions] = useState<TransaksiWithBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions("SELESAI");
      setTransactions(data);
    } catch (err) {
      console.error("Gagal memuat riwayat transaksi", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return transactions.filter(tx => 
      tx.nama_peminjam.toLowerCase().includes(q) ||
      tx.judul.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    // Build CSV content
    const headers = ["ID Transaksi", "Peminjam", "Kontak", "Buku", "Tanggal Pinjam", "Tenggat Waktu", "Tanggal Kembali", "Denda (Rp)"];
    const rows = filteredData.map(tx => [
      tx.id,
      `"${tx.nama_peminjam.replace(/"/g, '""')}"`,
      `"${tx.kontak_peminjam || '-'}"`,
      `"${tx.judul.replace(/"/g, '""')}"`,
      tx.tanggal_pinjam,
      tx.tenggat_waktu,
      tx.tanggal_kembali || '-',
      tx.denda
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    // Create Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Perpustakaan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pelaporan & Riwayat</h2>
          <p className="text-slate-500 mt-1">Data historis sirkulasi buku yang telah selesai.</p>
        </div>
        
        <Button onClick={handleExportCSV} disabled={filteredData.length === 0 || isLoading} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-4 h-4 mr-2" />
          Ekspor CSV
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Riwayat Pengembalian
            </CardTitle>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Cari peminjam atau buku..." 
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Peminjam</TableHead>
                <TableHead>Judul Buku</TableHead>
                <TableHead>Durasi Pinjam</TableHead>
                <TableHead>Denda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">Memuat riwayat transaksi...</TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-slate-600">Tidak ada riwayat transaksi</p>
                    <p className="text-sm">Riwayat akan muncul setelah buku dikembalikan.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div className="font-medium text-slate-900">{tx.nama_peminjam}</div>
                      {tx.kontak_peminjam && <div className="text-xs text-slate-500">{tx.kontak_peminjam}</div>}
                    </TableCell>
                    <TableCell className="text-slate-700">{tx.judul}</TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">Pinjam: {new Date(tx.tanggal_pinjam).toLocaleDateString('id-ID')}</div>
                      <div className="text-sm font-medium text-emerald-600">Kembali: {tx.tanggal_kembali ? new Date(tx.tanggal_kembali).toLocaleDateString('id-ID') : '-'}</div>
                    </TableCell>
                    <TableCell>
                      {tx.denda > 0 ? (
                        <span className="font-bold text-red-600">Rp {tx.denda.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
