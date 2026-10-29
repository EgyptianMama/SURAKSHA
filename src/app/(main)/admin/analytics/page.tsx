"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3, Users, Target, TrendingUp, Zap, Shield, Activity,
  Lightbulb, School, Clock, CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import { useState, useEffect } from "react"
import { getSchoolAnalytics, type SchoolAnalytics } from "@/lib/school-stats-client"

const CHART_COLORS = [
  "hsl(222, 65%, 38%)",
  "hsl(160, 55%, 42%)",
  "hsl(28, 92%, 52%)",
  "hsl(262, 52%, 52%)",
  "hsl(340, 65%, 52%)",
]

function StatCard({ label, value, icon: Icon, color, bg, suffix = "" }: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; suffix?: string
}) {
  return (
    <Card className="card-hover border-0 shadow-sm overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("p-2.5 rounded-xl", bg)}>
            <Icon className={cn("size-5", color)} />
          </div>
        </div>
        <p className="text-3xl font-headline font-bold animate-count-up">{value}{suffix}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

function PreparednessGauge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 70) return { ring: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/30", label: "Good" }
    if (score >= 40) return { ring: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/30", label: "Moderate" }
    return { ring: "text-red-500", bg: "bg-red-100 dark:bg-red-950/30", label: "Needs Improvement" }
  }
  const config = getColor()
  const circumference = 2 * Math.PI * 52
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            className={config.ring}
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-headline font-bold">{score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      <Badge className={cn("mt-2 text-xs", config.bg, config.ring.replace("text-", "text-"))} variant="secondary">
        {config.label}
      </Badge>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<SchoolAnalytics | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getSchoolAnalytics().then(setData).catch(() => setError(true))
  }, [])

  const schools = data?.schools ?? []
  const avg = (vals: number[]) => (vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0)
  const totalStudents = schools.reduce((sum, s) => sum + s.students, 0)
  const avgScore = avg(schools.map(s => s.score))
  const totalDrills = schools.reduce((sum, s) => sum + s.drillsCompleted, 0)
  const avgParticipation = avg(schools.map(s => s.participation))
  const monthlyTrendData = data?.monthly ?? []
  const pieData = (data?.topics ?? []).map(t => ({ name: t.topic, value: t.count }))
  const schoolBarData = schools.map(s => ({ name: s.schoolName, participation: s.drillParticipation }))

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero-navy p-6 md:p-8 animate-fade-up pattern-dots-light">
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <BarChart3 className="size-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">Analytics Dashboard</h1>
            <p className="text-white/70 text-sm mt-0.5">Live preparedness, module participation, drills and learning activity</p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">Couldn&apos;t load analytics. Please refresh.</p>}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up" style={{ "--delay": "100ms" } as React.CSSProperties}>
        <StatCard label="Total Students" value={totalStudents} icon={Users} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/30" />
        <StatCard label="Avg Preparedness" value={avgScore} icon={Target} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/30" suffix="%" />
        <StatCard label="Total Drills" value={totalDrills} icon={Shield} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-950/30" />
        <StatCard label="Module Participation" value={avgParticipation} icon={TrendingUp} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/30" suffix="%" />
      </div>

      {/* Row: Gauge + Trend Line */}
      <div className="grid gap-6 lg:grid-cols-3 animate-fade-up" style={{ "--delay": "200ms" } as React.CSSProperties}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Target className="size-4 text-primary" />
              </div>
              Overall Preparedness
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <PreparednessGauge score={avgScore} />
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TrendingUp className="size-4 text-primary" />
              </div>
              Learning Activity (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="pct" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} unit="%" />
                <YAxis yAxisId="count" orientation="right" allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line yAxisId="pct" type="monotone" dataKey="activePct" stroke="hsl(222, 65%, 38%)" strokeWidth={2.5} dot={{ fill: "hsl(222, 65%, 38%)", r: 4 }} name="Active students %" />
                <Line yAxisId="count" type="monotone" dataKey="videos" stroke="hsl(28, 92%, 52%)" strokeWidth={2.5} dot={{ fill: "hsl(28, 92%, 52%)", r: 4 }} name="Videos watched" />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row: Participation Bar + Pie Chart */}
      <div className="grid gap-6 lg:grid-cols-2 animate-fade-up" style={{ "--delay": "300ms" } as React.CSSProperties}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <School className="size-4 text-primary" />
              </div>
              Avg Drill Participation by School
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={schoolBarData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--foreground))" width={100} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="participation" fill="hsl(160, 55%, 42%)" radius={[0, 4, 4, 0]} barSize={24} name="Participation %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline text-base flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Activity className="size-4 text-primary" />
              </div>
              Learning Activity by Topic
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {pieData.length === 0 ? (
              <p className="py-24 text-sm text-muted-foreground">No module activity yet.</p>
            ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(var(--border))" }} />
                <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
