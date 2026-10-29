/**
 * Admin Email Check API
 * 
 * Server-side check if an email is in the admin whitelist.
 * Admin list is kept server-side only, never exposed to client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

type CheckAdminEmailRequest = {
  email: string
}

type CheckAdminEmailResponse = {
  isAdmin: boolean
}

/**
 * Hardcoded admin emails (fallback)
 * In production, store in Firestore for easy management
 */
const FALLBACK_ADMIN_EMAILS = ['ashcr2004@gmail.com']

/**
 * Get admin emails from Firestore or fallback to hardcoded list
 */
async function getAdminEmails(): Promise<string[]> {
  try {
    const firestore = getAdminFirestore()
    const configRef = firestore.collection('config').doc('adminEmails')
    const configDoc = await configRef.get()

    if (configDoc.exists) {
      const data = configDoc.data()
      if (data?.emails && Array.isArray(data.emails)) {
        return data.emails.map((e: string) => e.toLowerCase().trim())
      }
    }
  } catch (error) {
    // Proceed with fallback list when service account is missing
  }

  // Fallback to hardcoded list
  return FALLBACK_ADMIN_EMAILS.map((e) => e.toLowerCase().trim())
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckAdminEmailRequest = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { isAdmin: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const adminEmails = await getAdminEmails()
    const normalizedEmail = email.toLowerCase().trim()
    const isAdmin = adminEmails.includes(normalizedEmail)

    // Log for audit (don't log the actual email for privacy)
    console.log(`Admin email check: ${isAdmin ? '✅ Admin' : '❌ Not admin'}`)

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error('Admin email check error:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}
