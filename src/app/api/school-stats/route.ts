import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-auth"
import { computeSchoolAnalytics } from "@/lib/school-stats-server"

// Aggregate school stats for Rankings / Admin dashboard / Analytics. Any signed-in user; aggregates only, no student-level data.
export const GET = withAuth(async () => {
  try {
    return NextResponse.json(await computeSchoolAnalytics())
  } catch (err) {
    console.error("school-stats failed:", err)
    return NextResponse.json({ error: "Failed to compute school stats" }, { status: 500 })
  }
})
