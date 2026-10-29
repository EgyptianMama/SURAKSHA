// School verification codes and validation for SURAKSHA
// Each school has unique teacher and student codes for registration

/**
 * ⚠️ DEPRECATION NOTICE:
 * 
 * School verification codes have been moved to Firestore for security.
 * Codes are no longer hardcoded here - they're stored in:
 * /schools/{schoolId}/private/codes
 * 
 * Validation now happens server-side via /api/validate-school-code
 * 
 * This file now only exports:
 * - School metadata (name, region, etc.) - OK to be public
 * - Helper functions (getTierFromClass, etc.)
 * - Admin checks moved to server-side API
 * 
 * To seed codes to Firestore: npm run seed:school-codes
 */

import { type UserRole } from "@/app/constants"

export type Tier = "primary" | "secondary"

export type SchoolConfig = {
  id: string
  name: string
  shortName: string
  region: string
  state: string
  // Codes removed - now in Firestore
}

export const SCHOOLS: Record<string, SchoolConfig> = {
  "kv-bengaluru": {
    id: "kv-bengaluru",
    name: "Kendriya Vidyalaya, Bengaluru",
    shortName: "KV Bengaluru",
    region: "South India",
    state: "Karnataka",
  },
  "dps-rkpuram": {
    id: "dps-rkpuram",
    name: "Delhi Public School, R.K. Puram",
    shortName: "DPS R.K. Puram",
    region: "North India",
    state: "Delhi",
  },
  "stx-mumbai": {
    id: "stx-mumbai",
    name: "St. Xavier's High School, Mumbai",
    shortName: "St. Xavier's Mumbai",
    region: "West India",
    state: "Maharashtra",
  },
}

// All schools as an array for dropdowns
export const SCHOOL_LIST = Object.values(SCHOOLS)

// Class options (1-12)
export const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1)

// Section options
export const SECTION_OPTIONS = ["A", "B", "C", "D"]

/**
 * Determine tier from class number
 * Class 1-5 = Primary, Class 6-12 = Secondary
 */
export function getTierFromClass(classNum: number): Tier {
  return classNum <= 5 ? "primary" : "secondary"
}

/**
 * Get tier display label
 */
export function getTierLabel(tier: Tier): string {
  return tier === "primary" ? "Primary (1–5)" : "Secondary (6–12)"
}

/**
 * Get tier emoji
 */
export function getTierEmoji(tier: Tier): string {
  return tier === "primary" ? "📗" : "📘"
}

/**
 * ⚠️ DEPRECATED: Use /api/validate-school-code instead
 * 
 * This function is kept for backward compatibility only.
 * Always use server-side validation in production.
 */
export function validateSchoolCode(
  schoolId: string,
  role: UserRole,
  code: string
): { valid: boolean; error?: string } {
  console.warn('validateSchoolCode is deprecated. Use /api/validate-school-code instead.')
  return { valid: false, error: 'Client-side validation disabled. Use server-side API.' }
}

/**
 * ⚠️ DEPRECATED: Use /api/check-admin-email instead
 * 
 * This function is kept for backward compatibility only.
 * Always use server-side check in production.
 */
export function isAdminEmail(email: string): boolean {
  console.warn('isAdminEmail is deprecated. Use /api/check-admin-email instead.')
  return false
}
