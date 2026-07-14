"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { getBooks, addBook, updateBook, deleteBook, Buku } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, BookOpen, Printer } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StikerDialog } from "@/components/StikerDialog";

function KatalogContent() {
  const [books, setBooks] = useState<Buku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const kategoriParam = searchParams.get("kategori");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    if (kategoriParam) {
      setSearchQuery(kategoriParam);
    }
  }, [kategoriParam]);
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Buku | null>(null);
  const [formData, setFormData] = useState({
    isbn: "", judul: "", pengarang: "", penerbit: "", tahun_terbit: "", kategori: "", klasifikasi: ""
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [stikerBook, setStikerBook] = useState<Buku | null>(null);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error("Gagal memuat buku", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // In-memory filter for instant search (<300ms requirement)
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return books.filter(book => 
      book.judul.toLowerCase().includes(q) ||
      (book.isbn && book.isbn.toLowerCase().includes(q)) ||
      book.pengarang.toLowerCase().includes(q) ||
      (book.kategori && book.kategori.toLowerCase().includes(q))
    );
  }, [books, searchQuery]);

  const handleOpenDialog = (book?: Buku) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        isbn: book.isbn || "",
        judul: book.judul,
        pengarang: book.pengarang,
        penerbit: book.penerbit || "",
        tahun_terbit: book.tahun_terbit?.toString() || "",
        kategori: book.kategori || "",
        klasifikasi: book.klasifikasi || ""
      });
    } else {
      setEditingBook(null);
      setFormData({ isbn: "", judul: "", pengarang: "", penerbit: "", tahun_terbit: "", kategori: "", klasifikasi: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        isbn: formData.isbn || null,
        judul: formData.judul,
        pengarang: formData.pengarang,
        penerbit: formData.penerbit || null,
        tahun_terbit: formData.tahun_terbit ? parseInt(formData.tahun_terbit) : null,
        kategori: formData.kategori || null,
        klasifikasi: formData.klasifikasi || null
      };

      if (editingBook) {
        await updateBook({ ...editingBook, ...payload });
        toast.success("Buku berhasil diperbarui!");
      } else {
        await addBook(payload);
        toast.success("Buku baru berhasil ditambahkan!");
      }
      
      setIsDialogOpen(false);
      loadBooks();
    } catch (err) {
      console.error("Gagal menyimpan buku", err);
      toast.error("Gagal menyimpan data buku. Pastikan koneksi internet stabil.");
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId !== null) {
      try {
        await deleteBook(confirmDeleteId);
        toast.success("Buku berhasil dihapus!");
        loadBooks();
      } catch (err) {
        console.error("Gagal menghapus buku", err);
        toast.error("Gagal menghapus buku. Pastikan tidak ada transaksi aktif untuk buku ini.");
      } finally {
        setConfirmDeleteId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Katalog Buku</h2>
          <p className="text-slate-500 mt-1">Kelola data inventaris buku perpustakaan.</p>
        </div>
        
        <Button onClick={() => handleOpenDialog()} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Buku Baru
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari berdasarkan Judul, Pengarang, ISBN, atau Kategori..." 
              className="pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {kategoriParam && (
             <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
               Bersihkan Filter Kategori
             </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[100px]">ISBN</TableHead>
                <TableHead>Judul Buku</TableHead>
                <TableHead>Pengarang</TableHead>
                <TableHead>Kategori / Klasifikasi</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>Memuat katalog...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-slate-600">Tidak ada buku ditemukan</p>
                    <p className="text-sm">Cobalah mencari dengan kata kunci lain atau tambah buku baru.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500">{book.isbn || "-"}</TableCell>
                    <TableCell className="font-medium text-slate-900">{book.judul}</TableCell>
                    <TableCell className="text-slate-600">{book.pengarang}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {book.kategori && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-full font-medium uppercase tracking-wider">
                            {book.kategori}
                          </span>
                        )}
                        {book.klasifikasi && (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] rounded-full font-medium tracking-wider border border-indigo-100">
                            {book.klasifikasi}
                          </span>
                        )}
                        {!book.kategori && !book.klasifikasi && <span className="text-slate-400">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${book.status === 'TERSEDIA' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {book.status === 'TERSEDIA' ? 'Tersedia' : 'Sedang Dipinjam'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                        onClick={() => setStikerBook(book)}
                        title="Cetak Stiker"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleOpenDialog(book)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(book.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit Data Buku" : "Tambah Buku Baru"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="judul">Judul Buku <span className="text-red-500">*</span></Label>
                <Input id="judul" required value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} placeholder="Masukkan judul buku" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pengarang">Pengarang <span className="text-red-500">*</span></Label>
                <Input id="pengarang" required value={formData.pengarang} onChange={(e) => setFormData({...formData, pengarang: e.target.value})} placeholder="Nama Penulis" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Barcode)</Label>
                <Input id="isbn" value={formData.isbn} onChange={(e) => setFormData({...formData, isbn: e.target.value})} placeholder="Scan atau ketik ISBN" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="penerbit">Penerbit</Label>
                <Input id="penerbit" value={formData.penerbit} onChange={(e) => setFormData({...formData, penerbit: e.target.value})} placeholder="Nama Penerbit" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tahun">Tahun Terbit</Label>
                <Input id="tahun" type="number" min="1000" max="2100" value={formData.tahun_terbit} onChange={(e) => setFormData({...formData, tahun_terbit: e.target.value})} placeholder="Misal: 2023" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Input id="kategori" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} placeholder="Fiksi, Sains, dll" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="klasifikasi">Klasifikasi Buku</Label>
                <Input id="klasifikasi" value={formData.klasifikasi} onChange={(e) => setFormData({...formData, klasifikasi: e.target.value})} placeholder="Misal: 004 (Ilmu Komputer)" />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Simpan Data</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        title="Hapus Buku"
        description="Apakah Anda yakin ingin menghapus buku ini secara permanen? Data yang sudah dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <StikerDialog 
        isOpen={stikerBook !== null} 
        book={stikerBook} 
        onClose={() => setStikerBook(null)} 
      />
    </div>
  );
}

export default function KatalogBuku() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat katalog...</div>}>
      <KatalogContent />
    </Suspense>
  );
}
