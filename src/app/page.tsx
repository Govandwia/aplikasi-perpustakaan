"use client";

import { useEffect, useState } from "react";
import { getDashboardMetrics, getTransactions, getBooks, TransaksiWithBuku } from "@/lib/db";
import { Book, Clock, Activity, FileText, CheckCircle2, AlertCircle, ArrowRight, BookOpen, UserCheck, RefreshCw, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ totalBuku: 0, dipinjam: 0, overdue: 0 });
  const [recentActivities, setRecentActivities] = useState<TransaksiWithBuku[]>([]);
  const [topCategories, setTopCategories] = useState<{title: string, desc: string, count: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardMetrics();
        setMetrics(data);
        const txs = await getTransactions();
        setRecentActivities(txs.slice(0, 5));
        
        const books = await getBooks();
        const catMap = new Map<string, number>();
        books.forEach(b => {
          const cat = b.kategori || "Umum";
          catMap.set(cat, (catMap.get(cat) || 0) + 1);
        });

        const sortedCats = Array.from(catMap.entries())
          .map(([title, totalStok]) => ({
            title,
            desc: `${Math.ceil(totalStok / 10)} Rak Tersedia`, // Simulasi rak
            count: `+${totalStok} buku`
          }))
          .sort((a, b) => parseInt(b.count.slice(1)) - parseInt(a.count.slice(1)))
          .slice(0, 4);

        setTopCategories(sortedCats);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dark Gradient Card */}
        <div className="md:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-[#f4722b] p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm mb-3">
              <SparklesIcon />
              Rekomendasi Sistem
            </div>
            <h3 className="text-xl font-bold leading-tight mb-2">12+ Buku Populer</h3>
            <p className="text-white/80 text-xs leading-relaxed">Buku yang paling sering dicari oleh pengunjung bulan ini.</p>
          </div>
          <Button className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold mt-6 h-9 rounded-lg">
            Lihat Semua
          </Button>
        </div>

        {/* White Stats Cards */}
        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-[#f4722b]/10 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4 text-[#f4722b]" />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">Total Koleksi</h4>
            <div className="text-2xl font-bold text-slate-900">{isLoading ? "..." : metrics.totalBuku} <span className="text-xs font-medium text-slate-500">Buku</span></div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">Inventaris dari seluruh kategori buku.</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-3">
              <UserCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">Sirkulasi Aktif</h4>
            <div className="text-2xl font-bold text-slate-900">{isLoading ? "..." : metrics.dipinjam} <span className="text-xs font-medium text-slate-500">Buku</span></div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">Buku yang sedang dalam masa peminjaman saat ini.</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${metrics.overdue > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
              <AlertCircle className={`w-4 h-4 ${metrics.overdue > 0 ? 'text-red-500' : 'text-emerald-500'}`} />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">Jatuh Tempo</h4>
            <div className={`text-2xl font-bold ${metrics.overdue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {isLoading ? "..." : metrics.overdue} <span className="text-xs font-medium text-slate-500">Overdue</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">Pengembalian yang melewati tenggat waktu.</p>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Kategori Populer (Talent Pools Style) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900">Kategori Teratas</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full"><ArrowRight className="w-4 h-4 text-slate-400" /></Button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex flex-col gap-1">
            {isLoading ? (
               <div className="p-4 text-center text-sm text-slate-400">Memuat kategori...</div>
            ) : topCategories.length === 0 ? (
               <div className="p-4 text-center text-sm text-slate-400">Belum ada kategori buku</div>
            ) : topCategories.map((kategori, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Book className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{kategori.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{kategori.desc}</p>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{kategori.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Table (Database Style) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-900">Database Aktivitas</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Cari data..." className="text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-300 w-48 shadow-sm" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-slate-500 h-10">Nama</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-10">Buku</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-10">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-10 text-right pr-6">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-xs text-slate-400">Loading...</TableCell></TableRow>
                ) : recentActivities.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-xs text-slate-400">Belum ada data aktivitas</TableCell></TableRow>
                ) : (
                  recentActivities.map((tx) => (
                    <TableRow key={tx.id} className="border-slate-100 hover:bg-slate-50/50">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{tx.nama_peminjam}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">{tx.judul}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {tx.status === 'SELESAI' ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs font-medium text-slate-700">Selesai</span></>
                          ) : (
                            <><RefreshCw className="w-3.5 h-3.5 text-blue-500" /><span className="text-xs font-medium text-slate-700">Dipinjam</span></>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 text-right pr-6">
                        {tx.tanggal_kembali || tx.tanggal_pinjam}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
      </div>
      
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
    </svg>
  );
}
