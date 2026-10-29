// Module Assignment Pipeline — Firestore CRUD
// Flow: Admin assigns module → Schools receive → Teacher releases → Students learn
//
// Collections:
//   /moduleAssignments/{assignmentId}           — The assignment itself
//   /moduleAssignments/{id}/schoolStatus/{sid}   — Per-school status

import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, Timestamp, runTransaction, onSnapshot,
  type DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getSchoolAnalytics, type SchoolStat } from "@/lib/school-stats-client"
import { type Tier } from "@/lib/school-codes"
import { type Module, getModuleById } from "@/lib/modules-data"
import { SEED_SCHOOLS } from "@/lib/firestore-collections"

// ============================================================
// TYPES
// ============================================================

/** Admin-created module assignment — /moduleAssignments/{id} */
export type ModuleAssignment = {
  id: string
  moduleId: string
  moduleName: string
  moduleIcon: string
  tier: Tier
  assignedBy: string
  assignedByName: string
  assignedAt: Timestamp
  deadlineAt: Timestamp
  targetSchools: string[]        // ["all"] or specific school IDs
  status: "active" | "expired" | "completed"
  reassignedFrom?: string        // Previous assignment ID if reassigned
}

/** Per-school status within an assignment */
export type SchoolAssignmentStatus = {
  schoolId: string
  schoolName: string
  status: "pending" | "released" | "completed" | "overdue"
  releasedBy: string | null
  releasedByName: string | null
  releasedAt: Timestamp | null
  completionRate: number
  studentsCompleted: number
  totalStudents: number
  completedAt: Timestamp | null
}

// ============================================================
// COLLECTION PATHS
// ============================================================

const ASSIGNMENTS_COL = "moduleAssignments"

function schoolStatusCol(assignmentId: string) {
  return `${ASSIGNMENTS_COL}/${assignmentId}/schoolStatus`
}

// ============================================================
// ADMIN: CREATE ASSIGNMENT
// ============================================================

/**
 * Admin creates a new module assignment for schools.
 * Creates the assignment doc + schoolStatus sub-docs for each target school.
 */
export async function createModuleAssignment(
  module: Module,
  targetSchoolIds: string[],        // ["all"] or specific IDs
  adminUid: string,
  adminName: string,
  reassignedFrom?: string
): Promise<string> {
  const now = new Date()
  const deadline = new Date(now)
  deadline.setDate(deadline.getDate() + 5)
  deadline.setHours(23, 59, 59, 999)

  // Resolve "all" to actual school IDs
  const resolvedSchools = targetSchoolIds.includes("all")
    ? SEED_SCHOOLS.map(s => s.id)
    : targetSchoolIds

  // Create main assignment document
  const assignmentRef = await addDoc(collection(db, ASSIGNMENTS_COL), {
    moduleId: module.id,
    moduleName: module.title,
    moduleIcon: module.icon,
    tier: module.tier,
    assignedBy: adminUid,
    assignedByName: adminName,
    assignedAt: serverTimestamp(),
    deadlineAt: Timestamp.fromDate(deadline),
    targetSchools: targetSchoolIds,
    status: "active",
    ...(reassignedFrom ? { reassignedFrom } : {}),
  })

  // Create schoolStatus sub-doc for each school
  for (const schoolId of resolvedSchools) {
    const school = SEED_SCHOOLS.find(s => s.id === schoolId)
    await setDoc(
      doc(db, schoolStatusCol(assignmentRef.id), schoolId),
      {
        schoolId,
        schoolName: school?.shortName || schoolId,
        status: "pending",
        releasedBy: null,
        releasedByName: null,
        releasedAt: null,
        completionRate: 0,
        studentsCompleted: 0,
        totalStudents: 0,
        completedAt: null,
      }
    )
  }

  return assignmentRef.id
}

import { withTimeout } from "@/lib/async-utils"

// ============================================================
// READ: GET ASSIGNMENTS
// ============================================================

/** Get all assignments (optionally filtered by status) */
export async function getAssignments(
  statusFilter?: "active" | "expired" | "completed"
): Promise<ModuleAssignment[]> {
  return withTimeout(
    (async () => {
      const ref = collection(db, ASSIGNMENTS_COL)
      const q = statusFilter
        ? query(ref, where("status", "==", statusFilter), orderBy("assignedAt", "desc"))
        : query(ref, orderBy("assignedAt", "desc"))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ModuleAssignment))
    })(),
    [],
    1500
  )
}

const isPastDeadline = (a: ModuleAssignment) =>
  (a.deadlineAt?.toDate?.().getTime() ?? Infinity) < Date.now()

/** Get assignments targeting a specific school (active, deadline not passed) */
export async function getActiveAssignmentsForSchool(
  schoolId: string
): Promise<ModuleAssignment[]> {
  try {
    const all = await getAssignments("active")
    return all.filter(
      a => !isPastDeadline(a) && (a.targetSchools.includes("all") || a.targetSchools.includes(schoolId))
    )
  } catch {
    return []
  }
}

