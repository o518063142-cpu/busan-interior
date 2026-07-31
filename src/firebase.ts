import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Safely retrieve environment variable or fall back to default
function getEnv(value: string | undefined, defaultValue: string): string {
  if (value && value.trim() !== "") {
    return value.trim();
  }
  return defaultValue;
}

const firebaseConfig = {
  apiKey: getEnv(import.meta.env.VITE_FIREBASE_API_KEY, "AIzaSyCjEfK7NfematPyPE9_B75iwNM2mNbcLi0"),
  authDomain: getEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "gen-lang-client-0750474444.firebaseapp.com"),
  projectId: getEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, "gen-lang-client-0750474444"),
  storageBucket: getEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "gen-lang-client-0750474444.firebasestorage.app"),
  messagingSenderId: getEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, "985083864484"),
  appId: getEnv(import.meta.env.VITE_FIREBASE_APP_ID, "1:985083864484:web:cb5360b0e23aeb625f8d31"),
};

// Initialize Firebase app instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseProjectId = firebaseConfig.projectId;

// Automatically select default database ID based on target project:
// AI Studio default project uses its specific database ID, whereas external projects (like 'busan-interior') use '(default)'
const defaultDbId =
  firebaseConfig.projectId === "gen-lang-client-0750474444"
    ? "ai-studio-3c001230-03e1-40da-bb67-abe20afbe8dd"
    : "(default)";

export const firebaseDatabaseId = getEnv(import.meta.env.VITE_FIREBASE_DATABASE_ID, defaultDbId);

console.log("Firebase Project ID:", firebaseProjectId);
console.log("Firebase Database ID:", firebaseDatabaseId);

// Export Firestore (default database), Storage, and Auth instances
export const db = getFirestore(app, firebaseDatabaseId);
export const storage = getStorage(app);
export const auth = getAuth(app);


