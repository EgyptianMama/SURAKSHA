"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Check, Lock, Star, Zap } from "lucide-react"
import {
  getUserProgress, getCurrentLevel, getNextLevel, isLessonUnlocked, getTotalLessons,
  getUnitsForTier, getLessonItemCount, XP_PER_CORRECT, XP_LESSON_BONUS,
  type UserProgress, type Lesson,
} from "@/lib/learning-data"
import { type Tier } from "@/lib/school-codes"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

// One colour family per unit (literal class names so Tailwind keeps them)
const PALETTE = [
  { bg: "bg-[#58cc02]", edge: "border-[#46a302]", soft: "bg-[#58cc02]/15", text: "text-[#58cc02]" },
  { bg: "bg-[#1cb0f6]", edge: "border-[#1899d6]", soft: "bg-[#1cb0f6]/15", text: "text-[#1cb0f6]" },
  { bg: "bg-[#ce82ff]", edge: "border-[#a568cc]", soft: "bg-[#ce82ff]/15", text: "text-[#ce82ff]" },
  { bg: "bg-[#ff9600]", edge: "border-[#cc7800]", soft: "bg-[#ff9600]/15", text: "text-[#ff9600]" },
  { bg: "bg-[#ff4b4b]", edge: "border-[#ea2b2b]", soft: "bg-[#ff4b4b]/15", text: "text-[#ff4b4b]" },
  { bg: "bg-[#2b70c9]", edge: "border-[#1f4f93]", soft: "bg-[#2b70c9]/15", text: "text-[#2b70c9]" },
  { bg: "bg-[#00cd9c]", edge: "border-[#00a37c]", soft: "bg-[#00cd9c]/15", text: "text-[#00cd9c]" },
]

const TYPE_LABEL: Record<string, string> = {
  quiz: "Quiz", "safe-spot": "Find the safe spot", "dos-donts": "Do or Don't", matching: "Matching",
}

// Zig-zag offsets (px) that make the path wind like Duolingo's
const WIGGLE = [0, -46, -66, -46, 0, 46, 66, 46]

// Shows the student's real total XP (same number as the dashboard) and level — no streak/hearts.
function StatsBar({ xp }: { xp: number }) {
  const level = getCurrentLevel(xp)
  const next = getNextLevel(xp)
  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2 text-sm font-extrabold">
      <div className="flex items-center gap-1.5" title={`Level: ${level.name}`}>
        <span className="text-lg">{level.emoji}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {level.name}{next ? ` · ${next.minXP - xp} XP to ${next.name}` : ""}
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-sky-500"><Zap className="size-5" fill="currentColor" />{xp}</span>
    </div>
  )
}

type NodeState = "done" | "current" | "locked"