/** Get school status for a specific assignment */
export async function getSchoolStatuses(
  assignmentId: string
): Promise<SchoolAssignmentStatus[]> {
  return withTimeout(
    (async () => {
      const ref = collection(db, schoolStatusCol(assignmentId))
      const snap = await getDocs(ref)
      return snap.docs.map(d => d.data() as SchoolAssignmentStatus)
    })(),
    [],
    1500
  )
}

/** Get a specific school's status for an assignment */
export async function getSchoolStatus(
  assignmentId: string,
  schoolId: string
): Promise<SchoolAssignmentStatus | null> {
  return withTimeout(
    (async () => {
      const ref = doc(db, schoolStatusCol(assignmentId), schoolId)
      const snap = await getDoc(ref)
      if (!snap.exists()) return null
      return snap.data() as SchoolAssignmentStatus
    })(),
    null,
    1500
  )
}

// ============================================================
// TEACHER: RELEASE MODULE TO STUDENTS
// ============================================================

/**
 * Teacher releases the assigned module to their students.
 * After this, students at this school can see and start the module.
 */
export async function releaseModuleToStudents(
  assignmentId: string,
  schoolId: string,
  teacherUid: string,
  teacherName: string
): Promise<{ released: boolean; releasedByName: string | null }> {
  const ref = doc(db, schoolStatusCol(assignmentId), schoolId)
  // Transaction: if two teachers click at once, only the first commit wins; the other retries, sees "released" and backs off.
  return runTransaction(db, async tx => {
    const snap = await tx.get(ref)
    const cur = snap.data() as SchoolAssignmentStatus | undefined
    if (!cur || cur.status !== "pending") {
      return { released: false, releasedByName: cur?.releasedByName ?? null }
    }
    tx.update(ref, {
      status: "released",
      releasedBy: teacherUid,
      releasedByName: teacherName,
      releasedAt: serverTimestamp(),
    })
    return { released: true, releasedByName: teacherName }
  })
}

/** Live status of one school's assignment — lets other teachers' screens update the moment someone releases it */
export function subscribeSchoolStatus(
  assignmentId: string,
  schoolId: string,
  cb: (status: SchoolAssignmentStatus | null) => void
): () => void {
  return onSnapshot(
    doc(db, schoolStatusCol(assignmentId), schoolId),
    snap => cb(snap.exists() ? (snap.data() as SchoolAssignmentStatus) : null),
    () => {} // ignore listener errors; the transaction still guards the write
  )
}

// ============================================================
// PROGRESS TRACKING
// ============================================================

/** Update completion stats for a school */
export async function updateSchoolCompletionStats(
  assignmentId: string,
  schoolId: string,
  studentsCompleted: number,
  totalStudents: number
): Promise<void> {
  const ref = doc(db, schoolStatusCol(assignmentId), schoolId)
  const completionRate = totalStudents > 0
    ? Math.round((studentsCompleted / totalStudents) * 100)
    : 0

  const updates: Record<string, any> = {
    studentsCompleted,
    totalStudents,
    completionRate,
  }

  // If all completed, mark status
  if (studentsCompleted >= totalStudents && totalStudents > 0) {
    updates.status = "completed"
    updates.completedAt = serverTimestamp()
  }

  await updateDoc(ref, updates)
}

// ============================================================
// OVERDUE & REASSIGNMENT
// ============================================================

/** Get schools that are past the deadline and haven't completed */
export async function getOverdueSchools(
  assignmentId: string
): Promise<SchoolAssignmentStatus[]> {
  const statuses = await getSchoolStatuses(assignmentId)
  return statuses.filter(s => s.status !== "completed")
}

/** Mark expired assignments — call this periodically or on page load */
export async function checkAndExpireAssignments(): Promise<void> {
  const activeAssignments = await getAssignments("active")
  const now = new Date()

  for (const assignment of activeAssignments) {
    const deadline = assignment.deadlineAt.toDate()
    if (now > deadline) {
      // Mark assignment as expired
      await updateDoc(doc(db, ASSIGNMENTS_COL, assignment.id), {
        status: "expired",
      })

      // Mark non-completed schools as overdue
      const statuses = await getSchoolStatuses(assignment.id)
      for (const status of statuses) {
        if (status.status !== "completed") {
          await updateDoc(
            doc(db, schoolStatusCol(assignment.id), status.schoolId),
            { status: "overdue" }
          )
        }
      }
    }
  }
}

/** Reassign module to specific schools that missed the deadline */
export async function reassignModule(
  moduleId: string,
  schoolIds: string[],
  adminUid: string,
  adminName: string,
  previousAssignmentId: string
): Promise<string> {
  const module = getModuleById(moduleId)
  if (!module) throw new Error(`Module ${moduleId} not found`)

  return createModuleAssignment(
    module,
    schoolIds,
    adminUid,
    adminName,
    previousAssignmentId
  )
}

// ============================================================
// RANKINGS
// ============================================================

/**
 * Ranking data for all schools, best first. Calculated on the server (/api/school-stats) because the
 * browser can't read other students' progress. Score = 75% module completion + 25% XP progress
 * (XP only until the first assignment finishes), averaged over ALL students at the school.
 */
export async function getAllSchoolRankings(): Promise<SchoolStat[]> {
  return (await getSchoolAnalytics()).schools
}
