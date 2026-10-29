"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ClipboardCheck, CheckCircle, XCircle, AlertTriangle, ArrowRight, RotateCcw, Download, Sparkles, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getSchools, type SchoolDoc } from "@/lib/firestore-collections"

// ---------------- Admin View Component ----------------
function AdminSafetyAuditView() {
  const [schools, setSchools] = useState<SchoolDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSchools()
        setSchools(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8"><span className="animate-pulse">Loading schools...</span></div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Building2 className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">Safety Audit Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor NDMA safety compliance across all registered schools</p>
        </div>
      </div>

      <div className="grid gap-4">
        {schools.map(school => {
          const score = school.stats?.lastAuditScore
          const grade = school.stats?.lastAuditGrade || "N/A"
          const date = school.stats?.lastAuditDate 
            ? new Date(school.stats.lastAuditDate).toLocaleDateString()
            : "Not completed"
          
          return (
            <Card key={school.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-lg">{school.name}</h3>
                  <p className="text-sm text-muted-foreground">{school.region}, {school.state}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Last Audit</p>
                    <p className="font-medium text-sm">{date}</p>
                  </div>
                  
                  {score != null ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-2xl">{score}%</p>
                        <p className={cn("text-xs font-semibold", 
                          score >= 90 ? "text-emerald-400" :
                          score >= 75 ? "text-green-400" :
                          score >= 60 ? "text-yellow-400" :
                          score >= 40 ? "text-orange-400" : "text-red-400"
                        )}>{grade}</p>
                      </div>
                      <Progress value={score} className="w-24 h-2" />
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground bg-muted/50">
                      Pending Audit
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
// --------------------------------------------------------

type AuditQuestion = {
  id: string
  category: "structural" | "non_structural" | "capacity" | "communication" | "emergency"
  categoryLabel: string
  question: string
  weight: number // Importance weight for scoring
}

const auditQuestions: AuditQuestion[] = [
  // Structural Safety
  { id: "s1", category: "structural", categoryLabel: "Structural Safety", question: "Is the school building constructed as per the National Building Code (NBC)?", weight: 3 },
  { id: "s2", category: "structural", categoryLabel: "Structural Safety", question: "Has the building undergone structural safety assessment in the last 5 years?", weight: 3 },
  { id: "s3", category: "structural", categoryLabel: "Structural Safety", question: "Are all exits and stairways clear of obstructions?", weight: 2 },
  { id: "s4", category: "structural", categoryLabel: "Structural Safety", question: "Is the school located away from flood-prone / landslide-prone areas?", weight: 2 },

  // Non-Structural Safety
  { id: "ns1", category: "non_structural", categoryLabel: "Non-Structural Safety", question: "Are heavy objects (almirahs, shelves, ACs) properly anchored to walls?", weight: 2 },
  { id: "ns2", category: "non_structural", categoryLabel: "Non-Structural Safety", question: "Are fire extinguishers available on every floor and in working condition?", weight: 3 },
  { id: "ns3", category: "non_structural", categoryLabel: "Non-Structural Safety", question: "Is the electrical wiring concealed and regularly inspected?", weight: 2 },
  { id: "ns4", category: "non_structural", categoryLabel: "Non-Structural Safety", question: "Are evacuation route maps displayed in every classroom and corridor?", weight: 2 },

  // Capacity Building
  { id: "c1", category: "capacity", categoryLabel: "Capacity Building", question: "Does the school conduct at least 2 mock drills per year (as per NDMA mandate)?", weight: 3 },
  { id: "c2", category: "capacity", categoryLabel: "Capacity Building", question: "Is there a trained School Disaster Management Committee?", weight: 3 },
  { id: "c3", category: "capacity", categoryLabel: "Capacity Building", question: "Have teachers received first-aid training?", weight: 2 },
  { id: "c4", category: "capacity", categoryLabel: "Capacity Building", question: "Are students aware of Duck-Cover-Hold for earthquakes?", weight: 2 },

  // Communication
  { id: "cm1", category: "communication", categoryLabel: "Communication", question: "Is there a functional public address (PA) system or alarm?", weight: 2 },
  { id: "cm2", category: "communication", categoryLabel: "Communication", question: "Are emergency contact numbers displayed prominently?", weight: 2 },
  { id: "cm3", category: "communication", categoryLabel: "Communication", question: "Is there a system to notify parents during emergencies?", weight: 2 },

  // Emergency Preparedness
  { id: "e1", category: "emergency", categoryLabel: "Emergency Preparedness", question: "Does the school have a written School Disaster Management Plan (SDMP)?", weight: 3 },
  { id: "e2", category: "emergency", categoryLabel: "Emergency Preparedness", question: "Is there a designated assembly point for evacuation?", weight: 3 },
  { id: "e3", category: "emergency", categoryLabel: "Emergency Preparedness", question: "Is a first-aid kit available and regularly stocked?", weight: 2 },
  { id: "e4", category: "emergency", categoryLabel: "Emergency Preparedness", question: "Does the school have an emergency water and food supply plan?", weight: 1 },
]

const categoryConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  structural: { emoji: "🏗️", color: "text-blue-400", bg: "bg-blue-500/10" },
  non_structural: { emoji: "🔧", color: "text-amber-400", bg: "bg-amber-500/10" },
  capacity: { emoji: "📚", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  communication: { emoji: "📡", color: "text-purple-400", bg: "bg-purple-500/10" },
  emergency: { emoji: "🚨", color: "text-red-400", bg: "bg-red-500/10" },
}

function getScoreGrade(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-400", emoji: "🏆" }
  if (score >= 75) return { label: "Good", color: "text-green-400", emoji: "✅" }
  if (score >= 60) return { label: "Fair", color: "text-yellow-400", emoji: "⚠️" }
  if (score >= 40) return { label: "Poor", color: "text-orange-400", emoji: "🔶" }
  return { label: "Critical", color: "text-red-400", emoji: "🚨" }
}

export default function SafetyAuditPage() {
  const { profile } = useAuth()
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({})
  const [showResults, setShowResults] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(0)
  
  // New states for integration
  const [started, setStarted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previousScore, setPreviousScore] = useState<{ score: number, grade: string, date: string } | null>(null)
  
  // Restrict to Teachers and Admins
  if (profile?.role === "Student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-muted/50 rounded-full">
          <ClipboardCheck className="size-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold font-headline">School Safety Audit</h2>
        <p className="text-muted-foreground max-w-md">
          This audit is meant for school administrators and teachers to assess compliance with the NDMA School Safety Policy (2016).
        </p>
      </div>
    )
  }

  // Admin View
  if (profile?.role === "Administrator") {
    return <AdminSafetyAuditView />
  }

  const categories = [...new Set(auditQuestions.map(q => q.category))]
  const categoryQuestions = auditQuestions.filter(q => q.category === categories[currentCategory])

  const totalAnswered = Object.keys(answers).length
  const totalQuestions = auditQuestions.length
  const progress = (totalAnswered / totalQuestions) * 100

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const calculateScore = () => {
    let totalWeight = 0
    let earnedWeight = 0

    auditQuestions.forEach(q => {
      totalWeight += q.weight
      if (answers[q.id] === true) {
        earnedWeight += q.weight
      }
    })

    return Math.round((earnedWeight / totalWeight) * 100)
  }

  const getCategoryScore = (category: string) => {
    const catQuestions = auditQuestions.filter(q => q.category === category)
    let total = 0, earned = 0
    catQuestions.forEach(q => {
      total += q.weight
      if (answers[q.id] === true) earned += q.weight
    })
    return total > 0 ? Math.round((earned / total) * 100) : 0
  }

  // Fetch previous score on mount
  useEffect(() => {
    async function loadPreviousScore() {
      if (!profile?.schoolId || profile.schoolId === "admin-system") return;
      try {
        const schoolRef = doc(db, "schools", profile.schoolId)
        const snap = await getDoc(schoolRef)
        if (snap.exists()) {
          const stats = snap.data().stats || {}
          if (stats.lastAuditScore != null) {
            setPreviousScore({
              score: stats.lastAuditScore,
              grade: stats.lastAuditGrade || "N/A",
              date: stats.lastAuditDate || ""
            })
            // If already filled by any teacher, count as completed and show results immediately
            setShowResults(true)
            setStarted(true)
          }
        }
      } catch (err) {
        console.error("Failed to load previous score", err)
      }
    }
    loadPreviousScore()
  }, [profile?.schoolId])

  const handleSubmit = async () => {
    if (!profile?.schoolId) return;
    
    setIsSaving(true)
    const score = calculateScore()
    const grade = getScoreGrade(score)
    
    try {
      if (profile.schoolId !== "admin-system") {
        const schoolRef = doc(db, "schools", profile.schoolId)
        await updateDoc(schoolRef, {
          "stats.lastAuditScore": score,
          "stats.lastAuditGrade": grade.label,
          "stats.lastAuditDate": new Date().toISOString()
        })
      }
      setPreviousScore({ score, grade: grade.label, date: new Date().toISOString() })
      setShowResults(true)
    } catch (err) {
      console.error("Failed to save audit:", err)
      alert("Failed to save audit results. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setShowResults(false)
    setStarted(false)
    setCurrentCategory(0)
  }

  // Introduction Screen
  if (!started && !showResults) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-2">
            <Building2 className="size-12 text-primary" />
          </div>
          <h1 className="text-3xl font-headline font-bold">School Safety Audit</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Ensure your school complies with the National Disaster Management Authority (NDMA) guidelines and keeps students safe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="size-5 text-primary" />
                Why is this important?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                The <strong>National School Safety Policy (2016)</strong> mandates that all schools undergo regular safety audits to identify vulnerabilities.
              </p>
              <p>
                This AI-driven audit helps you assess structural safety, emergency preparedness, and capacity building. Your score will be saved to your school's profile to track compliance over time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">School</span>
                <span className="font-medium">{profile?.schoolName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{totalQuestions}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-medium">5 minutes</span>
              </div>
              {previousScore && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Last Audit Score</span>
                  <Badge variant="outline" className="font-bold">
                    {previousScore.score}% ({previousScore.grade})
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={() => setStarted(true)} className="px-8 bg-primary">
            Start Safety Audit <ArrowRight className="ml-2 size-5" />
          </Button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const grade = getScoreGrade(score)
    const failedQuestions = auditQuestions.filter(q => answers[q.id] !== true)

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Score Card */}
        <Card className="overflow-hidden animate-fade-up">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-muted/30 rounded-2xl">
              <Sparkles className="size-8 text-primary" />
            </div>
            <h2 className="text-2xl font-headline font-bold">School Safety Score</h2>

            {/* Score circle */}
            <div className="relative inline-flex items-center justify-center">
              <svg className="size-40" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8"
                  className={grade.color}
                  strokeDasharray={`${(score / 100) * 327} 327`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-headline font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>

            <div className={cn("text-lg font-semibold flex items-center justify-center gap-2", grade.color)}>
              <span>{grade.emoji}</span>
              <span>{grade.label}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Based on {totalQuestions} questions aligned with NDMA School Safety Policy 2016 guidelines
            </p>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="animate-fade-up" style={{ "--delay": "100ms" } as React.CSSProperties}>
          <CardHeader>
            <CardTitle className="text-base font-headline">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map(cat => {
              const config = categoryConfig[cat]
              const catScore = getCategoryScore(cat)
              const catGrade = getScoreGrade(catScore)
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-lg">{config.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold">{auditQuestions.find(q => q.category === cat)?.categoryLabel}</span>
                      <span className={cn("text-xs font-bold", catGrade.color)}>{catScore}%</span>
                    </div>
                    <Progress value={catScore} className="h-2" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Failed items / Recommendations */}
        {failedQuestions.length > 0 && (
          <Card className="border-l-4 border-l-amber-500 animate-fade-up" style={{ "--delay": "200ms" } as React.CSSProperties}>
            <CardHeader>
              <CardTitle className="text-base font-headline flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-500" />
                Recommendations ({failedQuestions.length})
              </CardTitle>
              <CardDescription>Areas that need improvement based on NDMA guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {failedQuestions.map(q => (
                <div key={q.id} className="flex items-start gap-2 p-2 bg-amber-950/10 rounded-lg">
                  <XCircle className="size-3.5 text-red-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{q.question}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" /> Retake Audit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
          <Building2 className="size-6 text-primary" />
          Safety Audit: {profile?.schoolName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalQuestions} questions based on NDMA School Safety Policy 2016
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{totalAnswered} of {totalQuestions} answered</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat, i) => {
          const config = categoryConfig[cat]
          const catQuestions = auditQuestions.filter(q => q.category === cat)
          const catAnswered = catQuestions.filter(q => answers[q.id] != null).length
          const isComplete = catAnswered === catQuestions.length

          return (
            <button
              key={cat}
              onClick={() => setCurrentCategory(i)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5",
                currentCategory === i
                  ? `${config.bg} ${config.color} border-current`
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <span>{config.emoji}</span>
              {auditQuestions.find(q => q.category === cat)?.categoryLabel}
              {isComplete && <CheckCircle className="size-3 text-emerald-400" />}
            </button>
          )
        })}
      </div>

      {/* Questions for current category */}
      <div className="space-y-3">
        {categoryQuestions.map((q, i) => (
          <Card
            key={q.id}
            className={cn(
              "animate-fade-up transition-all",
              answers[q.id] === true && "border-emerald-500/30 bg-emerald-950/10",
              answers[q.id] === false && "border-red-500/30 bg-red-950/10",
            )}
            style={{ "--delay": `${i * 60}ms` } as React.CSSProperties}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <p className="text-sm flex-1">{q.question}</p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleAnswer(q.id, true)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    answers[q.id] === true
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "border-border hover:border-emerald-500/30 hover:text-emerald-400"
                  )}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(q.id, false)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    answers[q.id] === false
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "border-border hover:border-red-500/30 hover:text-red-400"
                  )}
                >
                  No
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
          disabled={currentCategory === 0}
        >
          Previous
        </Button>
        {currentCategory < categories.length - 1 ? (
          <Button onClick={() => setCurrentCategory(currentCategory + 1)}>
            Next Category <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={totalAnswered < totalQuestions || isSaving}
            className="bg-accent hover:bg-accent/90"
          >
            {isSaving ? "Saving..." : <><Sparkles className="mr-2 size-4" /> Get Safety Score</>}
          </Button>
        )}
      </div>
    </div>
  )
}
