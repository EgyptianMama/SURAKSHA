/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts
 * Used to initialize Firebase Admin SDK
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Server starting - initializing Firebase Admin...')
    
    // Pre-load Firebase Admin to catch initialization errors early
    try {
      await import('./src/lib/firebase-admin')
      console.log('✅ Firebase Admin initialized successfully')
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error)
      // Don't throw - let routes handle the error gracefully
    }
  }
}
