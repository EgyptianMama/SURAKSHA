"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Youtube, Cloudy, AlertTriangle, ClipboardCheck, MapPin,
  Gamepad2, Video, Puzzle, FilePenLine,
  Trophy, Zap,
  BarChart3, Users, School, TrendingUp, BookImage, AlertCircle, Shield,
  Clock, PlayCircle, Send, CheckCircle, RotateCcw
} from "lucide-react"
import { useAuth, resetAllScores } from "@/contexts/auth-context"
import { USER_ROLES } from "@/app/constants"
import { cn } from "@/lib/utils"
import { getTierEmoji, getTierLabel } from "@/lib/school-codes"
import { getSchools, getAlerts, seedSchools, SEED_SCHOOLS, getSchoolDrills, type DrillDoc } from "@/lib/firestore-collections"
import { subscribeToEmergencyAlerts, type EmergencyAlertDoc } from "@/lib/alerts-data"
import {
  getActiveAssignmentsForSchool, getSchoolStatus, releaseModuleToStudents, subscribeSchoolStatus, getAllSchoolRankings, type ModuleAssignment
} from "@/lib/module-assignments"
import { getModuleCategory } from "@/lib/modules-data"
import {
  getActiveStudentProgress, getStudentModuleProgress, type StudentModuleProgress, getVideoProgressSummary
} from "@/lib/student-daily-progress"
import { getUserProgress } from "@/lib/learning-data"
import { HeroBanner } from "@/components/layout/hero-banner"
import { BriefCard, ModuleCard } from "@/components/ui/brief-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "Live Disaster Alerts",
    description: "Real-time NDMA/SACHET alerts for your school's region.",
    href: "/disaster-alerts",
    icon: AlertTriangle,
    code: "ALR-002",
  },
  {
    title: "Training Library",
    description: "Curated emergency drill videos categorized by disaster type.",
    href: "/training",
    icon: Youtube,
    code: "TRN-003",
  },
  {
    title: "Assign Homework",
    description: "Assign modules to classes and track completion rates.",
    href: "/admin/homework",
    icon: BookImage,
    code: "HWK-004",
    adminOnly: true,
  },
  {
    title: "Safety Audit",
    description: "School safety assessment aligned with NDMA 2016 guidelines.",
    href: "/safety-audit",
    icon: ClipboardCheck,
    code: "AUD-005",
    adminOnly: true,
  },
  {
    title: "School Rankings",
    description: "Compare preparedness scores across institutions statewide.",
    href: "/rankings",
    icon: Trophy,
    code: "RNK-007",
  },
]

const studentModules = [
  {
    title: "Gamified Learning",
    description: "Interactive games and quizzes for hands-on response training.",
    href: "/gamified-learning",
    icon: Gamepad2,
    moduleCode: "MOD-C3",
    progress: 0,
  },
  {
    title: "Storytelling & Visuals",
    description: "Animated scenarios demonstrating correct disaster responses.",
    href: "/storytelling",
    icon: Video,
    moduleCode: "MOD-D4",
    progress: 0,
  },
  {
    title: "Creative Projects",
    description: "Design safety posters and campaigns for your school community.",
    href: "/creative-projects",
    icon: FilePenLine,
    moduleCode: "MOD-F6",
    progress: 0,
  },
]

