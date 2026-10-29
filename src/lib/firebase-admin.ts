/**
 * Firebase Admin SDK Initialization
 * 
 * Server-side Firebase SDK for:
 * - Token verification (authentication)
 * - Accessing Firestore without client SDK
 * - Custom claims management
 * - Server-side operations
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 * 
 * For development: You can use project ID only (less secure but easier)
 * For production: Use full service account JSON
 */
function initializeFirebaseAdmin() {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0]
  }

  // Try to get service account from environment
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  
  if (!projectId) {
    console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required in environment variables')
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required in environment variables')
  }

  // Option 1: Use service account JSON (production)
  // Download from Firebase Console > Project Settings > Service Accounts
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ) as ServiceAccount

      console.log('✅ Initializing Firebase Admin with service account')
      
      return initializeApp({
        credential: cert(serviceAccount),
        projectId,
      })
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error)
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format')
    }
  }

  // Option 2: Use Application Default Credentials (development)
  // Works in Firebase environments (App Hosting, Cloud Functions)
  // For local dev, you can use: gcloud auth application-default login
  console.warn(
    '⚠️ Using Application Default Credentials. For production, set FIREBASE_SERVICE_ACCOUNT_KEY'
  )
  
  return initializeApp({
    projectId,
  })
}

// Initialize on module load with error handling
let adminApp: ReturnType<typeof initializeApp> | null = null
let initError: Error | null = null

try {
  adminApp = initializeFirebaseAdmin()
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error)
  initError = error as Error
}

/**
 * Get Firebase Admin Auth instance
 * Used for verifying ID tokens
 */
export function getAdminAuth() {
  if (initError) {
    throw initError
  }
  if (!adminApp) {
    throw new Error('Firebase Admin is not initialized')
  }
  return getAuth(adminApp)
}

/**
 * Get Firebase Admin Firestore instance
 * Used for server-side Firestore operations
 */
export function getAdminFirestore() {
  if (initError) {
    throw initError
  }
  if (!adminApp) {
    throw new Error('Firebase Admin is not initialized')
  }
  return getFirestore(adminApp)
}

/**
 * Verify a Firebase ID token and return user info
 * 
 * @param idToken - Firebase ID token from client
 * @returns Decoded token with user info (uid, email, etc.)
 * @throws Error if token is invalid or expired
 */
export async function verifyIdToken(idToken: string) {
  const auth = getAdminAuth()
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error('Token verification failed:', error)
    throw new Error('Invalid or expired authentication token')
  }
}

/**
 * Get user profile from Firestore by UID
 * 
 * @param uid - User's Firebase UID
 * @returns User profile data
 */
export async function getUserProfile(uid: string) {
  const firestore = getAdminFirestore()
  const userDoc = await firestore.collection('users').doc(uid).get()
  
  if (!userDoc.exists) {
    throw new Error('User profile not found')
  }
  
  return userDoc.data()
}

export default adminApp
