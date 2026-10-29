// Firestore collection paths, TypeScript types, and CRUD helpers
// This replaces mock-data.ts with real Firestore-backed data

import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  addDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, Timestamp, onSnapshot,
  type DocumentData, type QueryConstraint
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { type Tier } from "@/lib/school-codes"
import { withTimeout } from "@/lib/async-utils"

// ============================================================
// COLLECTION PATHS
// ============================================================

export const COLLECTIONS = {
  USERS: "users",
  SCHOOLS: "schools",
  ALERTS: "alerts",
  NDMA_ALERTS: "ndmaAlerts",
  EMERGENCY_CONTACTS: "emergencyContacts",
  // Sub-collections
  drills: (schoolId: string) => `schools/${schoolId}/drills`,
  homework: (schoolId: string) => `schools/${schoolId}/homework`,
  quizAttempts: (uid: string) => `users/${uid}/quizAttempts`,
  homeworkProgress: (uid: string) => `users/${uid}/homeworkProgress`,
  moduleAssignments: "moduleAssignments",
} as const

// ============================================================
// TYPES — Firestore document shapes
// ============================================================

/** School document — /schools/{schoolId} */
export type SchoolDoc = {
  id: string
  name: string
  shortName: string
  region: string
  state: string
  seismicZone: number           // BIS Zone II-V
  floodZone: string             // "Low" | "Medium" | "High"
  coordinates: {
    lat: number
    lng: number
  }
  stats: {
    studentCount: number
    teacherCount: number
    avgScore: number
    drillsCompleted: number
    lastDrillDate: string | null
    complianceScore: number     // 0-100 based on NDMA mandates
    moduleCompletionRate: number // % of students who completed current module
    modulesCompletedOnTime: number
    modulesCompletedLate: number
    modulesMissed: number
    rankingScore: number
    
    // Safety Audit fields
    lastAuditScore?: number | null
    lastAuditDate?: string | null
    lastAuditGrade?: string | null
  }
  trend: "up" | "down" | "stable"
  createdAt?: Timestamp
  lastUpdated?: Timestamp
}

/** Drill record — /schools/{schoolId}/drills/{drillId} */
export type DrillDoc = {
  id?: string
  type: string                   // "Earthquake" | "Fire" | "Flood" | "Lockdown"
  date: string                   // ISO date
  scheduledBy: string            // Teacher/Admin UID
  scheduledByName: string
  participationRate: number      // 0-100
  avgScore: number               // 0-100
  participants: number
  totalStudents: number
  notes: string
  status: "scheduled" | "completed" | "cancelled"
  createdAt?: Timestamp
}

/** Alert document — /alerts/{alertId} */
export type AlertDoc = {
  id?: string
  title: string
  message: string
  severity: "info" | "warning" | "critical" | "emergency"
  type: string                   // "drill_reminder" | "weather" | "emergency" | "announcement"
  sentBy: string                 // Admin UID
  sentByName: string
  sentAt: Timestamp
  targetSchools: string[]        // schoolIds or ["all"]
  targetTiers: Tier[]            // ["primary", "secondary"] or specific
  channels: {
    inApp: boolean
    email: boolean
    parentSms: boolean
  }
  readBy: string[]               // UIDs who have read it
}

/** NDMA/SACHET alert (cached) — /ndmaAlerts/{alertId} */
export type NdmaAlertDoc = {
  id?: string
  identifier: string             // CAP identifier
  headline: string
  description: string
  severity: string               // "Minor" | "Moderate" | "Severe" | "Extreme"
  urgency: string                // "Immediate" | "Expected" | "Future"
  certainty: string              // "Observed" | "Likely" | "Possible"
  areaDesc: string
  effective: string              // ISO timestamp
  expires: string                // ISO timestamp
  source: string
  event: string                  // "Earthquake" | "Flood" | etc.
  affectedSchools: string[]      // Which registered schools are in the area
  cachedAt: Timestamp
}

/** Emergency contact — /emergencyContacts/{id} */
export type EmergencyContactDoc = {
  id?: string
  name: string
  designation: string
  phone: string
  email?: string
  category: "police" | "fire" | "ambulance" | "hospital" | "ndma" | "school" | "other"
  schoolId: string | "all"       // Specific school or global
  priority: number               // Display order
  createdAt?: Timestamp
}

/** Quiz attempt — /users/{uid}/quizAttempts/{attemptId} */
export type QuizAttemptDoc = {
  id?: string
  disasterType: string
  score: number
  totalQuestions: number
  timestamp: Timestamp
  moduleId?: string
  schoolId: string
  tier: Tier
}

