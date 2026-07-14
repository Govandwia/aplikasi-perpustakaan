// Versi Sementara (Browser/localStorage)
// Menggunakan localStorage karena Tauri SQL plugin tidak bisa jalan di browser biasa.

export interface Buku {
  id: number;
  isbn: string | null;
  judul: string;
  pengarang: string;
  penerbit: string | null;
  tahun_terbit: number | null;
  kategori: string | null;
  status: 'TERSEDIA' | 'DIPINJAM';
  last_updated: number;
}

export interface Transaksi {
  id: number;
  id_buku: number;
  nama_peminjam: string;
  kontak_peminjam: string | null;
  tanggal_pinjam: string;
  tenggat_waktu: string;
  tanggal_kembali: string | null;
  status: string;
  denda: number;
  last_updated: number;
}

export interface TransaksiWithBuku extends Transaksi {
  judul: string;
  isbn: string | null;
}

// Helper untuk membaca dari localStorage
export const getStorage = <T>(key: string): T[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setStorage = <T>(key: string, data: T[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const seedDatabase = () => {
  if (typeof window === "undefined") return;
  const existingBooksStr = localStorage.getItem("buku");
  const existingBooks: Buku[] = existingBooksStr ? JSON.parse(existingBooksStr) : [];

  // Cek apakah data lama (dengan sistem stok) masih tersimpan. Jika ya, hapus untuk re-seeding.
  const hasOldData = existingBooks.some(b => 'stok' in b);
  if (hasOldData) {
    localStorage.removeItem("buku");
    localStorage.removeItem("transaksi");
    existingBooks.length = 0;
  }

  // Jika jumlah buku kurang dari 5 (berarti hanya ada data tes seperti BUKU MIKO), kita tambahkan dummy data
  if (existingBooks.length < 5) {
    const dummyBooks: Buku[] = [
      { id: 1001, isbn: "978-602-03-0393-2", judul: "Bumi Manusia", pengarang: "Pramoedya Ananta Toer", penerbit: "Lentera Dipantara", tahun_terbit: 2005, kategori: "Fiksi & Sastra", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1002, isbn: "978-602-0822-34-1", judul: "Sapiens: Riwayat Singkat Umat Manusia", pengarang: "Yuval Noah Harari", penerbit: "KPG", tahun_terbit: 2011, kategori: "Sejarah", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1003, isbn: "978-602-04-9836-2", judul: "Atomic Habits", pengarang: "James Clear", penerbit: "Gramedia", tahun_terbit: 2018, kategori: "Pengembangan Diri", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1004, isbn: "978-602-06-2339-9", judul: "Filosofi Teras", pengarang: "Henry Manampiring", penerbit: "Kompas", tahun_terbit: 2018, kategori: "Filsafat", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1005, isbn: "978-623-242-145-6", judul: "Clean Code", pengarang: "Robert C. Martin", penerbit: "Prentice Hall", tahun_terbit: 2008, kategori: "Sains & Teknologi", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1006, isbn: "978-979-91-0164-3", judul: "Laskar Pelangi", pengarang: "Andrea Hirata", penerbit: "Bentang Pustaka", tahun_terbit: 2005, kategori: "Fiksi & Sastra", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1007, isbn: "978-602-424-694-5", judul: "A Brief History of Time", pengarang: "Stephen Hawking", penerbit: "Bantam Books", tahun_terbit: 1988, kategori: "Sains & Teknologi", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1008, isbn: "978-602-03-3295-6", judul: "Cantik Itu Luka", pengarang: "Eka Kurniawan", penerbit: "Gramedia", tahun_terbit: 2002, kategori: "Fiksi & Sastra", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1009, isbn: "978-602-06-3317-6", judul: "Grit", pengarang: "Angela Duckworth", penerbit: "Scribner", tahun_terbit: 2016, kategori: "Pengembangan Diri", status: 'TERSEDIA', last_updated: Date.now() },
      { id: 1010, isbn: "978-149-19-0424-4", judul: "You Don't Know JS", pengarang: "Kyle Simpson", penerbit: "O'Reilly Media", tahun_terbit: 2015, kategori: "Sains & Teknologi", status: 'TERSEDIA', last_updated: Date.now() },
    ];
    
    // Gabungkan dengan buku yang sudah ada (misal BUKU MIKO)
    const newBooks = [...existingBooks];
    dummyBooks.forEach(db => {
      if (!newBooks.find(b => b.judul === db.judul)) {
        db.id = newBooks.length > 0 ? Math.max(...newBooks.map(b => b.id)) + 1 : 1;
        newBooks.push({...db, last_updated: Date.now()});
      }
    });
    localStorage.setItem("buku", JSON.stringify(newBooks));

    const existingTxsStr = localStorage.getItem("transaksi");
    const existingTxs: Transaksi[] = existingTxsStr ? JSON.parse(existingTxsStr) : [];
    
    if (existingTxs.length < 3) {
      const today = new Date();
      const past2Days = new Date(today); past2Days.setDate(past2Days.getDate() - 2);
      const past10Days = new Date(today); past10Days.setDate(past10Days.getDate() - 10);
      const future5Days = new Date(today); future5Days.setDate(future5Days.getDate() + 5);
      const overdue3Days = new Date(today); overdue3Days.setDate(overdue3Days.getDate() - 3);

      // Pastikan id_buku valid (menggunakan id dari Buku Manusia, atau buku pertama)
      const validBook1 = newBooks.find(b => b.judul === "Bumi Manusia")?.id || newBooks[0].id;
      const validBook2 = newBooks.find(b => b.judul === "Clean Code")?.id || newBooks[0].id;
      const validBook3 = newBooks.find(b => b.judul === "Atomic Habits")?.id || newBooks[0].id;

      const dummyTxs: Transaksi[] = [
        { id: 1001, id_buku: validBook1, nama_peminjam: "Budi Santoso", kontak_peminjam: "08123456789", tanggal_pinjam: past2Days.toISOString().split('T')[0], tenggat_waktu: future5Days.toISOString().split('T')[0], tanggal_kembali: null, status: "DIPINJAM", denda: 0, last_updated: Date.now() },
        { id: 1002, id_buku: validBook2, nama_peminjam: "Siti Aminah", kontak_peminjam: "10B", tanggal_pinjam: past10Days.toISOString().split('T')[0], tenggat_waktu: overdue3Days.toISOString().split('T')[0], tanggal_kembali: null, status: "DIPINJAM", denda: 0, last_updated: Date.now() },
        { id: 1003, id_buku: validBook3, nama_peminjam: "Andi Wijaya", kontak_peminjam: "11A", tanggal_pinjam: past10Days.toISOString().split('T')[0], tenggat_waktu: overdue3Days.toISOString().split('T')[0], tanggal_kembali: past2Days.toISOString().split('T')[0], status: "SELESAI", denda: 7000, last_updated: Date.now() },
      ];

      const newTxs = [...existingTxs];
      dummyTxs.forEach(dt => {
        dt.id = newTxs.length > 0 ? Math.max(...newTxs.map(t => t.id)) + 1 : 1;
        newTxs.push(dt);
        
        // Update book status to DIPINJAM if tx status is DIPINJAM
        if (dt.status === "DIPINJAM") {
           const bIdx = newBooks.findIndex(b => b.id === dt.id_buku);
           if (bIdx !== -1) {
              newBooks[bIdx].status = 'DIPINJAM';
           }
        }
      });
      localStorage.setItem("transaksi", JSON.stringify(newTxs));
      localStorage.setItem("buku", JSON.stringify(newBooks)); // resave books with updated status
    }
  }
};

// --- BUKU ---
export async function getBooks(searchTerm?: string): Promise<Buku[]> {
  seedDatabase(); // Call seeder automatically when fetching books if empty
  const books = getStorage<Buku>("buku");
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    return books.filter(b => b.judul.toLowerCase().includes(q) || b.isbn === searchTerm);
  }
  return books;
}

export async function addBook(book: Omit<Buku, 'id' | 'last_updated' | 'status'>): Promise<number> {
  const books = getStorage<Buku>("buku");
  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  books.push({ id: newId, ...book, status: 'TERSEDIA', last_updated: Date.now() });
  setStorage("buku", books);
  return newId;
}

export async function updateBook(book: Buku): Promise<boolean> {
  const books = getStorage<Buku>("buku");
  const index = books.findIndex(b => b.id === book.id);
  if (index !== -1) {
    books[index] = { ...book, last_updated: Date.now() };
    setStorage("buku", books);
  }
  return true;
}

export async function deleteBook(id: number): Promise<boolean> {
  const books = getStorage<Buku>("buku");
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    // Soft delete or just remove it. Since offline sync usually requires tombstones, 
    // for a simple approach we will just delete it locally. 
    // In a real robust sync, we'd mark it as deleted and set last_updated.
    setStorage("buku", books.filter(b => b.id !== id));
  }
  return true;
}

// --- TRANSAKSI ---
export async function getTransactions(status?: string): Promise<TransaksiWithBuku[]> {
  seedDatabase();
  const txs = getStorage<Transaksi>("transaksi");
  const books = getStorage<Buku>("buku");
  
  let result = txs.map(tx => {
    const b = books.find(buku => buku.id === tx.id_buku);
    return {
      ...tx,
      judul: b?.judul || "Buku Dihapus",
      isbn: b?.isbn || null
    };
  });
  
  if (status) {
    result = result.filter(tx => tx.status === status);
  }
  
  // Sort by tanggal_pinjam desc
  return result.sort((a, b) => new Date(b.tanggal_pinjam).getTime() - new Date(a.tanggal_pinjam).getTime());
}

export async function addTransaction(trx: Omit<Transaksi, 'id' | 'tanggal_kembali' | 'status' | 'denda' | 'last_updated'>): Promise<boolean> {
  const txs = getStorage<Transaksi>("transaksi");
  const books = getStorage<Buku>("buku");
  
  const newId = txs.length > 0 ? Math.max(...txs.map(t => t.id)) + 1 : 1;
  txs.push({
    ...trx,
    id: newId,
    status: 'DIPINJAM',
    denda: 0,
    tanggal_kembali: null,
    last_updated: Date.now()
  });
  setStorage("transaksi", txs);
  
  const bookIndex = books.findIndex(b => b.id === trx.id_buku);
  if (bookIndex !== -1) {
    books[bookIndex].status = 'DIPINJAM';
    books[bookIndex].last_updated = Date.now();
    setStorage("buku", books);
  }
  
  return true;
}

export async function returnTransaction(id: number, id_buku: number, tanggal_kembali: string, denda: number): Promise<boolean> {
  const txs = getStorage<Transaksi>("transaksi");
  const books = getStorage<Buku>("buku");
  
  const txIndex = txs.findIndex(t => t.id === id);
  if (txIndex !== -1) {
    txs[txIndex].status = 'SELESAI';
    txs[txIndex].tanggal_kembali = tanggal_kembali;
    txs[txIndex].denda = denda;
    txs[txIndex].last_updated = Date.now();
    setStorage("transaksi", txs);
  }
  
  const bookIndex = books.findIndex(b => b.id === id_buku);
  if (bookIndex !== -1) {
    books[bookIndex].status = 'TERSEDIA';
    books[bookIndex].last_updated = Date.now();
    setStorage("buku", books);
  }
  
  return true;
}

export async function getDashboardMetrics() {
  seedDatabase();
  const books = getStorage<Buku>("buku");
  const txs = getStorage<Transaksi>("transaksi");
  
  const totalBuku = books.length;
  const dipinjamTxs = txs.filter(t => t.status === "DIPINJAM");
  const dipinjam = dipinjamTxs.length;
  
  const today = new Date().toISOString().split('T')[0];
  const overdue = dipinjamTxs.filter(t => t.tenggat_waktu < today).length;
  
  return { totalBuku, dipinjam, overdue };
}
