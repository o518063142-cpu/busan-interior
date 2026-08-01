import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAMaaI8cvBBIh5UmAhOWw534G289rkrQzI",
  authDomain: "busan-interior.firebaseapp.com",
  projectId: "busan-interior",
  storageBucket: "busan-interior.firebasestorage.app",
  messagingSenderId: "788916587506",
  appId: "1:788916587506:web:59f3551aeba3d8f228b96b",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const firebaseProjectId = "busan-interior";
export const firebaseDatabaseId = "(default)";

export default app;