// ============================================================
// CRUD HELPERS — Schools
// ============================================================

export async function getSchools(): Promise<SchoolDoc[]> {
  return withTimeout(
    (async () => {
      const snap = await getDocs(collection(db, COLLECTIONS.SCHOOLS))
      let schools = snap.empty ? [...SEED_SCHOOLS] : snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolDoc))
      
      // Aggregate real-time data from users collection
      try {
        const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS))
        const users = usersSnap.docs.map(d => d.data())
        
        schools = schools.map(school => {
          const schoolUsers = users.filter(u => u.schoolId === school.id)
          const students = schoolUsers.filter(u => u.role === "Student")
          const teachers = schoolUsers.filter(u => u.role === "Teacher")
          const totalXP = students.reduce((sum, u) => sum + (typeof u.totalXP === 'number' ? u.totalXP : 0), 0)
          
          const earnedCompliance = Math.min(100, Math.floor(totalXP / 50))
          
          return {
            ...school,
            stats: {
              ...school.stats,
              studentCount: students.length,
              teacherCount: teachers.length,
              complianceScore: Math.max(school.stats?.complianceScore || 0, earnedCompliance),
              rankingScore: totalXP
            }
          }
        })
      } catch (err) {
        console.warn("Failed to aggregate users for schools:", err)
      }

      return schools
    })(),
    SEED_SCHOOLS,
    3000
  )
}

export async function getSchoolById(schoolId: string): Promise<SchoolDoc | null> {
  const fallback = SEED_SCHOOLS.find(s => s.id === schoolId) || null
  return withTimeout(
    (async () => {
      const snap = await getDoc(doc(db, COLLECTIONS.SCHOOLS, schoolId))
      if (!snap.exists()) return fallback
      return { id: snap.id, ...snap.data() } as SchoolDoc
    })(),
    fallback,
    1500
  )
}

export async function updateSchoolStats(
  schoolId: string,
  stats: Partial<SchoolDoc["stats"]>
): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.SCHOOLS, schoolId)
    await updateDoc(ref, {
      ...Object.fromEntries(
        Object.entries(stats).map(([k, v]) => [`stats.${k}`, v])
      ),
      lastUpdated: serverTimestamp(),
    })
  } catch (e) {
    console.warn("Failed to update school stats in Firestore:", e)
  }
}

// ============================================================
// CRUD HELPERS — Drills
// ============================================================

export async function getSchoolDrills(
  schoolId: string,
  limitCount = 20
): Promise<DrillDoc[]> {
  return withTimeout(
    (async () => {
      const ref = collection(db, COLLECTIONS.drills(schoolId))
      const q = query(ref, orderBy("date", "desc"), limit(limitCount))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DrillDoc))
    })(),
    [],
    1500
  )
}

export async function addDrill(
  schoolId: string,
  drill: Omit<DrillDoc, "id" | "createdAt">
): Promise<string> {
  const ref = collection(db, COLLECTIONS.drills(schoolId))
  const docRef = await addDoc(ref, {
    ...drill,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateDrill(
  schoolId: string,
  drillId: string,
  data: Partial<DrillDoc>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.drills(schoolId), drillId)
  await updateDoc(ref, data)
}

// ============================================================
// CRUD HELPERS — Alerts
// ============================================================

export async function getAlerts(limitCount = 50): Promise<AlertDoc[]> {
  return withTimeout(
    (async () => {
      const ref = collection(db, COLLECTIONS.ALERTS)
      const q = query(ref, orderBy("sentAt", "desc"), limit(limitCount))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AlertDoc))
    })(),
    [],
    1500
  )
}

export async function sendAlert(
  alert: Omit<AlertDoc, "id" | "sentAt" | "readBy">
): Promise<string> {
  const ref = collection(db, COLLECTIONS.ALERTS)
  const docRef = await addDoc(ref, {
    ...alert,
    sentAt: serverTimestamp(),
    readBy: [],
  })
  return docRef.id
}

// ============================================================
// CRUD HELPERS — Quiz Attempts
// ============================================================

export async function logQuizAttempt(
  uid: string,
  attempt: Omit<QuizAttemptDoc, "id" | "timestamp">
): Promise<string> {
  const ref = collection(db, COLLECTIONS.quizAttempts(uid))
  const docRef = await addDoc(ref, {
    ...attempt,
    timestamp: serverTimestamp(),
  })
  return docRef.id
}

