"use client";

import { useEffect, useState, useMemo } from "react";
import { getBooks, getTransactions, addTransaction, returnTransaction, Buku, TransaksiWithBuku } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookUp, BookDown, Search, AlertCircle } from "lucide-react";

export default function Sirkulasi() {
  const [activeTab, setActiveTab] = useState<"peminjaman" | "pengembalian">("peminjaman");
  const [books, setBooks] = useState<Buku[]>([]);
  const [activeTransactions, setActiveTransactions] = useState<TransaksiWithBuku[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Peminjaman Form
  const [selectedBookId, setSelectedBookId] = useState("");
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [kontakPeminjam, setKontakPeminjam] = useState("");

  // Pengembalian Search
  const [returnSearch, setReturnSearch] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookData, trxData] = await Promise.all([
        getBooks(),
        getTransactions("DIPINJAM")
      ]);
      setBooks(bookData);
      setActiveTransactions(trxData);
    } catch (err) {
      console.error("Gagal memuat data sirkulasi", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableBooks = useMemo(() => books.filter(b => b.status === 'TERSEDIA'), [books]);

  const filteredReturns = useMemo(() => {
    const q = returnSearch.toLowerCase();
    return activeTransactions.filter(tx => 
      tx.nama_peminjam.toLowerCase().includes(q) ||
      tx.judul.toLowerCase().includes(q) ||
      (tx.isbn && tx.isbn.toLowerCase().includes(q))
    );
  }, [activeTransactions, returnSearch]);

  const handlePinjam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !namaPeminjam) return;

    const book = books.find(b => b.id.toString() === selectedBookId);
    if (!book || book.status !== 'TERSEDIA') {
      alert("Buku tidak tersedia!");
      return;
    }

    const today = new Date();
    const tenggat = new Date();
    tenggat.setDate(today.getDate() + 7); // +7 days

    try {
      await addTransaction({
        id_buku: book.id,
        nama_peminjam: namaPeminjam,
        kontak_peminjam: kontakPeminjam || null,
        tanggal_pinjam: today.toISOString().split('T')[0],
        tenggat_waktu: tenggat.toISOString().split('T')[0],
      });
      
      // Reset form
      setSelectedBookId("");
      setNamaPeminjam("");
      setKontakPeminjam("");
      
      alert("Peminjaman berhasil dicatat!");
      loadData();
    } catch (err) {
      console.error("Gagal mencatat peminjaman", err);
      alert("Gagal mencatat peminjaman.");
    }
  };

  const calculateDenda = (tenggatWaktu: string) => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tenggat = new Date(tenggatWaktu);
    
    if (hariIni > tenggat) {
      const diffTime = Math.abs(hariIni.getTime() - tenggat.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 1000; // Denda Rp 1.000 per hari
    }
    return 0;
  };

  const handleKembalikan = async (tx: TransaksiWithBuku) => {
    const denda = calculateDenda(tx.tenggat_waktu);
    
    let confirmMessage = `Kembalikan buku "${tx.judul}" dari ${tx.nama_peminjam}?`;
    if (denda > 0) {
      confirmMessage += `\n\nPERHATIAN: Peminjam terlambat dan dikenakan denda sebesar Rp ${denda.toLocaleString('id-ID')}`;
    }
    
    if (confirm(confirmMessage)) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await returnTransaction(tx.id, tx.id_buku, today, denda);
        alert("Buku berhasil dikembalikan.");
        loadData();
      } catch (err) {
        console.error("Gagal mengembalikan buku", err);
        alert("Gagal memproses pengembalian buku.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sirkulasi</h2>
        <p className="text-slate-500 mt-1">Pencatatan peminjaman dan pengembalian buku.</p>
      </div>

      <div className="flex bg-slate-200/50 p-1 rounded-lg w-fit">
        <button
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'peminjaman' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => setActiveTab('peminjaman')}
        >
          <div className="flex items-center gap-2">
            <BookUp className="w-4 h-4" /> Peminjaman Buku
          </div>
        </button>
        <button
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pengembalian' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => setActiveTab('pengembalian')}
        >
          <div className="flex items-center gap-2">
            <BookDown className="w-4 h-4" /> Pengembalian Buku
          </div>
        </button>
      </div>

      {activeTab === 'peminjaman' && (
        <Card className="max-w-2xl border-t-4 border-t-indigo-500 shadow-sm">
          <CardHeader>
            <CardTitle>Form Peminjaman Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinjam} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="buku">Pilih Buku <span className="text-red-500">*</span></Label>
                <select 
                  id="buku"
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                >
                  <option value="" disabled>-- Pilih buku yang tersedia --</option>
                  {availableBooks.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.judul} - {book.pengarang} (ID: {book.id})
                    </option>
                  ))}
                </select>
                {availableBooks.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Tidak ada buku yang tersedia untuk dipinjam saat ini.</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nama_peminjam">Nama Peminjam <span className="text-red-500">*</span></Label>
                <Input 
                  id="nama_peminjam" 
                  required 
                  placeholder="Masukkan nama peminjam" 
                  value={namaPeminjam}
                  onChange={(e) => setNamaPeminjam(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kontak_peminjam">Kontak / Kelas (Opsional)</Label>
                <Input 
                  id="kontak_peminjam" 
                  placeholder="No. HP, Kelas, atau NIM" 
                  value={kontakPeminjam}
                  onChange={(e) => setKontakPeminjam(e.target.value)}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-start gap-3 mt-4">
                <AlertCircle className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-600">
                  <p className="font-medium text-slate-900">Informasi Tenggat Waktu</p>
                  <p>Buku dipinjam hari ini dan harus dikembalikan maksimal <strong>7 hari</strong> ke depan.</p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!selectedBookId || !namaPeminjam || availableBooks.length === 0}>
                Catat Peminjaman
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'pengembalian' && (
        <Card className="shadow-sm border-t-4 border-t-emerald-500">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <CardTitle>Daftar Buku Sedang Dipinjam</CardTitle>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Cari nama peminjam atau judul buku..." 
                  className="pl-9 bg-white"
                  value={returnSearch}
                  onChange={(e) => setReturnSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Nama Peminjam</TableHead>
                  <TableHead>Judul Buku</TableHead>
                  <TableHead>Tanggal Pinjam</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead>Status/Denda</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">Memuat data sirkulasi...</TableCell>
                  </TableRow>
                ) : filteredReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      <BookDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-lg font-medium text-slate-600">Tidak ada buku yang sedang dipinjam</p>
                      {returnSearch && <p className="text-sm">Pencarian tidak menemukan hasil.</p>}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReturns.map((tx) => {
                    const denda = calculateDenda(tx.tenggat_waktu);
                    const isOverdue = denda > 0;
                    
                    return (
                      <TableRow key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="font-medium text-slate-900">
                          {tx.nama_peminjam}
                          {tx.kontak_peminjam && <div className="text-xs text-slate-500 font-normal">{tx.kontak_peminjam}</div>}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {tx.judul}
                          {tx.isbn && <div className="font-mono text-xs text-slate-400 mt-0.5">{tx.isbn}</div>}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">{new Date(tx.tanggal_pinjam).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
                            {new Date(tx.tenggat_waktu).toLocaleDateString('id-ID')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isOverdue ? (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">
                              Denda Rp {denda.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                              Aman
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleKembalikan(tx)}
                          >
                            Kembalikan
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
