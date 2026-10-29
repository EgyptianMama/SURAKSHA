"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Award, RefreshCw } from "lucide-react"
import { getAllSchoolRankings } from "@/lib/module-assignments"
import { cn } from "@/lib/utils"

const medalColors = [
  "from-amber-300 to-yellow-500", // Gold
  "from-slate-300 to-slate-400",  // Silver
  "from-amber-600 to-amber-800",  // Bronze
]

const medalEmoji = ["🥇", "🥈", "🥉"]

interface RankingSchool {
  schoolId: string
  schoolName: string
  region: string
  score: number
  onTime: number
  late: number
  missed: number
  total: number
  modulePct: number | null
  xpPct: number
  avgXP: number
  students: number
}

function PodiumCard({ school, rank }: { school: RankingSchool; rank: number }) {
  return (
    <Card className={cn(
      "card-hover overflow-hidden animate-fade-up text-center",
      rank === 0 && "ring-2 ring-amber-400 shadow-lg"
    )} style={{ "--delay": `${rank * 100}ms` } as React.CSSProperties}>
      <div className={cn("h-2 bg-gradient-to-r", medalColors[rank])} />
      <CardContent className="p-5 flex flex-col h-[280px]">
        <div className="text-4xl mb-2 animate-float" style={{ animationDelay: `${rank * 200}ms` }}>
          {medalEmoji[rank]}
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
          #{rank + 1} Rank
        </p>
        <h3 className="font-headline font-bold text-sm leading-tight flex-1">{school.schoolName}</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-2">{school.region}</p>
        
        <div className="bg-muted/30 p-2 rounded-xl mb-3 text-[10px] grid grid-cols-3 gap-1">
          <div><span className="text-emerald-600 font-bold">{school.onTime}</span><br/><span className="text-muted-foreground">On Time</span></div>
          <div className="border-x"><span className="text-amber-600 font-bold">{school.late}</span><br/><span className="text-muted-foreground">Late</span></div>
          <div><span className="text-red-500 font-bold">{school.missed}</span><br/><span className="text-muted-foreground">Missed</span></div>
        </div>
        
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-headline font-bold text-primary">{school.score}%</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 mb-1.5">Preparedness</p>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mx-4">
          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${school.score}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {school.students} students · avg {school.avgXP} XP
        </p>
      </CardContent>
    </Card>
  )
}

function ListCard({ school, rank }: { school: RankingSchool; rank: number }) {
  return (
    <Card className="animate-fade-up" style={{ "--delay": `${300 + rank * 50}ms` } as React.CSSProperties}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="font-bold text-muted-foreground w-6 text-center">#{rank + 1}</div>
          <div>
            <h3 className="font-headline font-bold text-sm leading-tight">{school.schoolName}</h3>
            <p className="text-xs text-muted-foreground">{school.region}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4 text-xs text-muted-foreground">
            <span className="text-emerald-600">{school.onTime} on-time</span>
            <span className="text-amber-600">{school.late} late</span>
            <span className="text-red-500">{school.missed} missed</span>
          </div>
          
          <div className="text-right w-20">
            <span className="text-xl font-headline font-bold text-primary">{school.score}%</span>
            <p className="text-[10px] text-muted-foreground">avg {school.avgXP} XP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RankingsPage() {
  const [rankedSchools, setRankedSchools] = useState<RankingSchool[]>([])
  const [loading, setLoading] = useState(true)
  const [totalAssignments, setTotalAssignments] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const rankings = await getAllSchoolRankings()
        setRankedSchools(rankings)
        const maxTotal = Math.max(...rankings.map(r => r.total), 0)
        setTotalAssignments(maxTotal)
      } catch (err) {
        console.error("Failed to load rankings", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-12"><RefreshCw className="size-8 animate-spin text-muted-foreground" /></div>
  }

  // If no assignments have been given out yet
  if (totalAssignments === 0) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-6 md:p-8">
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">School Safety Rankings</h1>
            </div>
          </div>
        </div>
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Trophy className="size-16 mb-4 opacity-50" />
            <p className="font-semibold text-xl text-foreground">No Rankings Yet</p>
            <p className="mt-2 max-w-md">Rankings will be dynamically calculated and appear here once the first module assignment cycle is complete.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-6 md:p-8 animate-fade-up">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Trophy className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">School Safety Rankings</h1>
            <p className="text-white/80 text-sm mt-0.5">Preparedness % = average across all students: module completion (75%) + XP progress (25%)</p>
          </div>
        </div>
        <div className="absolute top-4 right-8 opacity-15">
          <Award className="size-32 text-white animate-float-slow" />
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid gap-4 md:grid-cols-3">
        {rankedSchools.slice(0, 3).map((school, i) => (
          <PodiumCard key={school.schoolId} school={school} rank={i} />
        ))}
      </div>
      
      {/* The rest of the schools */}
      {rankedSchools.length > 3 && (
        <div className="mt-8 space-y-3">
          <h2 className="font-headline font-bold text-lg mb-4">Statewide Leaderboard</h2>
          {rankedSchools.slice(3).map((school, i) => (
            <ListCard key={school.schoolId} school={school} rank={i + 3} />
          ))}
        </div>
      )}
    </div>
  )
}