export async function getQuizAttempts(
  uid: string,
  limitCount = 20
): Promise<QuizAttemptDoc[]> {
  return withTimeout(
    (async () => {
      const ref = collection(db, COLLECTIONS.quizAttempts(uid))
      const q = query(ref, orderBy("timestamp", "desc"), limit(limitCount))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuizAttemptDoc))
    })(),
    [],
    1500
  )
}

// ============================================================
// CRUD HELPERS — Emergency Contacts
// ============================================================

export async function getEmergencyContacts(
  schoolId?: string
): Promise<EmergencyContactDoc[]> {
  return withTimeout(
    (async () => {
      const ref = collection(db, COLLECTIONS.EMERGENCY_CONTACTS)
      const constraints: QueryConstraint[] = [orderBy("priority", "asc")]
      if (schoolId) {
        constraints.push(where("schoolId", "in", [schoolId, "all"]))
      }
      const q = query(ref, ...constraints)
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyContactDoc))
    })(),
    [],
    1500
  )
}

export async function addEmergencyContact(
  contact: Omit<EmergencyContactDoc, "id" | "createdAt">
): Promise<string> {
  const ref = collection(db, COLLECTIONS.EMERGENCY_CONTACTS)
  const docRef = await addDoc(ref, {
    ...contact,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EMERGENCY_CONTACTS, contactId))
}

// ============================================================
// REAL-TIME LISTENERS
// ============================================================

/**
 * Subscribe to real-time school data changes
 */
export function subscribeToSchools(
  callback: (schools: SchoolDoc[]) => void
): () => void {
  const ref = collection(db, COLLECTIONS.SCHOOLS)
  return onSnapshot(ref, (snap) => {
    const schools = snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolDoc))
    callback(schools)
  })
}

/**
 * Subscribe to real-time alerts
 */
export function subscribeToAlerts(
  callback: (alerts: AlertDoc[]) => void,
  limitCount = 20
): () => void {
  const ref = collection(db, COLLECTIONS.ALERTS)
  const q = query(ref, orderBy("sentAt", "desc"), limit(limitCount))
  return onSnapshot(q, (snap) => {
    const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlertDoc))
    callback(alerts)
  })
}

// ============================================================
// SEED DATA — Initialize school docs if they don't exist
// ============================================================

export const SEED_SCHOOLS: SchoolDoc[] = [
  {
    id: "dps-rkpuram",
    name: "Delhi Public School, R.K. Puram",
    shortName: "DPS R.K. Puram",
    region: "North India",
    state: "Delhi",
    seismicZone: 4,
    floodZone: "Medium",
    coordinates: { lat: 28.5645, lng: 77.1773 },
    stats: {
      studentCount: 0, teacherCount: 0, avgScore: 0,
      drillsCompleted: 0, lastDrillDate: null,
      complianceScore: 0, moduleCompletionRate: 0,
      modulesCompletedOnTime: 0, modulesCompletedLate: 0, modulesMissed: 0, rankingScore: 0,
    },
    trend: "stable",
  },
  {
    id: "kv-bengaluru",
    name: "Kendriya Vidyalaya, Bengaluru",
    shortName: "KV Bengaluru",
    region: "South India",
    state: "Karnataka",
    seismicZone: 2,
    floodZone: "Medium",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    stats: {
      studentCount: 0, teacherCount: 0, avgScore: 0,
      drillsCompleted: 0, lastDrillDate: null,
      complianceScore: 0, moduleCompletionRate: 0,
      modulesCompletedOnTime: 0, modulesCompletedLate: 0, modulesMissed: 0, rankingScore: 0,
    },
    trend: "stable",
  },
  {
    id: "stx-mumbai",
    name: "St. Xavier's High School, Mumbai",
    shortName: "St. Xavier's Mumbai",
    region: "West India",
    state: "Maharashtra",
    seismicZone: 3,
    floodZone: "High",
    coordinates: { lat: 18.9432, lng: 72.8308 },
    stats: {
      studentCount: 0, teacherCount: 0, avgScore: 0,
      drillsCompleted: 0, lastDrillDate: null,
      complianceScore: 0, moduleCompletionRate: 0,
      modulesCompletedOnTime: 0, modulesCompletedLate: 0, modulesMissed: 0, rankingScore: 0,
    },
    trend: "stable",
  },
]

/**
 * Seed school documents into Firestore (only if they don't exist)
 * Call this from admin dashboard or a setup script
 */
export async function seedSchools(): Promise<void> {
  try {
    for (const school of SEED_SCHOOLS) {
      const ref = doc(db, COLLECTIONS.SCHOOLS, school.id)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          ...school,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        })
      }
    }
  } catch (err) {
    console.warn("seedSchools notice (proceeding):", err)
  }
}
