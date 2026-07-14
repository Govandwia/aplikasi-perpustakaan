import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { dbFirebase } from "@/lib/firebase";

export interface Buku {
  id: number;
  isbn: string | null;
  judul: string;
  pengarang: string;
  penerbit: string | null;
  tahun_terbit: number | null;
  kategori: string | null;
  klasifikasi: string | null;
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

const BOOKS_COL = "buku";
const TXS_COL = "transaksi";

// --- BUKU ---
export async function getBooks(searchTerm?: string): Promise<Buku[]> {
  const snapshot = await getDocs(collection(dbFirebase, BOOKS_COL));
  const books: Buku[] = [];
  snapshot.forEach(doc => {
    books.push(doc.data() as Buku);
  });
  
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    return books.filter(b => b.judul.toLowerCase().includes(q) || b.isbn === searchTerm);
  }
  return books;
}

export async function addBook(book: Omit<Buku, 'id' | 'last_updated' | 'status'>): Promise<number> {
  const newId = Date.now(); // Gunakan timestamp sebagai ID unik
  const newBook: Buku = {
    ...book,
    id: newId,
    status: 'TERSEDIA',
    last_updated: Date.now()
  };
  await setDoc(doc(dbFirebase, BOOKS_COL, newId.toString()), newBook);
  return newId;
}

export async function updateBook(book: Buku): Promise<boolean> {
  const updatedBook = { ...book, last_updated: Date.now() };
  await setDoc(doc(dbFirebase, BOOKS_COL, book.id.toString()), updatedBook);
  return true;
}

export async function deleteBook(id: number): Promise<boolean> {
  await deleteDoc(doc(dbFirebase, BOOKS_COL, id.toString()));
  return true;
}

// --- TRANSAKSI ---
export async function getTransactions(status?: string): Promise<TransaksiWithBuku[]> {
  const txSnapshot = await getDocs(collection(dbFirebase, TXS_COL));
  const bookSnapshot = await getDocs(collection(dbFirebase, BOOKS_COL));
  
  const books: Buku[] = [];
  bookSnapshot.forEach(doc => books.push(doc.data() as Buku));
  
  let result: TransaksiWithBuku[] = [];
  txSnapshot.forEach(doc => {
    const tx = doc.data() as Transaksi;
    const b = books.find(buku => buku.id === tx.id_buku);
    result.push({
      ...tx,
      judul: b?.judul || "Buku Dihapus",
      isbn: b?.isbn || null
    });
  });
  
  if (status) {
    result = result.filter(tx => tx.status === status);
  }
  
  return result.sort((a, b) => new Date(b.tanggal_pinjam).getTime() - new Date(a.tanggal_pinjam).getTime());
}

export async function addTransaction(trx: Omit<Transaksi, 'id' | 'tanggal_kembali' | 'status' | 'denda' | 'last_updated'>): Promise<boolean> {
  const newId = Date.now();
  const newTx: Transaksi = {
    ...trx,
    id: newId,
    status: 'DIPINJAM',
    denda: 0,
    tanggal_kembali: null,
    last_updated: Date.now()
  };
  
  // Save Transaction
  await setDoc(doc(dbFirebase, TXS_COL, newId.toString()), newTx);
  
  // Update Book Status
  const books = await getBooks();
  const book = books.find(b => b.id === trx.id_buku);
  if (book) {
    book.status = 'DIPINJAM';
    await updateBook(book);
  }
  
  return true;
}

export async function returnTransaction(id: number, id_buku: number, tanggal_kembali: string, denda: number): Promise<boolean> {
  const txSnapshot = await getDocs(collection(dbFirebase, TXS_COL));
  let txToUpdate: Transaksi | null = null;
  txSnapshot.forEach(d => {
    const t = d.data() as Transaksi;
    if (t.id === id) txToUpdate = t;
  });
  
  if (txToUpdate) {
    const tx = txToUpdate as Transaksi;
    tx.status = 'SELESAI';
    tx.tanggal_kembali = tanggal_kembali;
    tx.denda = denda;
    tx.last_updated = Date.now();
    await setDoc(doc(dbFirebase, TXS_COL, id.toString()), tx);
  }
  
  const books = await getBooks();
  const book = books.find(b => b.id === id_buku);
  if (book) {
    book.status = 'TERSEDIA';
    await updateBook(book);
  }
  
  return true;
}

export async function getDashboardMetrics() {
  const books = await getBooks();
  const txs = await getTransactions();
  
  const totalBuku = books.length;
  const dipinjamTxs = txs.filter(t => t.status === "DIPINJAM");
  const dipinjam = dipinjamTxs.length;
  
  const today = new Date().toISOString().split('T')[0];
  const overdue = dipinjamTxs.filter(t => t.tenggat_waktu < today).length;
  
  return { totalBuku, dipinjam, overdue };
}

// Stubs to prevent useSync.ts from breaking
export const getStorage = <T>(key: string): T[] => [];
export const setStorage = <T>(key: string, data: T[]) => {};
