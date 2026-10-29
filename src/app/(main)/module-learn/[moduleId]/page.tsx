"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Lock, PlayCircle, Trophy, Zap, AlertTriangle, ChevronRight, RotateCcw, XCircle, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { calculateXP } from "@/lib/homework-tracker"
import { USER_ROLES } from "@/app/constants"
import { getModuleById, type Module } from "@/lib/modules-data"
import { getQuizForModule, QUIZ_PASS_THRESHOLD, type QuizQuestion } from "@/lib/module-quizzes-data"
import { cn } from "@/lib/utils"
import { VIDEO_XP } from "@/lib/modules-data"
import { 
  getActiveAssignmentsForSchool, getSchoolStatus, type ModuleAssignment
} from "@/lib/module-assignments"
import { 
  getStudentModuleProgress, markVideoWatched, submitQuizResult, getCurrentVideoDay, type StudentModuleProgress
} from "@/lib/student-daily-progress"

export default function ModuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleId = params.moduleId as string
  const forceQuiz = searchParams.get("quiz") === "true"
  const isPreviewParam = searchParams.get("preview") === "true" || searchParams.get("admin") === "true"
  
  const { profile, addXP } = useAuth()
  
  // Determine if this is an admin/teacher viewing the module
  const isAdminOrTeacher = profile?.role === USER_ROLES.ADMINISTRATOR || profile?.role === USER_ROLES.TEACHER
  const isPreview = isPreviewParam || isAdminOrTeacher
  
  const [module, setModule] = useState<Module | null>(null)
  const [assignment, setAssignment] = useState<ModuleAssignment | null>(null)
  const [progress, setProgress] = useState<StudentModuleProgress | null>(null)
  const [quizData, setQuizData] = useState<QuizQuestion[]>([])
  
  const [loading, setLoading] = useState(true)
  
  // State machine: "videos" -> "quiz" -> "results"
  const [stage, setStage] = useState<"videos" | "quiz" | "results">("videos")
  const [currentVideoDay, setCurrentVideoDay] = useState<number>(1)
  
  // Quiz state
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean, explanation: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Load data
  useEffect(() => {
    if (!profile) return

    let mounted = true
    const schoolId = profile.schoolId || "kv-bengaluru"
    const uid = profile.uid || "admin-preview"

    async function loadData() {
      try {
        setLoading(true)
        
        const mod = getModuleById(moduleId)
        if (mod) {
          setModule(mod)
          setQuizData(getQuizForModule(moduleId))
        }

        // For admins/teachers: always show video preview mode, skip Firestore assignment lookup
        if (isAdminOrTeacher && mod) {
          if (mounted) {
            const mockAssignment: ModuleAssignment = {
              id: `preview-${mod.id}`,
              moduleId: mod.id,
              moduleName: mod.title,
              moduleIcon: mod.icon,
              tier: "primary",
              assignedBy: "admin",
              assignedByName: "Admin",
              assignedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
              deadlineAt: { seconds: (Date.now() + 7 * 86400000) / 1000, nanoseconds: 0 } as any,
              targetSchools: ["all"],
              status: "active",
            }
            setAssignment(mockAssignment)
            // For admin preview: start at videos stage, day 1, NOT quiz/results
            setStage("videos")
            setCurrentVideoDay(1)
          }
          return
        }

        // Student flow: look up active assignments from Firestore
        const active = await getActiveAssignmentsForSchool(schoolId)
        let foundAssignment: ModuleAssignment | null = null
        
        for (const a of active) {
          const status = await getSchoolStatus(a.id, schoolId)
          if (status?.status === "released" && a.moduleId === moduleId) {
            foundAssignment = a
            break
          }
        }

        if (mounted) {
          if (foundAssignment) {
            setAssignment(foundAssignment)
            const p = await getStudentModuleProgress(uid, foundAssignment.id)
            setProgress(p)
            
            if (p) {
              if (p.status === "completed" || p.quizResult) {
                setStage("results")
              } else if (p.allVideosCompleted || forceQuiz) {
                setStage("quiz")
              } else {
                setStage("videos")
                setCurrentVideoDay(getCurrentVideoDay(p))
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load module details", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    loadData()
    return () => { mounted = false }
  }, [profile, moduleId, forceQuiz, isAdminOrTeacher])

  if (!profile) return null

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading mission details...</div>
  }

  if (!module || !assignment) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4 animate-fade-up">
        <div className="size-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <Lock className="size-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-headline font-bold">Mission Locked</h1>
        <p className="text-muted-foreground">This module is not currently assigned to your school or has expired.</p>
        <Button onClick={() => router.push(isAdminOrTeacher ? "/admin/homework" : "/module-learn")} variant="outline">
          <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
        </Button>
      </div>
    )
  }

  const handleMarkWatched = async () => {
    if (!profile?.uid || !assignment || currentVideoDay < 1) return
    
    // In admin preview mode, just advance to next video or quiz
    if (isAdminOrTeacher) {
      const totalVideos = module.videos?.length || 5
      if (currentVideoDay < totalVideos) {
        setCurrentVideoDay(d => d + 1)
      } else {
        setStage("quiz")
      }
      return
    }
    
    try {
      setSubmitting(true)
      const firstWatch = !progress?.videosWatched?.[currentVideoDay]
      await markVideoWatched(profile.uid, assignment.id, currentVideoDay)
      if (firstWatch) await addXP(VIDEO_XP)
      router.push("/module-learn") // Go back to timeline
    } catch (err) {
      console.error(err)
      alert("Failed to mark as watched")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnswer = (selectedIndex: number) => {
    if (feedback) return // prevent double click
    const question = quizData[currentQIdx]
    const correct = selectedIndex === question.correctIndex
    if (correct) setCorrectCount(c => c + 1)
    setFeedback({ correct, explanation: question.explanation })
  }

  const nextQuestion = async () => {
    const wasLastQuestion = currentQIdx + 1 >= quizData.length
    
    if (wasLastQuestion) {
      const finalCorrect = correctCount + (feedback?.correct ? 1 : 0)
      const scorePercent = Math.round((finalCorrect / quizData.length) * 100)
      const passed = scorePercent >= (QUIZ_PASS_THRESHOLD * 100)
      
      // In admin preview, just show results locally without writing to Firestore
      if (isAdminOrTeacher) {
        setProgress({
          assignmentId: assignment.id,
          moduleId: module.id,
          schoolId: "admin-preview",
          startedAt: new Date().toISOString(),
          videosWatched: { 1: { watchedAt: "" }, 2: { watchedAt: "" }, 3: { watchedAt: "" }, 4: { watchedAt: "" }, 5: { watchedAt: "" } },
          currentDay: 6,
          lastVideoWatchedDate: new Date().toISOString(),
          allVideosCompleted: true,
          quizUnlocked: true,
          quizResult: { score: scorePercent, passed, completedAt: new Date().toISOString(), attempts: 1 },
          status: passed ? "completed" : "in_progress",
          completedAt: passed ? new Date().toISOString() : null,
        } as StudentModuleProgress)
        setStage("results")
        return
      }
      
      if (profile?.uid && assignment) {
        setSubmitting(true)
        try {
          const alreadyDone = progress?.status === "completed" // award module XP only on the first pass
          const updatedProgress = await submitQuizResult(profile.uid, assignment.id, scorePercent, passed)
          if (passed && !alreadyDone) {
            const { xpEarned } = calculateXP(module, new Date(), assignment.deadlineAt?.toDate?.() ?? new Date(8.64e15))
            // videos already paid VIDEO_XP each; the quiz pays the remainder of the module total
            const paid = Object.keys(progress?.videosWatched || {}).length * VIDEO_XP
            if (xpEarned - paid > 0) await addXP(xpEarned - paid)
          }
          setProgress(updatedProgress)
          setStage("results")
        } catch (err) {
          console.error(err)
        } finally {
          setSubmitting(false)
        }
      }
    } else {
      setFeedback(null)
      setCurrentQIdx(i => i + 1)
    }
  }

  const handleRetryQuiz = () => {
    setStage("quiz")
    setCurrentQIdx(0)
    setCorrectCount(0)
    setFeedback(null)
  }

  const passed = progress?.quizResult?.passed || false
  const moduleXP = calculateXP(
    module,
    progress?.completedAt ? new Date(progress.completedAt) : new Date(),
    assignment?.deadlineAt?.toDate?.() ?? new Date(8.64e15)
  ).xpEarned
  const totalVideos = module.videos?.length || 5

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      <Button onClick={() => router.push(isAdminOrTeacher ? "/admin/homework" : "/module-learn")} variant="outline" size="sm" className="mb-2">
        <ArrowLeft className="mr-2 size-4" /> {isAdminOrTeacher ? "Back to Homework Management" : "Back to Timeline"}
      </Button>

      {isPreview && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Eye className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-headline font-bold text-xs text-amber-800 dark:text-amber-300">Admin Preview Mode</p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Previewing video lessons and quiz content for {module.title}. No data is saved.</p>
            </div>
          </div>
          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[10px] uppercase font-bold shrink-0">
            PREVIEW
          </Badge>
        </div>
      )}

      {/* Header */}
      <Card className="overflow-hidden shadow-sm border-2 border-border/50">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
          <div className="flex items-start gap-4">
            <div className="text-5xl bg-white dark:bg-muted p-3 rounded-2xl shadow-sm">{module.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Module {module.order}</Badge>
              </div>
              <h1 className="font-headline font-bold text-2xl">{module.title}</h1>
              <p className="text-muted-foreground mt-1">{module.description}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ========== ADMIN/TEACHER: VIDEO DAY SELECTOR ========== */}
      {isAdminOrTeacher && stage === "videos" && (
        <Card className="shadow-sm border border-border/50">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Select Video Day to Preview</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: totalVideos }, (_, i) => i + 1).map(day => (
                <Button
                  key={day}
                  variant={currentVideoDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentVideoDay(day)}
                  className={cn(
                    "gap-1.5 text-xs font-semibold",
                    currentVideoDay === day && "bg-primary shadow-md"
                  )}
                >
                  <PlayCircle className="size-3.5" />
                  Day {day}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStage("quiz"); setCurrentQIdx(0); setCorrectCount(0); setFeedback(null) }}
                className="gap-1.5 text-xs font-semibold ml-auto text-primary border-primary/30"
              >
                <CheckCircle className="size-3.5" />
                Preview Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== STAGE: VIDEOS ========== */}
      {stage === "videos" && currentVideoDay > 0 && currentVideoDay <= (module.videos?.length || 0) && (
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Day {currentVideoDay} Training</span>
              <Badge variant="outline">Video {currentVideoDay} of {totalVideos}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mb-6 shadow-sm">
              <iframe
                key={`video-${currentVideoDay}-${module.videos![currentVideoDay-1].url}`}
                className="w-full h-full"
                src={module.videos![currentVideoDay-1].url}
                title={module.videos![currentVideoDay-1].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <h3 className="text-center text-lg font-bold mb-6">
              {module.videos![currentVideoDay-1].title}
            </h3>

            <div className="flex justify-center">
              <Button 
                size="lg"
                onClick={handleMarkWatched}
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 font-bold px-8 btn-lift"
              >
                {submitting ? "Saving..." : isAdminOrTeacher ? (
                  <>
                    <ChevronRight className="size-5" />
                    {currentVideoDay < totalVideos ? `Next Video (Day ${currentVideoDay + 1})` : "Preview Quiz →"}
                  </>
                ) : (
                  <><CheckCircle className="size-5" /> I have watched this video</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== STAGE: QUIZ ========== */}
      {stage === "quiz" && quizData.length > 0 && (
        <Card className="shadow-lg border-primary/20 animate-scale-in">
          <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
              <span>Question {currentQIdx + 1} of {quizData.length}</span>
              <span>Correct: {correctCount}/{currentQIdx + (feedback ? 1 : 0)}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full mt-3">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300" 
                style={{ width: `${((currentQIdx + (feedback ? 1 : 0)) / quizData.length) * 100}%` }} 
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6">{quizData[currentQIdx].question}</h2>
            
            <div className="space-y-3">
              {quizData[currentQIdx].options.map((opt, idx) => {
                const hasAnswered = feedback !== null
                const isCorrectOption = idx === quizData[currentQIdx].correctIndex
                let btnClass = "justify-start h-auto py-4 px-5 text-left font-normal"
                
                if (hasAnswered) {
                  if (isCorrectOption) {
                    btnClass = cn(btnClass, "bg-emerald-100 border-emerald-500 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-100")
                  } else {
                    btnClass = cn(btnClass, "opacity-50")
                  }
                }

                return (
                  <Button 
                    key={idx}
                    variant="outline"
                    className={btnClass}
                    onClick={() => handleAnswer(idx)}
                    disabled={hasAnswered}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-3 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 whitespace-normal break-words">{opt}</span>
                    {hasAnswered && isCorrectOption && <CheckCircle className="size-5 text-emerald-600 shrink-0 ml-2" />}
                  </Button>
                )
              })}
            </div>
            
            {feedback && (
              <div className={cn(
                "mt-6 p-4 rounded-xl border animate-fade-up",
                feedback.correct 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200" 
                  : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:text-red-200"
              )}>
                <div className="flex items-start gap-3">
                  {feedback.correct ? <CheckCircle className="size-5 mt-0.5" /> : <AlertTriangle className="size-5 mt-0.5" />}
                  <div>
                    <p className="font-bold mb-1">{feedback.correct ? "Correct!" : "Incorrect"}</p>
                    <p className="text-sm opacity-90">{feedback.explanation}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={nextQuestion} disabled={submitting} className={feedback.correct ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                    {submitting ? "Saving..." : currentQIdx + 1 >= quizData.length ? "Finish Quiz" : "Next Question"} 
                    {!submitting && <ChevronRight className="ml-2 size-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Admin: Back to Videos button */}
            {isAdminOrTeacher && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => { setStage("videos"); setCurrentVideoDay(1) }} className="gap-1.5 text-xs">
                  <ArrowLeft className="size-3.5" /> Back to Video Preview
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========== STAGE: RESULTS ========== */}
      {stage === "results" && progress?.quizResult && (
        <Card className="text-center overflow-hidden border-2 border-primary/20 shadow-xl animate-scale-in">
          <div className={cn(
            "p-8 sm:p-12 pattern-dots-light",
            passed 
              ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
              : "bg-gradient-to-br from-red-500 to-orange-600"
          )}>
            <div className="size-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 animate-bounce">
              {passed ? <Trophy className="size-10 text-white" /> : <XCircle className="size-10 text-white" />}
            </div>
            <h2 className="text-3xl font-headline font-bold text-white mb-2">
              {passed ? "Module Completed!" : "Quiz Not Passed"}
            </h2>
            <p className="text-white/80">
              {passed 
                ? `Great job! You've mastered ${module.title}!`
                : `You need at least ${QUIZ_PASS_THRESHOLD * 100}% to pass. Try again!`
              }
            </p>
          </div>
          
          <CardContent className="p-8">
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              <div className="bg-muted rounded-2xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Quiz Score</p>
                <p className={cn(
                  "text-3xl font-bold font-headline",
                  passed ? "text-emerald-600" : "text-red-500"
                )}>
                  {progress.quizResult.score}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Need {QUIZ_PASS_THRESHOLD * 100}% to pass
                </p>
              </div>
              <div className={cn(
                "rounded-2xl p-4 border",
                passed 
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50" 
                  : "bg-muted border-border"
              )}>
                <p className="text-sm text-muted-foreground mb-1">XP Earned</p>
                <div className={cn(
                  "flex items-center justify-center gap-1.5",
                  passed ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                )}>
                  <Zap className="size-5" />
                  <p className="text-3xl font-bold font-headline">
                    {passed ? moduleXP : 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push(isAdminOrTeacher ? "/admin/homework" : "/module-learn")} className="sm:w-40">
                {isAdminOrTeacher ? "Back to Homework" : "Back to Timeline"}
              </Button>
              {!passed && (
                <Button onClick={handleRetryQuiz} className="sm:w-48 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 gap-2">
                  <RotateCcw className="size-4" /> Retry Quiz
                </Button>
              )}
              {isAdminOrTeacher && (
                <Button variant="outline" onClick={() => { setStage("videos"); setCurrentVideoDay(1) }} className="sm:w-48 gap-2">
                  <PlayCircle className="size-4" /> Review Videos Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
