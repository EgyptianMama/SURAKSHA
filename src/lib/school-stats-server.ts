// Server-side school statistics (Firebase Admin SDK).
// Rankings, the admin dashboard card and the Analytics page all read from here, so they always agree.
// It runs on the server because Firestore rules (rightly) stop a browser reading other students' progress.

import { getAdminFirestore } from "@/lib/firebase-admin"
import { SEED_SCHOOLS } from "@/lib/firestore-collections"
import { getModuleCategory } from "@/lib/modules-data"

const XP_TARGET = 500 // average XP per student that counts as 100%

export type SchoolStat = {
  schoolId: string
  schoolName: string
  region: string
  score: number              // preparedness %, 0-100
  modulePct: number | null   // null until an assignment has finished
  xpPct: number
  avgXP: number
  students: number
  participation: number     // % of students who started at least one assigned module
  drillsCompleted: number
  drillParticipation: number // avg participation % of completed drills
  onTime: number
  late: number
  missed: number
  total: number
}

export type SchoolAnalytics = {
  schools: SchoolStat[]
  monthly: { month: string; videos: number; activePct: number }[]
  topics: { topic: string; count: number }[]
}

const toDate = (v: any): Date | null => (v?.toDate ? v.toDate() : v ? new Date(v) : null)
const watchedCount = (p: any) => Object.keys(p?.videosWatched || {}).length

export async function computeSchoolAnalytics(): Promise<SchoolAnalytics> {
  const db = getAdminFirestore()
  const [usersSnap, assignSnap, statusSnap, progSnap, drillSnap] = await Promise.all([
    db.collection("users").where("role", "==", "Student").get(),
    db.collection("moduleAssignments").get(),
    db.collectionGroup("schoolStatus").get(),
    db.collectionGroup("moduleProgress").get(),
    db.collectionGroup("drills").get(),
  ])

  const now = Date.now()
  const students = usersSnap.docs.map(d => ({ uid: d.id, schoolId: d.data().schoolId as string, xp: Number(d.data().totalXP) || 0 }))
  const assignments = assignSnap.docs.map(d => {
    const x = d.data()
    return { id: d.id, targets: (x.targetSchools || []) as string[], deadline: toDate(x.deadlineAt), status: x.status as string }
  })
  const statusOf = new Map<string, any>()
  statusSnap.forEach(d => statusOf.set(`${d.ref.parent.parent!.id}|${d.id}`, d.data()))

  const progress = new Map<string, Map<string, any>>() // uid -> assignmentId -> progress
  const allProgress: { uid: string; data: any }[] = []
  progSnap.forEach(d => {
    const uid = d.ref.parent.parent!.id
    if (!progress.has(uid)) progress.set(uid, new Map())
    progress.get(uid)!.set(d.id, d.data())
    allProgress.push({ uid, data: d.data() })
  })

  const schools: SchoolStat[] = SEED_SCHOOLS.map(school => {
    const mine = students.filter(s => s.schoolId === school.id)
    const n = mine.length
    const targeted = assignments.filter(a => a.targets.includes("all") || a.targets.includes(school.id))
    const pastDeadline = (a: { deadline: Date | null }) => !!a.deadline && a.deadline.getTime() < now

    // on-time / late / missed (school level)
    let onTime = 0, late = 0, missed = 0
    for (const a of targeted) {
      const st = statusOf.get(`${a.id}|${school.id}`)
      if (!st) { missed++; continue }
      if (st.status === "completed") {
        const done = toDate(st.completedAt)
        if (done && a.deadline && done > a.deadline) late++; else onTime++
      } else if (st.status === "overdue" || a.status === "expired" || pastDeadline(a)) missed++
    }

    // assignments that are over for this school are scored; in-progress ones are not yet
    const scored = targeted.filter(a => pastDeadline(a) || statusOf.get(`${a.id}|${school.id}`)?.status === "completed")

    let moduleSum = 0, xpSum = 0, participated = 0
    for (const s of mine) {
      xpSum += s.xp
      const mp = progress.get(s.uid)
      if (targeted.some(a => { const p = mp?.get(a.id); return !!p && (watchedCount(p) > 0 || !!p.quizResult) })) participated++
      if (scored.length === 0) continue
      let sum = 0
      for (const a of scored) {
        const p = mp?.get(a.id)
        if (!p) continue
        sum += 0.5 * (Math.min(5, watchedCount(p)) / 5) + 0.5 * ((p.quizResult?.score || 0) / 100)
      }
      moduleSum += sum / scored.length
    }

    const xpPct = n > 0 ? Math.min(1, xpSum / n / XP_TARGET) * 100 : 0
    const modulePct = n > 0 && scored.length > 0 ? (moduleSum / n) * 100 : null
    const score = Math.round(modulePct === null ? xpPct : modulePct * 0.75 + xpPct * 0.25)

    const completedDrills = drillSnap.docs.filter(d => d.ref.parent.parent!.id === school.id && d.data().status === "completed")
    const drillParticipation = completedDrills.length
      ? Math.round(completedDrills.reduce((sum, d) => sum + (Number(d.data().participationRate) || 0), 0) / completedDrills.length)
      : 0

    return {
      schoolId: school.id, schoolName: school.shortName, region: school.region,
      score, modulePct: modulePct === null ? null : Math.round(modulePct), xpPct: Math.round(xpPct),
      avgXP: n > 0 ? Math.round(xpSum / n) : 0, students: n,
      participation: n > 0 ? Math.round((participated / n) * 100) : 0,
      drillsCompleted: completedDrills.length, drillParticipation,
      onTime, late, missed, total: targeted.length,
    }
  }).sort((a, b) => b.score - a.score)

  // last 6 months of learning activity (videos watched, share of students active)
  const months: { key: string; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en", { month: "short" }) })
  }
  const videos: Record<string, number> = {}
  const active: Record<string, Set<string>> = {}
  const topicCount: Record<string, number> = {}
  for (const { uid, data } of allProgress) {
    const topic = getModuleCategory(data.moduleId)
    topicCount[topic] = (topicCount[topic] || 0) + watchedCount(data) + (data.quizResult?.passed ? 1 : 0)
    for (const w of Object.values<any>(data.videosWatched || {})) {
      const key = String(w?.watchedAt || "").slice(0, 7)
      if (!key) continue
      videos[key] = (videos[key] || 0) + 1
      ;(active[key] ||= new Set()).add(uid)
    }
  }
  const totalStudents = students.length
  const monthly = months.map(m => ({
    month: m.label,
    videos: videos[m.key] || 0,
    activePct: totalStudents > 0 ? Math.round(((active[m.key]?.size || 0) / totalStudents) * 100) : 0,
  }))
  const topics = Object.entries(topicCount).filter(([, c]) => c > 0).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count)

  return { schools, monthly, topics }
}
