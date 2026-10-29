/**
 * School Code Validation API
 * 
 * Server-side validation of school verification codes.
 * Codes are stored in Firestore private subcollections,
 * never exposed to client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import type { UserRole } from '@/app/constants'

type ValidateCodeRequest = {
  schoolId: string
  role: UserRole
  code: string
}

type ValidateCodeResponse = {
  valid: boolean
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: ValidateCodeRequest = await req.json()
    const { schoolId, role, code } = body

    // Validate input
    if (!schoolId || !role || !code) {
      return NextResponse.json(
        { valid: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Administrators don't need school codes
    if (role === 'Administrator') {
      return NextResponse.json({ valid: true })
    }

    // Only Teacher and Student roles need validation
    if (role !== 'Teacher' && role !== 'Student') {
      return NextResponse.json(
        { valid: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    let codes: any = null

    try {
      // Get codes from Firestore private subcollection
      const firestore = getAdminFirestore()
      const codesRef = firestore
        .collection('schools')
        .doc(schoolId)
        .collection('private')
        .doc('codes')

      const codesDoc = await codesRef.get()

      if (!codesDoc.exists) {
        return NextResponse.json(
          { valid: false, error: 'School not found or codes not configured' },
          { status: 404 }
        )
      }

      codes = codesDoc.data()
    } catch (error) {
      // No hardcoded fallback codes: if the Admin SDK is not configured we refuse rather than accept guessable codes.
      console.error('Admin SDK not initialized (set FIREBASE_SERVICE_ACCOUNT_KEY):', error)
      return NextResponse.json(
        { valid: false, error: 'Server is not configured to verify school codes' },
        { status: 503 }
      )
    }

    if (!codes) {
      return NextResponse.json(
        { valid: false, error: 'School codes not found' },
        { status: 404 }
      )
    }

    // Validate the code based on role
    const trimmedCode = code.trim().toUpperCase()
    const expectedCode = role === 'Teacher' ? codes.teacherCode : codes.studentCode

    if (!expectedCode) {
      return NextResponse.json(
        { valid: false, error: `No ${role.toLowerCase()} code configured for this school` },
        { status: 404 }
      )
    }

    if (trimmedCode === expectedCode.toUpperCase()) {
      // Log successful validation (for audit trail)
      console.log(`✅ Valid code for ${schoolId} - ${role}`)
      
      return NextResponse.json({ valid: true })
    }

    // Explicit check for cross-role code entry (e.g. Student entering Teacher code)
    const wrongRoleCode = role === 'Teacher' ? codes.studentCode : codes.teacherCode
    if (wrongRoleCode && trimmedCode === wrongRoleCode.toUpperCase()) {
      console.log(`❌ Cross-role code attempt for ${schoolId} - Selected: ${role}`)
      return NextResponse.json({
        valid: false,
        error: `You entered the ${role === 'Teacher' ? 'Student' : 'Teacher'} code. You cannot use a ${role === 'Teacher' ? 'Student' : 'Teacher'} code to create a ${role} account.`,
      })
    }

    // Invalid code
    console.log(`❌ Invalid code attempt for ${schoolId} - ${role}`)
    
    return NextResponse.json({
      valid: false,
      error: `Invalid ${role.toLowerCase()} verification code for this school`,
    })
  } catch (error) {
    console.error('School code validation error:', error)
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to validate school code. Please try again.',
      },
      { status: 500 }
    )
  }
}
