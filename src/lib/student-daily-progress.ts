// Student Daily Module Progress — Day-by-day video tracking + final quiz
//
// Flow per student per assignment:
//   Day 1: Watch Video 1 → Day 2: Watch Video 2 (calendar-day gated) → ... → Day 5 → Quiz
//
// Firestore path: /users/{uid}/moduleProgress/{assignmentId}

import {
  doc, getDoc, setDoc, updateDoc, getDocs,
  collection, query, where, serverTimestamp, Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { withTimeout } from "@/lib/async-utils"

// ============================================================
// TYPES
// ============================================================

export type VideoWatchRecord = {
  watchedAt: string   // ISO timestamp string
}

export type QuizResult = {
  passed: boolean
  score: number       // 0-100
  attempts: number
  completedAt: string | null  // ISO timestamp
}

export type StudentModuleProgress = {
  assignmentId: string
  moduleId: string
  schoolId: string
  startedAt: string                   // ISO timestamp
  videosWatched: Record<number, VideoWatchRecord>  // key: dayNumber (1-5)
  currentDay: number                  // Which day they're on (1-5)
  lastVideoWatchedDate: string        // ISO date "2026-06-30" for calendar gating
  allVideosCompleted: boolean
  quizUnlocked: boolean
  quizResult: QuizResult | null
  status: "not_started" | "in_progress" | "completed"
  completedAt: string | null
}

// ============================================================
// COLLECTION PATH
// ============================================================

function progressCol(uid: string) {
  return `users/${uid}/moduleProgress`
}

// ============================================================
// HELPERS
// ============================================================

function todayDateString(): string {
  return new Date().toISOString().split("T")[0]
}

function nowISO(): string {
  return new Date().toISOString()
}

// ============================================================
// READ
// ============================================================

/** Get progress for a specific student and assignment */
export async function getStudentModuleProgress(
  uid: string,
  assignmentId: string
): Promise<StudentModuleProgress | null> {
  return withTimeout(
    (async () => {
      const ref = doc(db, progressCol(uid), assignmentId)
      const snap = await getDoc(ref)
      if (!snap.exists()) return null
      return snap.data() as StudentModuleProgress
    })(),
    null,
    1500
  )
}

/** Get the active assignment progress for a student (most recent in_progress or not_started) */
export async function getActiveStudentProgress(
  uid: string
): Promise<StudentModuleProgress | null> {
  return withTimeout(
    (async () => {
      const ref = collection(db, progressCol(uid))
      const snap = await getDocs(ref)

      const progresses = snap.docs
        .map(d => d.data() as StudentModuleProgress)
        .filter(p => p.status !== "completed")

      // Return the most recent non-completed one
      if (progresses.length === 0) return null
      return progresses[0]
    })(),
    null,
    1500
  )
}

/** Get all module progress for a student */
export async function getAllStudentProgress(
  uid: string
): Promise<StudentModuleProgress[]> {
  return withTimeout(
    (async () => {
      const ref = collection(db, progressCol(uid))
      const snap = await getDocs(ref)
      return snap.docs.map(d => d.data() as StudentModuleProgress)
    })(),
    [],
    1500
  )
}

// ============================================================
// CREATE / INITIALIZE
// ============================================================

/**
 * Initialize progress for a student when they first access an assigned module.
 * Called when a student opens a released module for the first time.
 */
export async function initializeStudentProgress(
  uid: string,
  assignmentId: string,
  moduleId: string,
  schoolId: string
): Promise<StudentModuleProgress> {
  const existing = await getStudentModuleProgress(uid, assignmentId)
  if (existing) return existing

  const progress: StudentModuleProgress = {
    assignmentId,
    moduleId,
    schoolId,
    startedAt: nowISO(),
    videosWatched: {},
    currentDay: 1,
    lastVideoWatchedDate: "",
    allVideosCompleted: false,
    quizUnlocked: false,
    quizResult: null,
    status: "not_started",
    completedAt: null,
  }

  await setDoc(doc(db, progressCol(uid), assignmentId), progress)
  return progress
}

// ============================================================
// VIDEO TRACKING
// ============================================================

/**
 * Check if the next video day is available based on calendar-day gating.
 * Student can watch the next video only on the next calendar day.
 */
export function isNextVideoUnlocked(progress: StudentModuleProgress): boolean {
  if (progress.allVideosCompleted) return false

  const totalVideos = 5
  if (progress.currentDay > totalVideos) return false

  // First video is always available
  if (Object.keys(progress.videosWatched).length === 0) return true

  // Check calendar-day gate
  const today = todayDateString()
  const lastWatched = progress.lastVideoWatchedDate

  // Can watch next video if today is after the last watched date
  return today > lastWatched
}

/**
 * Get the current video day number that the student should watch.
 * Returns 0 if all videos are done, or -1 if next video isn't unlocked yet.
 */
export function getCurrentVideoDay(progress: StudentModuleProgress): number {
  if (progress.allVideosCompleted) return 0

  const watchedDays = Object.keys(progress.videosWatched).map(Number)

  // Find the next unwatched day
  for (let day = 1; day <= 5; day++) {
    if (!watchedDays.includes(day)) {
      // Check if this day is unlocked
      if (day === 1) return 1  // Day 1 always available
      if (isNextVideoUnlocked(progress)) return day
      return -1  // Not yet unlocked (calendar gate)
    }
  }

  return 0  // All done
}

/**
 * Mark a video as watched for a specific day.
 * Advances currentDay and checks if all videos are completed.
 */
export async function markVideoWatched(
  uid: string,
  assignmentId: string,
  dayNumber: number
): Promise<StudentModuleProgress> {
  const progress = await getStudentModuleProgress(uid, assignmentId)
  if (!progress) throw new Error("No progress found for this assignment")

  // Don't re-watch
  if (progress.videosWatched[dayNumber]) return progress

  // Record the watch
  const today = todayDateString()
  progress.videosWatched[dayNumber] = {
    watchedAt: nowISO(),
  }
  progress.lastVideoWatchedDate = today
  progress.currentDay = dayNumber + 1
  progress.status = "in_progress"

  // Check if all 5 videos are watched
  const watchedCount = Object.keys(progress.videosWatched).length
  if (watchedCount >= 5) {
    progress.allVideosCompleted = true
    progress.quizUnlocked = true
  }

  await updateDoc(doc(db, progressCol(uid), assignmentId), {
    [`videosWatched.${dayNumber}`]: progress.videosWatched[dayNumber],
    lastVideoWatchedDate: today,
    currentDay: progress.currentDay,
    status: progress.status,
    allVideosCompleted: progress.allVideosCompleted,
    quizUnlocked: progress.quizUnlocked,
  })

  return progress
}

// ============================================================
// QUIZ TRACKING
// ============================================================

/**
 * Record a quiz attempt result.
 * If passed, marks the entire module as completed.
 */
export async function submitQuizResult(
  uid: string,
  assignmentId: string,
  score: number,
  passed: boolean
): Promise<StudentModuleProgress> {
  const progress = await getStudentModuleProgress(uid, assignmentId)
  if (!progress) throw new Error("No progress found for this assignment")
  if (!progress.quizUnlocked) throw new Error("Quiz is not unlocked yet")

  const existingAttempts = progress.quizResult?.attempts || 0

  const quizResult: QuizResult = {
    passed,
    score,
    attempts: existingAttempts + 1,
    completedAt: passed ? nowISO() : null,
  }

  const updates: Record<string, any> = {
    quizResult,
  }

  if (passed) {
    updates.status = "completed"
    updates.completedAt = nowISO()
  }

  await updateDoc(doc(db, progressCol(uid), assignmentId), updates)

  return {
    ...progress,
    quizResult,
    status: passed ? "completed" : progress.status,
    completedAt: passed ? nowISO() : progress.completedAt,
  }
}

// ============================================================
// AGGREGATION (for teacher/admin views)
// ============================================================

/**
 * Get video progress summary for display.
 * Returns an array of { day, watched, watchedAt, available } for days 1-5.
 */
export function getVideoProgressSummary(progress: StudentModuleProgress | null): Array<{
  day: number
  watched: boolean
  watchedAt: string | null
  available: boolean
}> {
  const result = []
  for (let day = 1; day <= 5; day++) {
    const record = progress?.videosWatched?.[day]
    const watched = !!record

    let available = false
    if (!progress) {
      available = day === 1  // Only day 1 if no progress
    } else if (watched) {
      available = true
    } else if (day === 1) {
      available = true
    } else {
      // Previous day must be watched + calendar day gate
      const prevWatched = !!progress.videosWatched?.[day - 1]
      if (prevWatched) {
        const today = todayDateString()
        available = today > progress.lastVideoWatchedDate
      }
    }

    result.push({
      day,
      watched,
      watchedAt: record?.watchedAt || null,
      available: available && !watched,
    })
  }
  return result
}