function LessonNode({ lesson, state, color, offset, open, isFirstCurrent, onToggle, position, total, xp, tier }: {
  lesson: Lesson; state: NodeState; color: (typeof PALETTE)[number]; offset: number
  open: boolean; isFirstCurrent: boolean; onToggle: () => void; position: number; total: number; xp: number; tier: Tier
}) {
  void tier
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ transform: `translateX(${offset}px)` }}>
        {state === "current" && !open && (
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 animate-bounce">
            <div className={cn("relative px-3 py-1.5 rounded-xl border-2 bg-card text-xs font-extrabold tracking-wide whitespace-nowrap", color.text, "border-current")}>
              {isFirstCurrent ? "START" : "PLAY"}
              <span className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 size-3 rotate-45 bg-card border-b-2 border-r-2 border-current" />
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={lesson.title}
          className={cn(
            "size-[72px] rounded-full border-b-[7px] flex items-center justify-center text-white transition-transform active:translate-y-1 active:border-b-[3px]",
            state === "locked" ? "bg-slate-200 border-slate-300 dark:bg-muted dark:border-border text-slate-400" : cn(color.bg, color.edge),
            state === "current" && "ring-[6px] ring-black/10 dark:ring-white/10"
          )}
        >
          {state === "done" ? <Check className="size-8" strokeWidth={4} />
            : state === "current" ? <Star className="size-8" fill="currentColor" />
            : <Lock className="size-7" />}
        </button>
      </div>

      {open && (
        <div className="relative mt-4 mb-2 w-[min(300px,90vw)] animate-scale-in">
          <span className={cn("absolute -top-1.5 left-1/2 -translate-x-1/2 size-4 rotate-45", state === "locked" ? "bg-slate-200 dark:bg-muted" : color.bg)} />
          <div className={cn("relative rounded-2xl p-4", state === "locked" ? "bg-slate-200 dark:bg-muted text-slate-600 dark:text-foreground" : cn(color.bg, "text-white"))}>
            <p className="font-headline font-extrabold text-base leading-tight">{lesson.title}</p>
            <p className={cn("text-xs mt-0.5", state === "locked" ? "text-slate-500 dark:text-muted-foreground" : "text-white/85")}>
              Lesson {position} of {total} · {TYPE_LABEL[lesson.type] ?? "Lesson"}
            </p>
            {state === "locked" ? (
              <p className="mt-3 text-sm font-semibold">Complete the previous lesson to unlock this one.</p>
            ) : (
              <Link
                href={`/safety-path/lesson/${lesson.id}`}
                className={cn("mt-3 block w-full rounded-xl bg-white py-3 text-center text-sm font-extrabold tracking-wide border-b-4 border-slate-200 active:translate-y-px", color.text)}
              >
                {state === "done" ? "PRACTICE AGAIN" : `START +${xp} XP`}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SafetyPathPage() {
  const { profile } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  // same source as the dashboard: profile XP (modules, games, lessons) or local lesson XP, whichever is higher
  const totalXP = Math.max(profile?.totalXP || 0, progress?.xp || 0)

  const tier = useMemo<Tier>(() => profile?.tier || "primary", [profile?.tier])
  const tierUnits = useMemo(() => getUnitsForTier(tier), [tier])

  useEffect(() => {
    if (!profile?.uid) return
    const p = getUserProgress(profile.uid)
    setProgress(p)
    // open the first lesson you can play right away, like Duolingo's "current" node
    const current = tierUnits.flatMap(u => u.lessons).find(l => !p.completedLessons.includes(l.id) && isLessonUnlocked(l.id, p.completedLessons, tier))
    setOpenId(current?.id ?? null)
  }, [profile?.uid, tier, tierUnits])

  if (!progress) {
    return <div className="flex items-center justify-center min-h-[60vh] animate-pulse text-muted-foreground">Loading your journey...</div>
  }

  const tierLessonIds = tierUnits.flatMap(u => u.lessons.map(l => l.id))
  const completedCount = progress.completedLessons.filter(id => tierLessonIds.includes(id)).length
  const totalLessons = getTotalLessons(tier)
  const overall = Math.round((completedCount / totalLessons) * 100)
  const sectionsDone = tierUnits.filter(u => u.lessons.every(l => progress.completedLessons.includes(l.id))).length
  const firstCurrentId = tierLessonIds.find(id => !progress.completedLessons.includes(id) && isLessonUnlocked(id, progress.completedLessons, tier))

  return (
    <div className="max-w-md mx-auto pb-16">
      <StatsBar xp={totalXP} />

      <div className="mb-6 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-headline font-extrabold text-lg">
            {tier === "secondary" ? "Safety Commander Pathway" : "Safety Hero Pathway"}
          </h1>
          <span className="text-xs font-bold text-muted-foreground">{sectionsDone}/{tierUnits.length} sections</span>
        </div>
        <div className="h-3.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-[#58cc02] transition-all duration-700" style={{ width: `${overall}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">{completedCount} of {totalLessons} lessons completed</p>
      </div>

      {tierUnits.map((unit, unitIdx) => {
        const color = PALETTE[unitIdx % PALETTE.length]
        const done = unit.lessons.filter(l => progress.completedLessons.includes(l.id)).length
        return (
          <section key={unit.id} className="mb-10">
            <div className={cn("rounded-2xl p-4 text-white border-b-4 flex items-center justify-between", color.bg, color.edge)}>
              <div>
                <p className="text-[11px] font-extrabold tracking-widest text-white/80">SECTION {unitIdx + 1} · {done}/{unit.lessons.length}</p>
                <h2 className="font-headline font-extrabold text-lg leading-tight">{unit.title}</h2>
              </div>
              <span className="text-3xl">{done === unit.lessons.length ? "🏆" : unit.emoji}</span>
            </div>

            <div className="relative mt-12 flex flex-col items-center gap-9">
              <span className="hidden md:block absolute -right-28 top-6 text-7xl select-none animate-float opacity-90" aria-hidden>{unit.emoji}</span>
              {unit.lessons.map((lesson, i) => {
                const completed = progress.completedLessons.includes(lesson.id)
                const unlocked = isLessonUnlocked(lesson.id, progress.completedLessons, tier)
                const state: NodeState = completed ? "done" : unlocked ? "current" : "locked"
                return (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    state={state}
                    color={color}
                    offset={WIGGLE[i % WIGGLE.length]}
                    open={openId === lesson.id}
                    isFirstCurrent={firstCurrentId === lesson.id}
                    onToggle={() => setOpenId(openId === lesson.id ? null : lesson.id)}
                    position={i + 1}
                    total={unit.lessons.length}
                    xp={XP_LESSON_BONUS + XP_PER_CORRECT * getLessonItemCount(lesson, tier)}
                    tier={tier}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
