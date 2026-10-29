// Browser helper for /api/school-stats (shared by Rankings, Admin dashboard and Analytics).
import { auth } from "@/lib/firebase"
import type { SchoolAnalytics } from "@/lib/school-stats-server"

export type { SchoolAnalytics, SchoolStat } from "@/lib/school-stats-server"

let cache: { at: number; promise: Promise<SchoolAnalytics> } | null = null

/** One request is shared by every caller for 20 seconds (the dashboard asks for it twice). */
export function getSchoolAnalytics(): Promise<SchoolAnalytics> {
  if (cache && Date.now() - cache.at < 20000) return cache.promise
  const promise = (async () => {
    const user = auth.currentUser
    if (!user) throw new Error("Not signed in")
    const res = await fetch("/api/school-stats", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } })
    if (!res.ok) throw new Error(`school-stats ${res.status}`)
    return (await res.json()) as SchoolAnalytics
  })()
  cache = { at: Date.now(), promise }
  promise.catch(() => { cache = null })
  return promise
}
