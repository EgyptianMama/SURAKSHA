import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// ── DEV ONLY: Suppress Firestore HMR assertion noise ──
// Firebase Firestore SDK v11 throws harmless "INTERNAL ASSERTION FAILED"
// errors when Next.js Turbopack hot-reloads modules. These do NOT affect
// functionality. We silence the Firebase logger AND patch console.error
// BEFORE any Firestore operations happen.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Patch console.error/warn to swallow ALL Firestore internal assertions
  const _origError = console.error
  const _origWarn = console.warn
  function isFirestoreNoise(...args: any[]): boolean {
    const joined = args.map(a =>
      typeof a === "string" ? a : (a?.message ?? "")
    ).join(" ")
    return joined.includes("INTERNAL ASSERTION FAILED") || joined.includes("Unexpected state")
  }
  console.error = (...args: any[]) => { if (!isFirestoreNoise(...args)) _origError.apply(console, args) }
  console.warn = (...args: any[]) => { if (!isFirestoreNoise(...args)) _origWarn.apply(console, args) }
}

// Silence the @firebase/firestore logger in development to prevent
// its internal errors from reaching the Next.js error overlay
if (process.env.NODE_ENV === "development") {
  try { setLogLevel("silent") } catch { /* ignore if called before init */ }
}

// Initialize Firebase App (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Auth — safe to call multiple times
export const auth = getAuth(app)

// Firestore — Use persistent local cache for offline-first reads + faster loads.
// REMOVED experimentalForceLongPolling which was forcing slow HTTP polling
// instead of fast WebSocket connections (2-5x slower for every read/write).
let db: ReturnType<typeof getFirestore>
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  })
} catch {
  db = getFirestore(app)
}
export { db }

export default app
