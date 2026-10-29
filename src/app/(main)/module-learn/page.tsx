"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, CheckCircle, Clock, Lock, PlayCircle, Trophy, Route, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { USER_ROLES } from "@/app/constants"
import { getModuleById, type Module } from "@/lib/modules-data"
import {
  getActiveAssignmentsForSchool, getSchoolStatus, type ModuleAssignment
} from "@/lib/module-assignments"
import {
  getStudentModuleProgress, initializeStudentProgress, type StudentModuleProgress, getVideoProgressSummary
} from "@/lib/student-daily-progress"
import { cn } from "@/lib/utils"

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function ModuleLearnPage() {
  const router = useRouter()
  const { profile } = useAuth()
  
  const [activeAssignment, setActiveAssignment] = useState<ModuleAssignment | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [progress, setProgress] = useState<StudentModuleProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return

    // Guard: Student Module Learning is reserved for student accounts
    if (profile.role === USER_ROLES.ADMINISTRATOR || profile.role === USER_ROLES.TEACHER) {
      router.replace("/admin/homework")
      return
    }

    if (!profile.uid || !profile.schoolId) return

    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        const schoolId = profile!.schoolId
        const uid = profile!.uid
        
        // Find active assignment
        const active = await getActiveAssignmentsForSchool(schoolId)
        let foundAssignment: ModuleAssignment | null = null
        
        for (const a of active) {
          const status = await getSchoolStatus(a.id, schoolId)
          if (status?.status === "released") {
            foundAssignment = a
            break
          }
        }
        
        if (foundAssignment && mounted) {
          setActiveAssignment(foundAssignment)
          const mod = getModuleById(foundAssignment.moduleId)
          if (mod) setModule(mod)
          
          let p = await getStudentModuleProgress(uid, foundAssignment.id)
          if (!p && mod) {
            // Initialize if first time
            p = await initializeStudentProgress(uid, foundAssignment.id, mod.id, schoolId)
          }
          setProgress(p)
        }
      } catch (err) {
        console.error("Failed to load module data", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()
    return () => { mounted = false }
  }, [profile])

  if (!profile) return null

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading mission...</div>
  }

  if (!activeAssignment || !module) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 p-6 md:p-8">
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BookOpen className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">My Learning Modules</h1>
            </div>
          </div>
        </div>
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <CheckCircle className="size-16 mb-4 text-emerald-500 opacity-80" />
            <p className="font-semibold text-xl text-foreground">All caught up! 🎉</p>
            <p className="mt-2">Your teacher will release new content when it's ready.</p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const videoSummary = getVideoProgressSummary(progress)
  const isModuleCompleted = progress?.status === "completed"
  
  const now = new Date()
  const deadline = activeAssignment.deadlineAt?.toDate 
    ? activeAssignment.deadlineAt.toDate() 
    : (activeAssignment.deadlineAt as any)?.seconds ? new Date((activeAssignment.deadlineAt as any).seconds * 1000) : new Date(activeAssignment.deadlineAt as any || Date.now())
  const diffTime = Math.max(0, deadline.getTime() - now.getTime())
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 p-6 md:p-8 pattern-dots-light">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0">
              Active Mission
            </Badge>
            <Badge variant="secondary" className="bg-amber-400 text-amber-900 border-0 gap-1.5 font-bold shadow-lg">
              <Clock className="size-3.5" />
              {daysLeft} days remaining
            </Badge>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            <div className="text-6xl bg-white p-4 rounded-2xl shadow-xl rotate-[-3deg] border-4 border-white/20">
              {module.icon}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-white mb-2">{module.title}</h1>
              <p className="text-white/80 text-sm md:text-base">{module.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Day-by-Day Timeline */}
        <h2 className="font-headline text-xl font-bold mt-4">5-Day Training Plan</h2>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {videoSummary.map((dayInfo, i) => {
            const vid = module.videos?.[i]
            if (!vid) return null
            
            const isActive = dayInfo.available
            const isCompleted = dayInfo.watched
            const isLocked = !isActive && !isCompleted
            
            return (
              <div key={dayInfo.day} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10",
                  isCompleted ? "bg-emerald-500 text-white" : 
                  isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <CheckCircle className="size-4" /> : <span className="text-xs font-bold">{dayInfo.day}</span>}
                </div>
                
                {/* Card */}
                <Card className={cn(
                  "w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] shadow-sm transition-all duration-300",
                  isActive ? "border-primary/50 shadow-md ring-1 ring-primary/20 scale-[1.02]" : 
                  isLocked ? "opacity-60 bg-muted/30" : ""
                )}>
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant={isCompleted ? "default" : isActive ? "outline" : "secondary"} 
                             className={cn("text-[10px]", isCompleted && "bg-emerald-500 hover:bg-emerald-600")}>
                        Day {dayInfo.day}
                      </Badge>
                      {isLocked && <Lock className="size-4 text-muted-foreground" />}
                      {isActive && <div className="size-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    
                    <div>
                      <h4 className={cn("font-semibold text-sm line-clamp-1", !isLocked && "text-primary")}>{vid.title}</h4>
                    </div>
                    
                    <div className="mt-2">
                      {isCompleted ? (
                        <Button variant="ghost" size="sm" className="w-full text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 pointer-events-none">
                          <CheckCircle className="mr-2 size-4" /> Watched
                        </Button>
                      ) : isActive ? (
                        <Button size="sm" className="w-full shadow-sm" asChild>
                          <Link href={`/module-learn/${module.id}`}>
                            <PlayCircle className="mr-2 size-4" /> Watch Now
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full text-muted-foreground" disabled>
                          <Lock className="mr-2 size-3.5" /> Available tomorrow
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Final Quiz Section */}
        {progress?.allVideosCompleted && (
          <div className="mt-8 pt-8 border-t border-dashed animate-fade-up">
            <Card className={cn(
              "overflow-hidden border-2",
              isModuleCompleted ? "border-emerald-500/50" : "border-primary/50 shadow-lg"
            )}>
              <CardContent className={cn(
                "p-8 text-center flex flex-col items-center justify-center",
                isModuleCompleted ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-primary/5 dark:bg-primary/10"
              )}>
                <div className={cn(
                  "size-16 rounded-full flex items-center justify-center mb-4 shadow-sm",
                  isModuleCompleted ? "bg-emerald-100 text-emerald-600" : "bg-primary text-primary-foreground"
                )}>
                  {isModuleCompleted ? <Trophy className="size-8" /> : <Zap className="size-8" />}
                </div>
                
                <h3 className="text-2xl font-headline font-bold mb-2">
                  {isModuleCompleted ? "Module Completed!" : "Final Knowledge Check"}
                </h3>
                
                <p className="text-muted-foreground mb-6 max-w-md">
                  {isModuleCompleted 
                    ? `You passed the quiz with a score of ${progress.quizResult?.score}%. Great job!` 
                    : "You've watched all 5 videos. Now it's time to test your knowledge and earn your XP!"}
                </p>
                
                {isModuleCompleted ? (
                  <div className="flex gap-4">
                    <Badge variant="outline" className="px-3 py-1.5 text-sm gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
                      <CheckCircle className="size-4" /> Passed
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1.5 text-sm gap-1.5 border-amber-200 bg-amber-50 text-amber-700">
                      <Zap className="size-4" /> +{module.xpReward} XP
                    </Badge>
                  </div>
                ) : (
                  <Button size="lg" className="w-full sm:w-auto font-bold px-8 btn-lift" asChild>
                    <Link href={`/module-learn/${module.id}?quiz=true`}>
                      Take Final Quiz <Route className="ml-2 size-5" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
