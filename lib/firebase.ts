import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const getAuthDomain = () => {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return window.location.hostname;
  }
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
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
googleProvider.setCustomParameters({ prompt: "select_account" });

import { ref, get, set, update, type Database } from "firebase/database";

const emailToKey = (email: string): string => email.replace(/\./g, ",");

async function getWithFallback(db: Database, uidPath: string, emailPath: string) {
  try {
    const snap = await get(ref(db, uidPath));
    if (snap.exists()) {
      return snap;
    }
    try {
      return await get(ref(db, emailPath));
    } catch (fallbackError: any) {
      // If the email path fails with permission denied, it means the rules are UID-based,
      // so we can't read the old email path. Just return the empty UID snapshot!
      if (
        fallbackError.message?.includes("Permission denied") ||
        fallbackError.code === "PERMISSION_DENIED" ||
        fallbackError.status === 401 ||
        fallbackError.status === 403
      ) {
        return snap;
      }
      throw fallbackError;
    }
  } catch (error: any) {
    console.warn(`Read failed on ${uidPath}, trying fallback ${emailPath}. Error:`, error);
    try {
      return await get(ref(db, emailPath));
    } catch (fallbackError) {
      throw error;
    }
  }
}

async function setWithFallback(db: Database, uidPath: string, emailPath: string, value: any) {
  try {
    return await set(ref(db, uidPath), value);
  } catch (error: any) {
    console.warn(`Write failed on ${uidPath}, trying fallback ${emailPath}. Error:`, error);
    try {
      return await set(ref(db, emailPath), value);
    } catch (fallbackError) {
      throw error;
    }
  }
}

async function updateWithFallback(db: Database, uidPath: string, emailPath: string, value: any) {
  try {
    return await update(ref(db, uidPath), value);
  } catch (error: any) {
    console.warn(`Update failed on ${uidPath}, trying fallback ${emailPath}. Error:`, error);
    try {
      return await update(ref(db, emailPath), value);
    } catch (fallbackError) {
      throw error;
    }
  }
}

export { app, auth, db, googleProvider, emailToKey, getWithFallback, setWithFallback, updateWithFallback };

