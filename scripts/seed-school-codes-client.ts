/**
 * Seed School Verification Codes to Firestore (Client SDK Version)
 * 
 * Uses Firebase Client SDK instead of Admin SDK for easier local setup.
 * Run this once to migrate codes to database.
 * 
 * Usage: npx tsx scripts/seed-school-codes-client.ts
 */

import { config } from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Load environment variables
config()

// School signup codes. CHANGE THESE before seeding: anyone with a code can register for that school.
const SCHOOL_CODES = {
  'kv-bengaluru': {
    teacherCode: 'KV-TEACH-CHANGE-ME',
    studentCode: 'KV-STU-CHANGE-ME',
  },
  'dps-rkpuram': {
    teacherCode: 'DPS-TEACH-CHANGE-ME',
    studentCode: 'DPS-STU-CHANGE-ME',
  },
  'stx-mumbai': {
    teacherCode: 'STX-TEACH-CHANGE-ME',
    studentCode: 'STX-STU-CHANGE-ME',
  },
}

// Admin emails
const ADMIN_EMAILS = ['ashcr2004@gmail.com']

async function seedSchoolCodes() {
  try {
    console.log('🔐 Seeding school verification codes to Firestore...\n')

    // Initialize Firebase Client SDK
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)

    console.log(`🔧 Connected to project: ${firebaseConfig.projectId}\n`)

    // Seed each school's codes
    for (const [schoolId, codes] of Object.entries(SCHOOL_CODES)) {
      const codesRef = doc(db, 'schools', schoolId, 'private', 'codes')

      await setDoc(codesRef, {
        teacherCode: codes.teacherCode,
        studentCode: codes.studentCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      console.log(`✅ Seeded codes for: ${schoolId}`)
      console.log(`   Teacher: ${codes.teacherCode}`)
      console.log(`   Student: ${codes.studentCode}`)
    }

    console.log('\n📧 Seeding admin emails...\n')

    // Seed admin emails
    const adminEmailsRef = doc(db, 'config', 'adminEmails')
    await setDoc(adminEmailsRef, {
      emails: ADMIN_EMAILS,
      updatedAt: new Date().toISOString(),
    })

    console.log(`✅ Seeded ${ADMIN_EMAILS.length} admin email(s)`)
    ADMIN_EMAILS.forEach((email) => console.log(`   - ${email}`))

    console.log('\n✨ Seeding complete!\n')
    console.log('📝 Verify in Firebase Console:')
    console.log('   https://console.firebase.google.com')
    console.log('   → Firestore Database')
    console.log('   → Check /schools/{id}/private/codes')
    console.log('   → Check /config/adminEmails\n')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    process.exit(1)
  }
}

// Run the seeder
seedSchoolCodes()