/* ===== ADMIN DASHBOARD ===== */
function AdminDashboard({ name }: { name: string }) {
  const [stats, setStats] = useState<{
    schools: number
    students: number
    teachers: number
    avgPreparedness: number
    activeAlerts: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewFilter, setViewFilter] = useState<"all" | "alerts" | "curriculum">("all")

  useEffect(() => {
    let mounted = true

    async function fetchDashboardStats() {
      try {
        setLoading(true)
        setError(null)

        const [schools, alerts] = await Promise.all([
          getSchools().catch(() => SEED_SCHOOLS),
          getAlerts(50).catch(() => []),
        ])

        const effectiveSchools = (schools && schools.length > 0) ? schools : SEED_SCHOOLS
        const totalStudents = effectiveSchools.reduce((sum, s) => sum + (s.stats?.studentCount || 0), 0)
        const totalTeachers = effectiveSchools.reduce((sum, s) => sum + (s.stats?.teacherCount || 0), 0)
        // Same per-school preparedness % as the Rankings page, averaged across schools
        const rankings = await getAllSchoolRankings().catch(() => [])
        const avgPreparedness = rankings.length > 0
          ? Math.round(rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length)
          : 0
        const activeAlerts = (alerts || []).filter(
          a => a.severity === "critical" || a.severity === "emergency"
        ).length

        if (!mounted) return

        setStats({
          schools: effectiveSchools.length,
          students: totalStudents,
          teachers: totalTeachers,
          avgPreparedness,
          activeAlerts,
        })
      } catch (err) {
        console.warn("Notice loading stats, using defaults:", err)
        if (!mounted) return
        setStats({
          schools: SEED_SCHOOLS.length,
          students: 0,
          teachers: 0,
          avgPreparedness: 0,
          activeAlerts: 0,
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDashboardStats()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-3xl bg-[#8A84B8]/30 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-white/60 animate-pulse border border-slate-200/60" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-700">
        <div className="flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
        <p className="mt-2 text-xs text-rose-500">Please check your connection and try refreshing the page.</p>
      </div>
    )
  }

  const quickStats = [
    {
      label: "Schools Connected",
      subtitle: "Statewide Network",
      value: stats?.schools.toString() || "0",
      icon: School,
      iconBg: "bg-[#8E87BE]/15 text-[#6D65A2]",
      badge: "Active",
      badgeColor: "bg-[#D4F651] text-[#1E1B30]",
    },
    {
      label: "Total Learners",
      subtitle: "Students & Teachers",
      value: stats?.students.toLocaleString() || "0",
      icon: Users,
      iconBg: "bg-[#8E87BE]/15 text-[#6D65A2]",
      badge: `${stats?.teachers || 0} Staff`,
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      label: "Avg. Preparedness",
      subtitle: "Average across schools",
      value: `${stats?.avgPreparedness || 0}%`,
      icon: TrendingUp,
      iconBg: "bg-[#D4F651]/25 text-[#425400]",
      badge: "Target 85%",
      badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    {
      label: "Active Directives",
      subtitle: "Live NDMA Sync",
      value: stats?.activeAlerts.toString() || "0",
      icon: Zap,
      iconBg: stats?.activeAlerts && stats.activeAlerts > 0 ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400",
      badge: stats?.activeAlerts && stats.activeAlerts > 0 ? "Action Required" : "All Clear",
      badgeColor: stats?.activeAlerts && stats.activeAlerts > 0 ? "bg-rose-500 text-white" : "bg-[#D4F651] text-[#1E1B30]",
      isDark: true,
    },
  ]

  const filteredFeatures = features.filter(f => {
    if (viewFilter === "alerts") return f.code.startsWith("ALR") || f.code.startsWith("RNK")
    if (viewFilter === "curriculum") return f.code.startsWith("HWK") || f.code.startsWith("TRN") || f.code.startsWith("AUD")
    return true
  })

  return (
    <div className="space-y-6">
      {/* ── TIMEFRAME-INSPIRED LAVENDER HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8C86BA] via-[#8079B0] to-[#7169A3] text-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(113,105,163,0.22)] border border-white/20">
        
        {/* Subtle background decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#D4F651]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Title & Subtitle */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3.5 text-white">
              <Shield className="size-3.5 text-[#D4F651]" />
              <span>Admin Command Center</span>
              <span className="size-1 rounded-full bg-[#D4F651]" />
              <span className="text-white/80 font-normal">Statewide Oversight</span>
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome, {name}
            </h1>
            <p className="mt-2 text-sm text-white/80 leading-relaxed max-w-lg font-medium">
              Information designed for accurate institutional safety insights. Monitor readiness, coordinate drills, and manage emergency response across schools.
            </p>
          </div>

          {/* Right Action Controls (TimeFrame Pill Style) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Button
              asChild
              className="rounded-full bg-[#1F1C33] hover:bg-[#2C2847] text-white font-bold text-xs h-11 px-5 shadow-lg border border-white/10 transition-all hover:scale-105"
            >
              <Link href="/admin/analytics">
                <BarChart3 className="mr-2 size-4 text-[#D4F651]" />
                View Analytics
              </Link>
            </Button>

            <Button
              asChild
              className="rounded-full bg-white text-[#1F1C33] hover:bg-slate-50 font-bold text-xs h-11 px-5 shadow-md transition-all hover:scale-105"
            >
              <Link href="/rankings">
                <Trophy className="mr-2 size-4 text-amber-500" />
                School Rankings
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Filter Toggles (TimeFrame Daily / Weekly / Monthly style) */}
        <div className="relative z-10 mt-7 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#1F1C33]/60 backdrop-blur-md border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setViewFilter("all")}
              className={cn(
                "px-4 py-1.5 rounded-full transition-all duration-200",
                viewFilter === "all" ? "bg-white text-[#1F1C33] font-bold shadow-sm" : "text-white/70 hover:text-white"
              )}
            >
              All Tools
            </button>
            <button
              onClick={() => setViewFilter("alerts")}
              className={cn(
                "px-4 py-1.5 rounded-full transition-all duration-200",
                viewFilter === "alerts" ? "bg-white text-[#1F1C33] font-bold shadow-sm" : "text-white/70 hover:text-white"
              )}
            >
              Directives &amp; Alerts
            </button>
            <button
              onClick={() => setViewFilter("curriculum")}
              className={cn(
                "px-4 py-1.5 rounded-full transition-all duration-200",
                viewFilter === "curriculum" ? "bg-white text-[#1F1C33] font-bold shadow-sm" : "text-white/70 hover:text-white"
              )}
            >
              Curriculum &amp; Drills
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#D4F651] animate-pulse" />
              Live Server Sync
            </span>
            <span>·</span>
            <span>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

      </div>

      {/* ── 4 STAT CARDS (TimeFrame High-Contrast Layout) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-3xl p-6 shadow-[0_6px_25px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
              stat.isDark
                ? "bg-[#201D33] text-white border border-[#302B4C]"
                : "bg-white border border-slate-100 text-slate-900"
            )}
          >
            {/* Top row: Squircle icon + Badge */}
            <div className="flex items-center justify-between">
              <div className={cn("size-12 rounded-2xl flex items-center justify-center font-bold", stat.iconBg)}>
                <stat.icon className="size-6" />
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm", stat.badgeColor)}>
                {stat.badge}
              </span>
            </div>

            {/* Label + Subtitle */}
            <div className="mt-4">
              <p className={cn("text-xs font-bold uppercase tracking-wider", stat.isDark ? "text-white/60" : "text-slate-400")}>
                {stat.label}
              </p>
              <p className={cn("text-[11px] font-medium", stat.isDark ? "text-white/40" : "text-slate-400")}>
                {stat.subtitle}
              </p>
            </div>

            {/* Big Bold Value (TimeFrame Font Style) */}
            <p className={cn("font-headline text-3xl font-extrabold tracking-tight mt-2", stat.isDark ? "text-white" : "text-slate-900")}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── INCIDENT BRIEFS & QUICK ACCESS TOOLS GRID ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-xl font-bold text-slate-900">Incident Briefs &amp; Operational Tools</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick access management tools for emergency broadcasts, drills, and school rankings.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {filteredFeatures.length} Active Modules
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-[#8C86BA]/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Header with Squircle Icon & Code Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-2xl bg-[#8C86BA]/10 text-[#6D65A2] group-hover:bg-[#8C86BA] group-hover:text-white transition-all duration-300 flex items-center justify-center">
                    <feature.icon className="size-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold font-mono tracking-wider">
                    {feature.code}
                  </span>
                </div>

                <h3 className="font-headline font-bold text-base text-slate-900 group-hover:text-[#6D65A2] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Launch Button (TimeFrame Dark Pill Button) */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6D65A2] group-hover:underline">
                  Launch Console
                </span>
                <span className="size-8 rounded-full bg-[#1F1C33] text-white flex items-center justify-center text-xs group-hover:bg-[#D4F651] group-hover:text-[#1E1B30] transition-all duration-200">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ===== DYNAMIC TEACHER CALENDAR WIDGET ===== */
function DynamicTeacherCalendar() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
  }, [])

  if (!now) {
    return (
      <div className="rounded-[36px] bg-white p-6 shadow-[0_12px_40px_rgba(100,90,160,0.06)] border border-[#EDE8F6] h-48 animate-pulse" />
    )
  }

  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const todayDate = now.getDate()

  // First day of current month (Convert Sunday=0 to Monday=0..Sunday=6)
  const firstDay = new Date(currentYear, currentMonth, 1)
  const startDayOfWeek = (firstDay.getDay() + 6) % 7

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate()

  const calendarDays: { day: number; isCurrentMonth: boolean; isToday: boolean }[] = []

  // Prepend previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthTotalDays - i,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      isToday: d === todayDate,
    })
  }

  // Next month leading days to complete grid
  let nextDayCount = 1
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({
      day: nextDayCount++,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  const monthYearLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="rounded-[36px] bg-white p-6 shadow-[0_12px_40px_rgba(100,90,160,0.06)] border border-[#EDE8F6]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-headline font-extrabold text-xs uppercase tracking-wider text-[#1A1836]">
          {monthYearLabel}
        </h4>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Today: {todayDate} {now.toLocaleDateString("en-US", { month: "short" })}
        </span>
      </div>

      {/* Weekday headers (Monday through Sunday) */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#7B73A8] uppercase mb-2">
        <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
      </div>

      {/* Dynamic calendar days */}
      <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center text-xs font-bold">
        {calendarDays.map((item, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {item.isToday ? (
              <span className="size-7 sm:size-8 rounded-full bg-[#56B8FF] text-white font-extrabold shadow-md shadow-blue-500/25 flex items-center justify-center text-xs">
                {item.day}
              </span>
            ) : item.isCurrentMonth ? (
              <span className="size-7 sm:size-8 rounded-full text-[#1A1836] flex items-center justify-center text-xs hover:bg-[#F0EEFA] transition-colors">
                {item.day}
              </span>
            ) : (
              <span className="size-7 sm:size-8 rounded-full text-slate-300 flex items-center justify-center text-xs font-normal">
                {item.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===== TEACHER DASHBOARD ===== */
function TeacherDashboard({ name, tier, schoolName, schoolId, uid }: { name: string; tier?: string; schoolName?: string; schoolId?: string; uid?: string }) {
  const [pendingAssignments, setPendingAssignments] = useState<ModuleAssignment[]>([])
  const [scheduledDrills, setScheduledDrills] = useState<DrillDoc[]>([])
  
  useEffect(() => {
    if (!schoolId) return
    let unsubs: (() => void)[] = []
    let cancelled = false
    async function loadAssignments() {
      const active = await getActiveAssignmentsForSchool(schoolId!)
      if (cancelled) return
      // Live-watch each assignment: it's listed only while "pending", and vanishes as soon as any teacher releases it
      unsubs = active.map(assignment =>
        subscribeSchoolStatus(assignment.id, schoolId!, status => {
          setPendingAssignments(prev => {
            const rest = prev.filter(a => a.id !== assignment.id)
            return status?.status === "pending" ? [...rest, assignment] : rest
          })
        })
      )

      const drills = await getSchoolDrills(schoolId!)
      setScheduledDrills(drills.filter(d => d.status === "scheduled"))
    }
    loadAssignments()
    return () => { cancelled = true; unsubs.forEach(u => u()) }
  }, [schoolId])

  const handleRelease = async (assignment: ModuleAssignment) => {
    if (!schoolId || !uid) return
    if (!confirm(`Release ${assignment.moduleName} to your students?`)) return
    
    const res = await releaseModuleToStudents(assignment.id, schoolId, uid, name)
    setPendingAssignments(prev => prev.filter(a => a.id !== assignment.id))
    alert(res.released
      ? "Module released successfully!"
      : `Already released${res.releasedByName ? ` by ${res.releasedByName}` : " by another teacher"}.`)
  }

  const toolThemes = [
    {
      gradient: "from-[#4E4376] via-[#2B5876] to-[#1F1C38]",
      tag: "#LiveAlerts",
      badge: "ALR-002",
      pill: "bg-[#FF8CA6] text-white",
    },
    {
      gradient: "from-[#F857A6] via-[#FF5858] to-[#EE5A24]",
      tag: "#TrainingVideos",
      badge: "TRN-003",
      pill: "bg-[#56B8FF] text-white",
    },
    {
      gradient: "from-[#11998E] via-[#38EF7D] to-[#0575E6]",
      tag: "#SchoolRankings",
      badge: "RNK-007",
      pill: "bg-[#726BEA] text-white",
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── TOP HERO BANNER (No Extra/Fake Metrics) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 pt-1">
        <div className="flex items-center gap-4">
          {/* Avatar circle */}
          <div className="size-16 rounded-full bg-gradient-to-tr from-[#FF7B9E] via-[#FFA8BE] to-[#6A64DD] p-0.5 shadow-lg shadow-purple-500/15 shrink-0 flex items-center justify-center">
            <div className="size-full rounded-full bg-white flex items-center justify-center text-2xl font-extrabold text-[#6A64DD]">
              👨‍🏫
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7B73A8]">Hey Educator!</p>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-[#1A1836] tracking-tight">
              Welcome, {name}
            </h1>
          </div>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="rounded-full bg-[#6A64DD] hover:bg-[#5852CB] text-white font-bold text-xs h-10 px-5 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <Link href="/disaster-alerts">
              <AlertTriangle className="mr-1.5 size-3.5 text-amber-300" />
              Live Alerts
            </Link>
          </Button>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN DASHBOARD LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (8 cols): Composer / Feed Card Style from Reference Image */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Post/Status Composer Card */}
          <div className="rounded-[36px] bg-white p-6 sm:p-7 shadow-[0_12px_40px_rgba(100,90,160,0.06)] border border-[#EDE8F6] relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2EFF9]">
              <div className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-full bg-[#6A64DD]" />
                <span className="text-xs font-bold text-[#1A1836]">{schoolName || "Institution Classroom"}</span>
              </div>
              
              {/* Colorful pills */}
              <div className="flex items-center gap-1.5">
                {tier && (
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide",
                    tier === "primary" ? "bg-[#FF8CA6] text-white" : "bg-[#56B8FF] text-white"
                  )}>
                    {tier === "primary" ? "Class 1–5" : "Class 6–12"}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-[#726BEA] text-white text-[11px] font-extrabold tracking-wide">
                  NDMA Ready
                </span>
              </div>
            </div>

            <div className="pt-5 flex items-start gap-4">
              <div className="size-11 rounded-full bg-[#FF8CA6] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-pink-500/20">
                🛡️
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A1836]">Classroom Safety Protocol Active</p>
                <p className="text-xs text-[#7B73A8] mt-1 leading-relaxed">
                  Prepare your students for emergency drills. Monitor training module progress and broadcast directives to keep your classroom safe.
                </p>
              </div>
            </div>

            {/* Action Bar at bottom */}
            <div className="mt-6 pt-4 border-t border-[#F2EFF9] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#7B73A8] font-semibold">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>All safety systems active</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/training"
                  className="px-4 py-1.5 rounded-full bg-[#F3F0FA] text-[#6A64DD] hover:bg-[#EAE4F7] text-xs font-bold transition-colors"
                >
                  Explore Drills
                </Link>
                <div className="size-9 rounded-2xl bg-[#6A64DD] text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                  ⚡
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTION REQUIRED / PENDING ASSIGNMENT CARDS ── */}
          {pendingAssignments.length > 0 ? (
            <div className="rounded-[36px] bg-white p-6 sm:p-7 shadow-[0_12px_40px_rgba(100,90,160,0.06)] border border-[#EDE8F6] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-9 rounded-2xl bg-[#56B8FF] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <BookImage className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="font-headline font-bold text-base text-[#1A1836]">New Module Assigned by Admin</h3>
                    <p className="text-xs text-[#7B73A8]">Action required: release curriculum to your classroom</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#FF8CA6] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                  {pendingAssignments.length} Pending
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {pendingAssignments.map(a => (
                  <div key={a.id} className="p-4 rounded-3xl bg-[#FAF8FD] border border-[#EFEBF8] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-white text-[#6A64DD] flex items-center justify-center font-extrabold shadow-sm border border-[#EBE7F6]">
                        📚
                      </div>
                      <div>
                        <p className="font-headline font-bold text-sm text-[#1A1836]">{a.moduleName}</p>
                        <p className="text-xs text-[#7B73A8]">{getModuleCategory(a.moduleId)} · 5 Day Curriculum</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRelease(a)}
                      className="rounded-full bg-[#6A64DD] hover:bg-[#5852CB] text-white font-bold text-xs px-6 h-10 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 shrink-0"
                    >
                      <Send className="mr-1.5 size-3.5" /> Release to Students
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── SCHEDULED DRILL ADVISORY CARD ── */}
          <div className="rounded-[36px] bg-white p-6 sm:p-7 shadow-[0_12px_40px_rgba(100,90,160,0.06)] border border-[#EDE8F6] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-[#FFE8EE] text-[#FF5A82] flex items-center justify-center font-extrabold shrink-0 shadow-sm">
                <Zap className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F0EEFA] text-[#6A64DD] text-[10px] font-extrabold uppercase tracking-wider">
                    {scheduledDrills.length > 0 ? "Drill Scheduled" : "Standby"}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-base text-[#1A1836] mt-0.5">Campus Drill Recommendation</h3>
                <p className="text-xs text-[#7B73A8] mt-0.5">
                  {scheduledDrills.length > 0 
                    ? `Admin has scheduled ${scheduledDrills.length} drill(s) for your campus.`
                    : "No pending drills assigned. All classrooms currently drill-ready."}
                </p>
              </div>
            </div>

            {scheduledDrills.length > 0 ? (
              <Button asChild className="rounded-full bg-[#1A1836] hover:bg-slate-800 text-white font-bold text-xs h-10 px-6 shrink-0">
                <Link href="/training">View Details &rarr;</Link>
              </Button>
            ) : (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shrink-0">
                ✓ Ready
              </span>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (4 cols): Side Panel with Visual Tools & Real Dynamic Calendar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Visual Interactive Tools Card */}
          <div className="rounded-[36px] bg-white p-6 shadow-[0_12px_40px_rgba(100,90,160,0.06)] border border-[#EDE8F6] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-base text-[#1A1836]">Classroom Tools</h3>
              <span className="text-[11px] font-bold text-[#6A64DD]">3 Active</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {features.filter(f => !f.adminOnly).map((feature, i) => {
                const theme = toolThemes[i % toolThemes.length]
                return (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    className="p-4 rounded-3xl bg-[#FAF8FD] border border-[#EFEBF8] hover:border-[#6A64DD]/40 hover:shadow-md transition-all duration-200 group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("size-11 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-md", theme.gradient)}>
                        <feature.icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-headline font-bold text-sm text-[#1A1836] group-hover:text-[#6A64DD] transition-colors truncate">
                          {feature.title}
                        </p>
                        <p className="text-[11px] text-[#7B73A8] font-semibold">{theme.tag}</p>
                      </div>
                    </div>

                    <span className="size-8 rounded-full bg-white text-[#7B73A8] group-hover:bg-[#6A64DD] group-hover:text-white transition-colors flex items-center justify-center text-xs shadow-sm shrink-0 border border-[#EDE8F6]">
                      →
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Hashtag-style filter chips */}
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-3 py-1 rounded-full bg-[#F0EEFA] text-[#6A64DD] text-[11px] font-bold">
                #DrillReady
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F0EEFA] text-[#6A64DD] text-[11px] font-bold">
                #NDMAGuidelines
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F0EEFA] text-[#6A64DD] text-[11px] font-bold">
                #SchoolSafety
              </span>
            </div>
          </div>

          {/* Fully Dynamic Calendar Widget */}
          <DynamicTeacherCalendar />

        </div>

      </div>
    </div>
  )
}

/* ===== STUDENT DASHBOARD ===== */
const SAFETY_TIPS = [
  { icon: "🛡️", topic: "Earthquake Safety", tip: "Drop, Cover, and Hold On under a sturdy desk away from windows." },
  { icon: "🔥", topic: "Fire Safety", tip: "In case of smoke, stay low to the ground where the air is cleanest." },
  { icon: "🌊", topic: "Flood Readiness", tip: "Never walk or drive through moving water. Just 6 inches can knock you down." },
  { icon: "⚡", topic: "Lightning Rule", tip: "When thunder roars, go indoors immediately and stay off corded electronics." },
  { icon: "🩹", topic: "First Aid Basics", tip: "Apply clean, direct pressure to stop bleeding before calling emergency services." },
]

function StudentDashboard({ name, tier, uid, schoolId }: { name: string; tier?: string; uid?: string; schoolId?: string }) {
  const { profile, resetProfileXP } = useAuth()
  const [activeAssignment, setActiveAssignment] = useState<ModuleAssignment | null>(null)
  const [progress, setProgress] = useState<StudentModuleProgress | null>(null)
  const [tipIndex, setTipIndex] = useState(0)
  
  useEffect(() => {
    if (!uid || !schoolId) return
    async function loadMission() {
      // Find an active assignment for this school that has been released
      const active = await getActiveAssignmentsForSchool(schoolId!)
      for (const a of active) {
        const status = await getSchoolStatus(a.id, schoolId!)
        if (status?.status === "released") {
          setActiveAssignment(a)
          const p = await getStudentModuleProgress(uid!, a.id)
          setProgress(p)
          break // show the first one
        }
      }
    }
    loadMission()
  }, [uid, schoolId])

  const videoSummary = getVideoProgressSummary(progress)
  const completedCount = videoSummary.filter(v => v.watched).length
  const currentDayInfo = videoSummary.find(v => v.available) || (progress?.allVideosCompleted ? { day: 5, available: false } : videoSummary[0])
  const daysLeft = activeAssignment ? Math.ceil(Math.max(0, (activeAssignment.deadlineAt?.toDate ? activeAssignment.deadlineAt.toDate() : (activeAssignment.deadlineAt as any)?.seconds ? new Date((activeAssignment.deadlineAt as any).seconds * 1000) : new Date(activeAssignment.deadlineAt as any || Date.now())).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  const userProgress = getUserProgress(uid || "")
  const userTotalXP = Math.max(profile?.totalXP || 0, userProgress.xp || 0)
  const targetXP = 500 // Target XP for Level 1 certification
  const progressPercent = Math.min(100, Math.round((userTotalXP / targetXP) * 100))
  const completedModulesCount = userProgress.completedLessons ? userProgress.completedLessons.length : 0
  const streak = userProgress.streak || 0

  const handleResetScores = async () => {
    await resetProfileXP()
    window.location.reload()
  }

  const currentTip = SAFETY_TIPS[tipIndex]

  return (
    <div className="space-y-6">
      {/* ── TOP ROW: WELCOME BANNER WITH PANDA MASCOT + SAFETY FEED (Bear Dashboard Style) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Main Welcome Hero Card with Meditating Panda Mascot */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left text column */}
            <div className="flex-1 text-center sm:text-left">
              {tier && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold mb-3",
                  tier === "primary"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                )}>
                  {getTierEmoji(tier as "primary" | "secondary")} {tier === "primary" ? "Class 1–5 Primary Tier" : "Class 6–12 Secondary Tier"}
                </span>
              )}
              <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Hi, {name}! 👋
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Stay calm, train daily, and lead safety in your school.
              </p>

              {/* Interactive Daily Safety Tip Carousel (Encourages Reading & Retention) */}
              <div className="mt-6 p-4 rounded-2xl bg-orange-50/70 border border-orange-100/80 transition-all hover:bg-orange-50">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700">
                    <span>{currentTip.icon}</span>
                    <span>Daily Safety Habit · {currentTip.topic}</span>
                  </div>
                  <button
                    onClick={() => setTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length)}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-800 underline transition-colors"
                  >
                    Next Tip →
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  &ldquo;{currentTip.tip}&rdquo;
                </p>
              </div>
            </div>

            {/* Right column: Animated Meditating Panda Mascot */}
            <div className="shrink-0 flex items-center justify-center p-2 relative">
              {/* Soft decorative glow */}
              <div className="absolute inset-0 bg-orange-100/50 rounded-full blur-2xl transform scale-90" />
              <img
                src="/panda-mascot.png"
                alt="Meditating Safety Mascot"
                className="w-44 sm:w-52 h-auto object-contain drop-shadow-md transition-all duration-300 hover:scale-105 animate-[float_4s_ease-in-out_infinite] relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Right side: Safety Feed Panel (Bear Dashboard Style) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-orange-50 text-orange-500">
                  <Shield className="size-4" />
                </span>
                <h3 className="font-headline text-base font-bold text-slate-900">Safety Feed</h3>
              </div>
              <Link href="/disaster-alerts" className="text-xs font-semibold text-orange-500 hover:text-orange-600">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {/* Feed 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-100/80">
                <div className="size-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">XP Goal Active</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{userTotalXP} / 500 XP to Level 2 Safety Champion.</p>
                </div>
              </div>

              {/* Feed 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-100/80">
                <div className="size-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                  🚨
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">NDMA Guidelines</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">School safety protocols aligned with NDMA guidelines.</p>
                </div>
              </div>

              {/* Feed 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/70 border border-blue-100/80">
                <div className="size-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-xs">
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">School Rank Updates</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">Your school preparedness score is actively climbing!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── 4 STAT CARDS ROW (Exact Bear Dashboard Card Layout) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Total XP */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <Zap className="size-6" />
            </div>
            <button
              onClick={handleResetScores}
              title="Reset XP"
              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">Total XP Earned</p>
          <p className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {userTotalXP} <span className="text-base font-semibold text-slate-400">XP</span>
          </p>
        </div>

        {/* Card 2: Modules Completed */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
              <Puzzle className="size-6" />
            </div>
            <span className="text-xs text-blue-500 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              Modules
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">Completed Modules</p>
          <p className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {completedModulesCount} <span className="text-base font-semibold text-slate-400">Done</span>
          </p>
        </div>

        {/* Card 3: Learning Streak */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <TrendingUp className="size-6" />
            </div>
            <span className="text-xs text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
              Streak
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">Learning Streak</p>
          <p className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {streak} <span className="text-base font-semibold text-slate-400">Days</span>
          </p>
        </div>

        {/* Card 4: Level 1 Goal Progress (Clear 500 XP Metric) */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
              <Trophy className="size-6" />
            </div>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              {userTotalXP} / 500 XP
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">Level 1 Goal Progress</p>
          <p className="font-headline text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {progressPercent}%
          </p>
          <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 via-rose-500 to-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

      </div>

      {/* ── YOUR MISSION TODAY (Daily Assignment Tracker) ── */}
      <div className="space-y-3">
        <h2 className="font-headline text-xl font-bold text-slate-900">Your Mission Today</h2>

        {activeAssignment ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold">
                Active Assignment
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                <Clock className="size-3.5" />
                {daysLeft} days remaining
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="text-5xl bg-orange-50 p-6 rounded-3xl border border-orange-100 shrink-0 text-orange-500">
                {activeAssignment.moduleIcon}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-headline text-2xl font-bold text-slate-900 mb-2">
                  {activeAssignment.moduleName}
                </h3>

                {/* 5-Day Interactive Bubbles */}
                <div className="flex gap-2.5 justify-center md:justify-start mb-6 mt-3">
                  {[1, 2, 3, 4, 5].map((day) => {
                    const vInfo = videoSummary.find(v => v.day === day)
                    const isWatched = vInfo?.watched
                    const isCurrent = currentDayInfo?.day === day
                    return (
                      <div key={day} className="flex flex-col items-center gap-1">
                        <div className={cn(
                          "size-9 rounded-2xl flex items-center justify-center text-xs font-extrabold border-2 transition-all",
                          isWatched
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                            : isCurrent
                              ? "border-orange-400 text-orange-600 bg-orange-50 ring-2 ring-orange-200"
                              : "border-slate-200 text-slate-400 bg-slate-50"
                        )}>
                          {isWatched ? "✓" : day}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">Day {day}</span>
                      </div>
                    )
                  })}
                </div>

                <Button asChild size="lg" className="w-full md:w-auto font-bold gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/20 text-white rounded-2xl h-12 px-7">
                  <Link href="/module-learn">
                    <PlayCircle className="size-5" />
                    {progress?.allVideosCompleted && !progress?.quizResult?.passed ? "Take Final Quiz" :
                     progress?.status === "completed" ? "Review Module" :
                     `Continue Day ${currentDayInfo?.day || 1}`}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="size-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-3">
                <CheckCircle className="size-7" />
              </div>
              <p className="font-headline font-bold text-lg text-slate-900">All caught up! 🎉</p>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">No assignments pending right now. Explore supplementary games and videos below!</p>
            </div>
          </div>
        )}
      </div>

      {/* ── WHAT ARE WE LEARNING TODAY? (Modules Section at the Bottom) ── */}
      <div className="space-y-3">
        <div>
          <h2 className="font-headline text-xl font-bold text-slate-900">What are we learning today?</h2>
          <p className="text-xs text-slate-500 mt-0.5">Explore response training paths, animated scenarios, and interactive learning games.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studentModules.map((mod, i) => {
            const colors = [
              { bg: "bg-blue-50 text-blue-500 border-blue-100", border: "hover:border-blue-200" },
              { bg: "bg-emerald-50 text-emerald-500 border-emerald-100", border: "hover:border-emerald-200" },
              { bg: "bg-purple-50 text-purple-500 border-purple-100", border: "hover:border-purple-200" },
              { bg: "bg-rose-50 text-rose-500 border-rose-100", border: "hover:border-rose-200" },
            ][i % 4]
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className={cn(
                  "bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 group flex items-start justify-between gap-4",
                  colors.border
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0 border", colors.bg)}>
                    <mod.icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline font-bold text-base text-slate-900 group-hover:text-orange-500 transition-colors">
                      {mod.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
                <span className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors shrink-0 mt-1">
                  →
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── SCHOOL RANKINGS / LEADERBOARD BANNER ── */}
      <Link
        href="/rankings"
        className="flex items-center justify-between bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
            <Trophy className="size-6" />
          </div>
          <div>
            <p className="font-headline font-bold text-base text-slate-900 group-hover:text-orange-500 transition-colors">
              Statewide School Rankings
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Check your school&apos;s disaster preparedness badge and student points leaderboard.
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-orange-500 group-hover:translate-x-1 transition-transform">
          View Leaderboard &rarr;
        </span>
      </Link>

    </div>
  )
}

function TopEmergencyAlertBanner() {
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlertDoc[]>([])

  useEffect(() => {
    let unsub: (() => void) | undefined
    try {
      unsub = subscribeToEmergencyAlerts((alerts) => {
        setActiveAlerts(alerts.filter(a => a.status === "active"))
      })
    } catch {
      // Subscription failed — ignore
    }
    return () => { unsub?.() }
  }, [])

  if (activeAlerts.length === 0) return null

  const latest = activeAlerts[0]
  const isEmergency = latest.severity === "emergency" || latest.severity === "critical"

  return (
    <div className={cn(
      "rounded-2xl p-5 border-2 shadow-2xl animate-fade-up space-y-2 mb-6 relative overflow-hidden pattern-dots-light",
      isEmergency 
        ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-red-500/50" 
        : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 border-amber-400/50 dark:text-slate-950"
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black/20 rounded-xl shrink-0 backdrop-blur-sm">
            <AlertTriangle className="size-6 text-current animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-black/20 text-current border-0 text-[10px] font-extrabold uppercase tracking-wider">
                🚨 Active Emergency Alert · {latest.targetSchoolName}
              </Badge>
            </div>
            <h2 className="font-headline font-bold text-lg md:text-xl leading-tight mt-1">{latest.title}</h2>
          </div>
        </div>
        <Badge className="bg-black/30 text-current border-0 text-[10px] font-bold uppercase shrink-0">
          LIVE DIRECTIVE
        </Badge>
      </div>
      <p className="text-xs md:text-sm font-medium leading-relaxed opacity-95 pl-1 md:pl-12">{latest.message}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const userRole = profile?.role || USER_ROLES.STUDENT
  const displayName = profile?.displayName?.split(" ")[0] || "User"

  return (
    <div className="space-y-6">
      <TopEmergencyAlertBanner />
      {userRole === USER_ROLES.STUDENT ? (
        <StudentDashboard name={displayName} tier={profile?.tier} uid={profile?.uid} schoolId={profile?.schoolId} />
      ) : userRole === USER_ROLES.TEACHER ? (
        <TeacherDashboard name={displayName} tier={profile?.tier} schoolName={profile?.schoolName} schoolId={profile?.schoolId} uid={profile?.uid} />
      ) : (
        <AdminDashboard name={displayName} />
      )}
    </div>
  )
}
