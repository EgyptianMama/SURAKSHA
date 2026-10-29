// Homework tracking system for SURAKSHA
// Tracks module assignments by teachers, student completion, and XP calculations
// Uses Firestore for persistence — this file defines types and helper functions

import { type Tier } from "@/lib/school-codes"
import { type Module, getModuleById } from "@/lib/modules-data"

// ============================================================
// TYPES — Firestore document shapes
// ============================================================

/**
 * A homework assignment created by a teacher for their school+tier
 * Firestore path: /schools/{schoolId}/homework/{homeworkId}
 */
export type HomeworkAssignment = {
  id: string
  moduleId: string              // Which module this homework is for
  moduleName: string            // Denormalized for quick display
  schoolId: string              // Which school
  tier: Tier                    // "primary" | "secondary"
  assignedBy: string            // Teacher UID who assigned it
  assignedByName: string        // Teacher display name
  assignedAt: Date              // When it was assigned
  deadlineAt: Date              // assignedAt + module.daysToComplete
  status: "active" | "expired"  // Expired after deadline passes
  order: number                 // Module order (for sequential tracking)
}

/**
 * A student's progress on a specific homework assignment
 * Firestore path: /users/{uid}/homeworkProgress/{homeworkId}
 */
export type HomeworkProgress = {
  homeworkId: string
  moduleId: string
  studentUid: string
  schoolId: string
  tier: Tier
  status: "pending" | "in_progress" | "completed" | "missed"
  startedAt: Date | null
  completedAt: Date | null
  score: number                 // Quiz/activity score (0-100)
  xpEarned: number              // After penalty calculation
  xpPossible: number            // Max XP without penalty
  daysLate: number              // 0 if on time, >0 if late
}

// ============================================================
// XP CALCULATION
// ============================================================

/**
 * Calculate XP earned based on completion time vs deadline
 *
 * Rules:
 * - On time (completedAt <= deadlineAt): Full XP
 * - Late: Deduct latePenaltyPerDay for each day late
 * - Minimum XP: 0 (can't go negative)
 *
 * @example
 * Module: { xpReward: 100, latePenaltyPerDay: 20 }
 * Completed 2 days late → 100 - (2 * 20) = 60 XP
 * Completed 6 days late → 100 - (6 * 20) = max(0, -20) = 0 XP
 */
export function calculateXP(
  module: Module,
  completedAt: Date,
  deadlineAt: Date
): { xpEarned: number; daysLate: number } {
  const completedTime = completedAt.getTime()
  const deadlineTime = deadlineAt.getTime()

  if (completedTime <= deadlineTime) {
    // On time — full XP
    return { xpEarned: module.xpReward, daysLate: 0 }
  }

  // Late — calculate penalty
  const msLate = completedTime - deadlineTime
  const daysLate = Math.ceil(msLate / (1000 * 60 * 60 * 24))
  const penalty = daysLate * module.latePenaltyPerDay
  const xpEarned = Math.max(0, module.xpReward - penalty)

  return { xpEarned, daysLate }
}

/**
 * Check if a homework assignment is past its deadline
 */
export function isHomeworkLate(deadlineAt: Date): boolean {
  return new Date() > deadlineAt
}

/**
 * Check if a homework assignment is still active (within deadline)
 */
export function isHomeworkActive(deadlineAt: Date): boolean {
  return new Date() <= deadlineAt
}

/**
 * Calculate how many days remain until deadline
 * Returns negative number if past deadline
 */
export function getDaysRemaining(deadlineAt: Date): number {
  const now = new Date()
  const diff = deadlineAt.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Get a human-readable deadline status
 */
export function getDeadlineStatus(deadlineAt: Date): {
  label: string
  color: "green" | "yellow" | "red" | "gray"
  urgent: boolean
} {
  const daysLeft = getDaysRemaining(deadlineAt)

  if (daysLeft < 0) {
    return {
      label: `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`,
      color: "red",
      urgent: true,
    }
  }

  if (daysLeft === 0) {
    return { label: "Due today!", color: "red", urgent: true }
  }

  if (daysLeft === 1) {
    return { label: "Due tomorrow", color: "yellow", urgent: true }
  }

  if (daysLeft <= 2) {
    return { label: `${daysLeft} days left`, color: "yellow", urgent: false }
  }

  return { label: `${daysLeft} days left`, color: "green", urgent: false }
}

// ============================================================
// ASSIGNMENT CREATION HELPERS
// ============================================================

/**
 * Create a deadline date from assignment date and module's daysToComplete
 */
export function createDeadline(assignedAt: Date, daysToComplete: number): Date {
  const deadline = new Date(assignedAt)
  deadline.setDate(deadline.getDate() + daysToComplete)
  // Set to end of day (23:59:59)
  deadline.setHours(23, 59, 59, 999)
  return deadline
}

/**
 * Create a HomeworkAssignment object (for Firestore write)
 */
export function createHomeworkAssignment(
  module: Module,
  schoolId: string,
  teacherUid: string,
  teacherName: string
): Omit<HomeworkAssignment, "id"> {
  const now = new Date()
  return {
    moduleId: module.id,
    moduleName: module.title,
    schoolId,
    tier: module.tier,
    assignedBy: teacherUid,
    assignedByName: teacherName,
    assignedAt: now,
    deadlineAt: createDeadline(now, module.daysToComplete),
    status: "active",
    order: module.order,
  }
}

/**
 * Create initial HomeworkProgress for a student
 */
export function createHomeworkProgress(
  homeworkId: string,
  moduleId: string,
  studentUid: string,
  schoolId: string,
  tier: Tier,
  xpPossible: number
): HomeworkProgress {
  return {
    homeworkId,
    moduleId,
    studentUid,
    schoolId,
    tier,
    status: "pending",
    startedAt: null,
    completedAt: null,
    score: 0,
    xpEarned: 0,
    xpPossible,
    daysLate: 0,
  }
}

// ============================================================
// STUDENT LEVEL SYSTEM
// ============================================================

type StudentLevel = {
  level: number
  title: string
  minXP: number
  maxXP: number
  emoji: string
}

export const STUDENT_LEVELS: StudentLevel[] = [
  { level: 1, title: "Novice", minXP: 0, maxXP: 199, emoji: "🌱" },
  { level: 2, title: "Explorer", minXP: 200, maxXP: 449, emoji: "🔍" },
  { level: 3, title: "Protector", minXP: 450, maxXP: 749, emoji: "🛡️" },
  { level: 4, title: "Guardian", minXP: 750, maxXP: 1099, emoji: "⚔️" },
  { level: 5, title: "Safety Hero", minXP: 1100, maxXP: Infinity, emoji: "🏆" },
]

/**
 * Get student's current level based on total XP
 */
export function getStudentLevel(totalXP: number): StudentLevel {
  for (let i = STUDENT_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= STUDENT_LEVELS[i].minXP) {
      return STUDENT_LEVELS[i]
    }
  }
  return STUDENT_LEVELS[0]
}

/**
 * Get XP progress within current level (for progress bar)
 */
export function getLevelProgress(totalXP: number): {
  currentXP: number
  neededXP: number
  percentage: number
} {
  const level = getStudentLevel(totalXP)
  const nextLevel = STUDENT_LEVELS.find(l => l.level === level.level + 1)

  if (!nextLevel) {
    // Max level
    return { currentXP: totalXP, neededXP: totalXP, percentage: 100 }
  }

  const xpInLevel = totalXP - level.minXP
  const xpNeeded = nextLevel.minXP - level.minXP

  return {
    currentXP: xpInLevel,
    neededXP: xpNeeded,
    percentage: Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)),
  }
}
