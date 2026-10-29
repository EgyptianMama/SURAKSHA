"use client"

import { useState, useEffect, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart, X, CheckCircle, XCircle, Zap, ArrowRight, RotateCcw, Trophy, Sparkles
} from "lucide-react"
import {
  units, secondaryUnits, getUserProgress, completeLesson, loseHeart, isLessonUnlocked,
  dosDontsData, matchingData, secondaryDosDontsData, secondaryMatchingData,
  findLessonById, getChoiceQuestions, getLessonItemCount,
  type UserProgress, type Lesson, type DosDontsItem, type MatchingPair
} from "@/lib/learning-data"
import { cn } from "@/lib/utils"

import { useAuth } from "@/contexts/auth-context"

type LessonPageProps = {
  params: Promise<{ lessonId: string }>
}

// === DO'S & DON'TS LESSON ===
function DosDontsLesson({ items, onComplete }: { items: DosDontsItem[]; onComplete: (correct: number) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null)
  const [answered, setAnswered] = useState(false)

  const item = items[currentIdx]
  if (!item && !feedback) {
    onComplete(correctCount)
    return null
  }

  const handleAnswer = (answeredDo: boolean) => {
    if (answered) return
    setAnswered(true)
    const isCorrect = answeredDo === item.isDo
    if (isCorrect) setCorrectCount(c => c + 1)
    setFeedback({ correct: isCorrect, explanation: item.explanation })
  }

  const handleNext = () => {
    setFeedback(null)
    setAnswered(false)
    if (currentIdx + 1 >= items.length) {
      onComplete(correctCount)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  return (
    <div className="space-y-4">
      <Progress value={((currentIdx + (feedback ? 1 : 0)) / items.length) * 100} className="h-2" />
      <p className="text-center text-xs text-muted-foreground">{currentIdx + 1} of {items.length}</p>

      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold leading-relaxed mb-6">&ldquo;{item?.statement}&rdquo;</p>
          {!feedback ? (
            <div className="flex gap-3 justify-center">
              <Button onClick={() => handleAnswer(true)} size="lg" className="flex-1 max-w-[140px] bg-emerald-500 hover:bg-emerald-600 font-bold text-lg h-14">
                ✅ DO
              </Button>
              <Button onClick={() => handleAnswer(false)} size="lg" className="flex-1 max-w-[140px] bg-red-500 hover:bg-red-600 font-bold text-lg h-14 text-white">
                ❌ DON&apos;T
              </Button>
            </div>
          ) : (
            <div className={cn(
              "p-4 rounded-xl animate-scale-in",
              feedback.correct ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedback.correct ? <CheckCircle className="size-5 text-emerald-500" /> : <XCircle className="size-5 text-red-500" />}
                <span className="font-bold text-sm">{feedback.correct ? "Correct! 🎉" : "Not quite! 💡"}</span>
              </div>
              <p className="text-xs text-muted-foreground">{feedback.explanation}</p>
              <Button onClick={handleNext} className="mt-3 w-full" size="sm">
                {currentIdx + 1 >= items.length ? "See Results" : "Next"} <ArrowRight className="ml-2 size-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// === MATCHING LESSON ===
function MatchingLesson({ pairs, onComplete }: { pairs: MatchingPair[]; onComplete: (correct: number) => void }) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const shuffledMatches = useState(() =>
    [...pairs.map(p => p.match)].sort(() => Math.random() - 0.5)
  )[0]

  useEffect(() => {
    if (matched.size === pairs.length) {
      setTimeout(() => onComplete(correctCount), 800)
    }
  }, [matched.size, pairs.length, correctCount, onComplete])

  const handleMatch = (matchText: string) => {
    if (!selectedItem) return
    const pair = pairs.find(p => p.item === selectedItem)
    if (pair?.match === matchText) {
      setMatched(prev => new Set([...prev, selectedItem]))
      setCorrectCount(c => c + 1)
      setSelectedItem(null)
    } else {
      setWrongPair(matchText)
      setTimeout(() => setWrongPair(null), 600)
    }
  }

  return (
    <div className="space-y-4">
      <Progress value={(matched.size / pairs.length) * 100} className="h-2" />
      <p className="text-center text-xs text-muted-foreground font-semibold">Match items to their descriptions</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column — items */}
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-center mb-1">Items</p>
          {pairs.map(p => (
            <button
              key={p.item}
              onClick={() => !matched.has(p.item) && setSelectedItem(p.item)}
              disabled={matched.has(p.item)}
              className={cn(
                "w-full p-3 rounded-xl text-xs font-semibold text-left transition-all border-2",
                matched.has(p.item)
                  ? "bg-emerald-100 dark:bg-emerald-950/20 border-emerald-300 text-emerald-700 dark:text-emerald-300"
                  : selectedItem === p.item
                  ? "border-primary bg-primary/10 shadow-md scale-[1.02]"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {matched.has(p.item) ? "✅ " : ""}{p.item}
            </button>
          ))}
        </div>

        {/* Right column — matches */}
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider text-center mb-1">Descriptions</p>
          {shuffledMatches.map(m => {
            const isMatched = pairs.some(p => p.match === m && matched.has(p.item))
            return (
              <button
                key={m}
                onClick={() => handleMatch(m)}
                disabled={isMatched || !selectedItem}
                className={cn(
                  "w-full p-3 rounded-xl text-xs text-left transition-all border-2",
                  isMatched
                    ? "bg-emerald-100 dark:bg-emerald-950/20 border-emerald-300 text-emerald-700 dark:text-emerald-300"
                    : wrongPair === m
                    ? "border-red-400 bg-red-50 dark:bg-red-950/20 animate-shake"
                    : selectedItem
                    ? "border-border bg-card hover:border-accent/50 hover:bg-accent/5 cursor-pointer"
                    : "border-border bg-card opacity-60"
                )}
              >
                {isMatched ? "✅ " : ""}{m}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// === CHOICE LESSON (quiz + safe-spot) — Duolingo-style: pick, CHECK, feedback bar, CONTINUE ===
function ChoiceLesson({ lesson, onComplete }: { lesson: Lesson; onComplete: (correct: number) => void }) {
  const questions = useMemo(
    () => getChoiceQuestions(lesson).map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) })),
    [lesson]
  )
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const q = questions[idx]
  if (!q) return <p className="text-center text-sm text-muted-foreground">No questions for this lesson yet.</p>

  const pickedOpt = picked !== null ? q.options[picked] : null
  const correctOpt = q.options.find(o => o.correct)!
  const isRight = !!pickedOpt?.correct

  const check = () => {
    if (picked === null) return
    setChecked(true)
    if (isRight) setCorrectCount(c => c + 1)
  }
  const next = () => {
    const total = correctCount
    if (idx + 1 >= questions.length) return onComplete(total)
    setIdx(i => i + 1); setPicked(null); setChecked(false)
  }

  return (
    <div className="space-y-5">
      <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-[#58cc02] transition-all duration-500" style={{ width: `${((idx + (checked ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <h2 className="font-headline text-xl font-bold leading-snug">{q.prompt}</h2>

      <div className="space-y-3">
        {q.options.map((o, i) => {
          const isPicked = picked === i
          const state = !checked
            ? isPicked ? "border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300" : "border-border bg-card hover:bg-muted/60"
            : o.correct ? "border-[#58cc02] bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300"
            : isPicked ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
            : "border-border bg-card opacity-60"
          return (
            <button
              key={o.label}
              disabled={checked}
              onClick={() => setPicked(i)}
              className={cn("w-full text-left p-4 rounded-2xl border-2 border-b-4 font-semibold text-sm transition-all active:translate-y-px", state)}
            >
              {o.label}
            </button>
          )
        })}
      </div>

      {!checked ? (
        <Button
          onClick={check}
          disabled={picked === null}
          className="w-full h-12 rounded-2xl bg-[#58cc02] hover:bg-[#4fb802] border-b-4 border-[#46a302] font-extrabold tracking-wide text-white disabled:bg-muted disabled:text-muted-foreground disabled:border-border"
        >
          CHECK
        </Button>
      ) : (
        <div className={cn("rounded-2xl p-4 animate-scale-in", isRight ? "bg-green-100 dark:bg-green-950/30" : "bg-red-100 dark:bg-red-950/30")}>
          <div className="flex items-center gap-2 mb-1">
            {isRight ? <CheckCircle className="size-6 text-[#58cc02]" /> : <XCircle className="size-6 text-red-500" />}
            <p className={cn("font-headline font-extrabold text-lg", isRight ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-300")}>
              {isRight ? "Nicely done!" : "Not quite"}
            </p>
          </div>
          {!isRight && <p className="text-sm font-semibold text-red-700 dark:text-red-300">Correct answer: {correctOpt.label}</p>}
          <p className="text-sm mt-1 text-foreground/80">{(isRight ? correctOpt : pickedOpt)?.explanation || correctOpt.explanation}</p>
          <Button
            onClick={next}
            className={cn("mt-3 w-full h-12 rounded-2xl border-b-4 font-extrabold tracking-wide text-white",
              isRight ? "bg-[#58cc02] hover:bg-[#4fb802] border-[#46a302]" : "bg-red-500 hover:bg-red-600 border-red-700")}
          >
            {idx + 1 >= questions.length ? "FINISH" : "CONTINUE"}
          </Button>
        </div>
      )}
    </div>
  )
}

// === COMPLETION SCREEN ===
function CompletionScreen({ correctAnswers, totalAnswers, xpEarned, onContinue }: {
  correctAnswers: number; totalAnswers: number; xpEarned: number; onContinue: () => void
}) {
  const percentage = Math.round((correctAnswers / totalAnswers) * 100)

  return (
    <div className="text-center space-y-5 animate-scale-in">
      <Card className="overflow-hidden shadow-lg">
        <div className="gradient-hero-student p-8 pattern-dots-light">
          <div className="text-5xl mb-3 animate-float">
            {percentage >= 80 ? "🏆" : percentage >= 50 ? "⭐" : "💪"}
          </div>
          <h2 className="font-headline text-2xl font-bold text-white">Lesson Complete!</h2>
        </div>
        <CardContent className="p-6 space-y-5">
          <div>
            <p className="text-4xl font-headline font-bold animate-count-up">{correctAnswers}/{totalAnswers}</p>
            <p className="text-sm text-muted-foreground mt-1">Questions Correct</p>
          </div>

          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-xl">
              <Zap className="size-5 text-amber-500" />
              <span className="font-headline font-bold text-amber-700 dark:text-amber-300">+{xpEarned}</span>
              <span className="text-xs text-amber-600/60">XP</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 px-4 py-2 rounded-xl">
              <Sparkles className="size-5 text-purple-500" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">{percentage}%</span>
            </div>
          </div>

          <Button onClick={onContinue} size="lg" className="w-full font-bold">
            Continue <ArrowRight className="ml-2 size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// === MAIN LESSON PAGE ===
export default function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = use(params)
  const router = useRouter()
  const { profile, addXP } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)

  useEffect(() => {
    if (profile?.uid) {
      setProgress(getUserProgress(profile.uid))
    }
  }, [profile?.uid])

  // Find lesson across both primary and secondary units
  let lesson: Lesson | undefined
  let lessonTier: "primary" | "secondary" = "primary"
  const found = findLessonById(lessonId)
  if (found) {
    lesson = found.lesson
    lessonTier = found.tier
  }

  if (!lesson) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button onClick={() => router.push("/safety-path")} className="mt-4">Back to Path</Button>
      </div>
    )
  }

  if (!progress) {
    return <div className="flex items-center justify-center min-h-[60vh] animate-pulse text-muted-foreground">Loading...</div>
  }

  // Check if unlocked
  if (!isLessonUnlocked(lesson.id, progress.completedLessons) && !progress.completedLessons.includes(lesson.id)) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-4xl mb-4">🔒</div>
        <p className="font-semibold text-lg">Lesson Locked</p>
        <p className="text-muted-foreground text-sm mt-1">Complete previous lessons to unlock this one.</p>
        <Button onClick={() => router.push("/safety-path")} variant="outline" className="mt-4">Back to Path</Button>
      </div>
    )
  }

  const handleComplete = (correct: number) => {
    setCorrectAnswers(correct)
    if (!profile?.uid) return
    const newProgress = completeLesson(profile.uid, lesson!.id, correct)
    const earned = (correct * 5) + 15 // keep in sync with XP_PER_CORRECT / XP_LESSON_BONUS
    setXpEarned(earned)
    addXP(earned)
    setProgress(newProgress)
    setIsComplete(true)
  }

  if (isComplete) {
    const totalItems = getLessonItemCount(lesson, lessonTier)

    return (
      <div className="max-w-lg mx-auto py-6">
        <CompletionScreen
          correctAnswers={correctAnswers}
          totalAnswers={totalItems}
          xpEarned={xpEarned}
          onContinue={() => router.push("/safety-path")}
        />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button onClick={() => router.push("/safety-path")} variant="ghost" size="sm" className="gap-1.5">
          <X className="size-4" /> Close
        </Button>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: progress.maxHearts }).map((_, i) => (
            <Heart
              key={i}
              className={cn("size-5", i < progress.hearts ? "text-red-500" : "text-muted")}
              fill={i < progress.hearts ? "currentColor" : "none"}
            />
          ))}
        </div>
      </div>

      {/* Lesson title */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-2 text-[10px]">{lesson.type.replace("-", " ").toUpperCase()}</Badge>
        <h1 className="font-headline text-lg font-bold">{lesson.title}</h1>
        <p className="text-xs text-muted-foreground">{lesson.description}</p>
      </div>

      {/* Render lesson by type */}
      {(lesson.type === "dos-donts") && (
        <DosDontsLesson
          items={(lessonTier === "secondary" ? secondaryDosDontsData : dosDontsData)[lesson.disasterType] || dosDontsData["General Safety"]}
          onComplete={handleComplete}
        />
      )}
      {(lesson.type === "matching") && (
        <MatchingLesson
          pairs={(lessonTier === "secondary" ? secondaryMatchingData : matchingData)[lesson.disasterType] || matchingData["Earthquake"]}
          onComplete={handleComplete}
        />
      )}
      {(lesson.type === "quiz" || lesson.type === "safe-spot") && (
        <ChoiceLesson lesson={lesson} onComplete={handleComplete} />
      )}
    </div>
  )
}
