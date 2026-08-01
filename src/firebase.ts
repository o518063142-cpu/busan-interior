import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Safely retrieve environment variable or fall back to default
function getEnv(value: string | undefined, defaultValue: string): string {
  if (
    value &&
    typeof value === "string" &&
    value.trim() !== "" &&
    value.trim() !== "undefined" &&
    value.trim() !== "null"
  ) {
    return value.trim();
  }
  return defaultValue;
}

const firebaseConfig = {
  apiKey: getEnv(import.meta.env.VITE_FIREBASE_API_KEY, "AIzaSyAMaaI8cvBBIh5UmAhOWw534G289rkrQzI"),
  authDomain: getEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "busan-interior.firebaseapp.com"),
  projectId: getEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, "busan-interior"),
  storageBucket: getEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "busan-interior.firebasestorage.app"),
  messagingSenderId: getEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, "788916587506"),
  appId: getEnv(import.meta.env.VITE_FIREBASE_APP_ID, "1:788916587506:web:59f3551aeba3d8f228b96b"),
};

// Initialize Firebase app instance safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseProjectId = firebaseConfig.projectId;
export const firebaseDatabaseId = getEnv(import.meta.env.VITE_FIREBASE_DATABASE_ID, "(default)");

console.log("Firebase Project ID:", firebaseProjectId);
console.log("Firebase Database ID:", firebaseDatabaseId);

// Export Firestore (default database), Storage, and Auth instances
export const db = getFirestore(app, firebaseDatabaseId);
export const storage = getStorage(app);
export const auth = getAuth(app);


