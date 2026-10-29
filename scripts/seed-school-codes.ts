/**
 * Seed School Verification Codes to Firestore
 * 
 * Moves school codes from hardcoded constants to Firestore private subcollections.
 * Run this once to migrate codes to database.
 * 
 * Usage: npx tsx scripts/seed-school-codes.ts
 */

import { config } from 'dotenv'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Load environment variables from .env file
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
    // Initialize Firebase Admin
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    
    if (!projectId) {
      console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID not found in .env file')
      console.error('')
      console.error('Please add this to your .env file:')
      console.error('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id')
      console.error('')
      console.error('You can find your project ID in Firebase Console:')
      console.error('https://console.firebase.google.com → Project Settings')
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required')
    }

    console.log(`🔧 Using Firebase project: ${projectId}\n`)

    if (getApps().length === 0) {
      // Try service account first
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.log('🔑 Using service account credentials...')
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        initializeApp({
          credential: cert(serviceAccount),
          projectId,
        })
      } else {
        // Fallback to default credentials
        console.log('⚠️  No service account found, using default credentials...')
        console.log('   (This works in Firebase/GCP environments)')
        initializeApp({ projectId })
      }
    }

    const firestore = getFirestore()

    console.log('🔐 Seeding school verification codes to Firestore...\n')

    // Seed each school's codes
    for (const [schoolId, codes] of Object.entries(SCHOOL_CODES)) {
      const codesRef = firestore
        .collection('schools')
        .doc(schoolId)
        .collection('private')
        .doc('codes')

      await codesRef.set({
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
    const adminEmailsRef = firestore.collection('config').doc('adminEmails')
    await adminEmailsRef.set({
      emails: ADMIN_EMAILS,
      updatedAt: new Date().toISOString(),
    })

    console.log(`✅ Seeded ${ADMIN_EMAILS.length} admin email(s)`)
    ADMIN_EMAILS.forEach((email) => console.log(`   - ${email}`))

    console.log('\n✨ Seeding complete!\n')
    console.log('📝 Next steps:')
    console.log('   1. Update auth-context.tsx to use API validation')
    console.log('   2. Remove hardcoded codes from school-codes.ts')
    console.log('   3. Test signup flow\n')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeder
seedSchoolCodes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
