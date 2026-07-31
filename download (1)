import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMaaI8cvBBIh5UmAhOWw534G289rkrQzI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "busan-interior.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "busan-interior",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "busan-interior.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "788916587506",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:788916587506:web:7ccc05b2f0f2791928b96b",
};

// Initialize Firebase app instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseProjectId = firebaseConfig.projectId;
export const firebaseDatabaseId = "(default)";

console.log("Firebase Project ID:", firebaseProjectId);
console.log("Firebase Database ID:", firebaseDatabaseId);

// Export Firestore (default database), Storage, and Auth instances
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);


