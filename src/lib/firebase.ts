import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace with actual Firebase Config provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyDByaiRpmpor5GnoHXLgr2Cut6bR7zUTV8",
  authDomain: "database-perpustakaan-ca570.firebaseapp.com",
  projectId: "database-perpustakaan-ca570",
  storageBucket: "database-perpustakaan-ca570.firebasestorage.app",
  messagingSenderId: "383205134226",
  appId: "1:383205134226:web:6c240204b7e9b62345fb4b",
  measurementId: "G-0WDL1CKB4G"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const dbFirebase = getFirestore(app);
