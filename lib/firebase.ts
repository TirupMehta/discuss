import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

import { ref, get, set, update, type Database } from "firebase/database";

const emailToKey = (email: string): string => email.replace(/\./g, ",");

async function getWithFallback(db: Database, uidPath: string, emailPath: string) {
  try {
    return await get(ref(db, uidPath));
  } catch (error: any) {
    if (
      error.message?.includes("Permission denied") ||
      error.code === "PERMISSION_DENIED" ||
      error.status === 401 ||
      error.status === 403
    ) {
      return await get(ref(db, emailPath));
    }
    throw error;
  }
}

async function setWithFallback(db: Database, uidPath: string, emailPath: string, value: any) {
  try {
    return await set(ref(db, uidPath), value);
  } catch (error: any) {
    if (
      error.message?.includes("Permission denied") ||
      error.code === "PERMISSION_DENIED" ||
      error.status === 401 ||
      error.status === 403
    ) {
      return await set(ref(db, emailPath), value);
    }
    throw error;
  }
}

async function updateWithFallback(db: Database, uidPath: string, emailPath: string, value: any) {
  try {
    return await update(ref(db, uidPath), value);
  } catch (error: any) {
    if (
      error.message?.includes("Permission denied") ||
      error.code === "PERMISSION_DENIED" ||
      error.status === 401 ||
      error.status === 403
    ) {
      return await update(ref(db, emailPath), value);
    }
    throw error;
  }
}

export { app, auth, db, googleProvider, emailToKey, getWithFallback, setWithFallback, updateWithFallback };

