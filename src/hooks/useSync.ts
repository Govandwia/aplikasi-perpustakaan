import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { dbFirebase } from "@/lib/firebase";
import { getBooks, getTransactions, getStorage, setStorage, Buku, Transaksi } from "@/lib/db";

// Mock collection names for now
const BOOKS_COL = "buku";
const TXS_COL = "transaksi";

export type SyncConflict = {
  type: "buku" | "transaksi";
  localData: any;
  cloudData: any;
  localTime: number;
  cloudTime: number;
};

export function useSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  // Monitor network status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Sync logic placeholder (Simplified for implementation plan)
  const syncData = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    setConflicts([]); // Reset conflicts

    try {
      // 1. Fetch Local Data
      const localBooks = await getBooks();
      
      // 2. Fetch Cloud Data
      // (Using try/catch for Firebase in case config is mock/invalid)
      try {
        const querySnapshot = await getDocs(collection(dbFirebase, BOOKS_COL));
        const cloudBooks: Buku[] = [];
        querySnapshot.forEach((doc) => {
          cloudBooks.push(doc.data() as Buku);
        });

        const newConflicts: SyncConflict[] = [];

        // Check local vs cloud
        localBooks.forEach(localItem => {
          const cloudItem = cloudBooks.find(c => c.id === localItem.id);
          if (!cloudItem) {
             newConflicts.push({ type: "buku", localData: localItem, cloudData: null, localTime: localItem.last_updated || 0, cloudTime: 0 });
          } else {
            const localTime = localItem.last_updated || 0;
            const cloudTime = cloudItem.last_updated || 0;
            if (localTime !== cloudTime) {
              newConflicts.push({ type: "buku", localData: localItem, cloudData: cloudItem, localTime, cloudTime });
            }
          }
        });

        // Check cloud vs local for items missing in local
        cloudBooks.forEach(cloudItem => {
          const localItem = localBooks.find(l => l.id === cloudItem.id);
          if (!localItem) {
             newConflicts.push({ type: "buku", localData: null, cloudData: cloudItem, localTime: 0, cloudTime: cloudItem.last_updated || 0 });
          }
        });

        setConflicts(newConflicts);
        
        if (newConflicts.length === 0) {
          setLastSyncTime(Date.now());
        }

      } catch (err) {
        console.warn("Firebase not properly configured or error fetching data", err);
        // We do not break the app if Firebase fails, we just stop syncing.
      }
      
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const resolveConflict = async (conflict: SyncConflict, choose: "local" | "cloud") => {
    try {
      if (choose === "local") {
        // Push local data to Firebase
        if (conflict.localData) {
          await setDoc(doc(dbFirebase, conflict.type === "buku" ? BOOKS_COL : TXS_COL, conflict.localData.id.toString()), conflict.localData);
        }
      } else if (choose === "cloud") {
        // Overwrite local data with cloud data
        if (conflict.cloudData) {
          const storageKey = conflict.type === "buku" ? "buku" : "transaksi";
          const items: any[] = getStorage(storageKey);
          const index = items.findIndex(item => item.id === conflict.cloudData.id);
          
          if (index !== -1) {
            items[index] = conflict.cloudData;
          } else {
            items.push(conflict.cloudData);
          }
          setStorage(storageKey, items);
        }
      }

      setConflicts(prev => prev.filter(c => c !== conflict));
      
      if (conflicts.length <= 1) {
         setLastSyncTime(Date.now());
      }
    } catch (err) {
      console.error("Failed to resolve conflict", err);
      alert("Gagal menyimpan data ke Firebase. Pastikan aturan keamanan (Security Rules) Firestore sudah disetel ke true.");
    }
  };

  // Auto-sync on startup if online
  useEffect(() => {
    if (isOnline) {
      // Small timeout to not block initial render
      const timer = setTimeout(() => {
        syncData();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    conflicts,
    syncData,
    resolveConflict
  };
}
