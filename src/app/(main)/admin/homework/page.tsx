"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, Users, Send, PlayCircle, AlertTriangle, RefreshCw, CheckCircle, RotateCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getModulesByTier, type Module, getModuleById } from "@/lib/modules-data"
import { getTierLabel } from "@/lib/school-codes"
import { SEED_SCHOOLS } from "@/lib/firestore-collections"
import { cn } from "@/lib/utils"
import {
  createModuleAssignment, getAssignments, getSchoolStatuses,
  type ModuleAssignment, type SchoolAssignmentStatus,
  reassignModule
} from "@/lib/module-assignments"

export default function AdminHomeworkPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<"assign" | "active" | "overdue">("assign")
  const [tierTab, setTierTab] = useState<"primary" | "secondary">("primary")
  
  const [modules, setModules] = useState<Module[]>([])
  const [activeAssignments, setActiveAssignments] = useState<(ModuleAssignment & { statuses: SchoolAssignmentStatus[] })[]>([])
  const [overdueAssignments, setOverdueAssignments] = useState<(ModuleAssignment & { statuses: SchoolAssignmentStatus[] })[]>([])
  const [loading, setLoading] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const allAssignments = await getAssignments()
      
      const activeData = []
      const overdueData = []

      for (const assignment of allAssignments) {
        const statuses = await getSchoolStatuses(assignment.id)
        const combined = { ...assignment, statuses }

        if (assignment.status === "active") {
          activeData.push(combined)
        } else if (assignment.status === "expired") {
          const hasOverdueSchools = statuses.some(s => s.status === "overdue")
          if (hasOverdueSchools) {
            overdueData.push(combined)
          }
        }
      }

      setActiveAssignments(activeData)
      setOverdueAssignments(overdueData)
    } catch (err) {
      console.error("Failed to load assignments", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setModules(getModulesByTier(tierTab))
  }, [tierTab])

  useEffect(() => {
    if (activeTab !== "assign") {
      loadData()
    }
  }, [activeTab])

  const handleAssign = async (module: Module) => {
    if (!profile) return
    
    if (!confirm(`Assign ${module.title} to ALL schools? This gives a 5-day deadline.`)) return

    setAssigningId(module.id)
    try {
      await createModuleAssignment(
        module,
        ["all"],
        profile.uid,
        profile.displayName || "Admin"
      )
      alert("Module assigned successfully!")
      setActiveTab("active") // Switch to active tab to see it
    } catch (err) {
      console.error(err)
      alert("Failed to assign module")
    } finally {
      setAssigningId(null)
    }
  }

  const handleReassign = async (assignmentId: string, moduleId: string, schoolIds: string[]) => {
    if (!profile) return
    
    if (!confirm(`Reassign this module to ${schoolIds.length} overdue school(s)? They will get a new 5-day deadline.`)) return

    try {
      await reassignModule(
        moduleId,
        schoolIds,
        profile.uid,
        profile.displayName || "Admin",
        assignmentId
      )
      alert("Module reassigned successfully!")
      loadData()
    } catch (err) {
      console.error(err)
      alert("Failed to reassign module")
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-hero-admin p-6 md:p-8 animate-fade-up pattern-dots-light">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <BookOpen className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold text-white">Module Assignments</h1>
              <p className="text-white/70 text-sm mt-0.5">Assign modules, track progress, and manage deadlines</p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={async () => {
              if (!confirm("This will delete older duplicate assignments. Continue?")) return;
              try {
                const { collection, getDocs, orderBy, query, deleteDoc, doc } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");
                
                // Get all assignments ordered by date desc (newest first)
                const q = query(collection(db, "moduleAssignments"), orderBy("assignedAt", "desc"));
                const snap = await getDocs(q);
                
                if (snap.size <= 1) {
                  alert("No duplicates found!");
                  return;
                }
                
                const docs = snap.docs;
                const toKeep = docs[0]; // newest
                const toDelete = docs.slice(1); // older ones
                
                console.log("Keeping:", toKeep.id);
                let deletedCount = 0;
                
                for (const item of toDelete) {
                  console.log("Deleting:", item.id);
                  // Delete subcollection docs first
                  const statuses = await getDocs(collection(db, `moduleAssignments/${item.id}/schoolStatus`));
                  for (const s of statuses.docs) {
                    await deleteDoc(s.ref);
                  }
                  // Delete main doc
                  await deleteDoc(item.ref);
                  deletedCount++;
                }
                
                alert(`Cleaned up! Deleted ${deletedCount} older assignments.`);
                window.location.reload();
              } catch (err) {
                console.error(err);
                alert("Error cleaning up: " + (err instanceof Error ? err.message : String(err)));
              }
            }}
          >
            Cleanup Duplicates
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="assign">Assign New Module</TabsTrigger>
          <TabsTrigger value="active">Active Assignments</TabsTrigger>
          <TabsTrigger value="overdue">Overdue / Reassign</TabsTrigger>
        </TabsList>

        {/* ==============================================================
            TAB 1: ASSIGN NEW MODULE
            ============================================================== */}
        <TabsContent value="assign" className="space-y-6 animate-fade-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline">Available Curriculum</h2>
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
              <Button 
                variant={tierTab === "primary" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setTierTab("primary")}
              >
                {getTierLabel("primary")}
              </Button>
              <Button 
                variant={tierTab === "secondary" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setTierTab("secondary")}
              >
                {getTierLabel("secondary")}
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map(module => (
              <Card key={module.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b flex items-start gap-4 bg-muted/20">
                  <div className="text-3xl bg-white shadow-sm rounded-xl p-2">{module.icon}</div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1 text-[10px]">Module {module.order}</Badge>
                    <h3 className="font-bold font-headline text-lg leading-tight">{module.title}</h3>
                  </div>
                </div>
                
                <CardContent className="p-4 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{module.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5 bg-muted/50 p-2 rounded-lg">
                      <Clock className="size-3.5" />
                      <span>{module.daysToComplete} Days</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/50 p-2 rounded-lg">
                      <Users className="size-3.5" />
                      <span>All Schools</span>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1 text-xs gap-1.5"
                      onClick={() => window.open(`/module-learn/${module.id}?preview=true`, '_blank')}
                    >
                      <PlayCircle className="size-3.5 text-primary" /> Watch &amp; Preview Video
                    </Button>
                    <Button 
                      onClick={() => handleAssign(module)}
                      disabled={assigningId === module.id}
                      className="flex-1 gap-1.5 text-xs bg-primary"
                    >
                      {assigningId === module.id ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )} 
                      {profile?.role === "Administrator" ? "Assign to Teachers" : "Release to Students"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ==============================================================
            TAB 2: ACTIVE ASSIGNMENTS
            ============================================================== */}
        <TabsContent value="active" className="space-y-6 animate-fade-up">
          {loading ? (
            <div className="flex justify-center p-8"><RefreshCw className="size-6 animate-spin text-muted-foreground" /></div>
          ) : activeAssignments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <CheckCircle className="size-12 mb-4 text-muted/50" />
                <p>No active assignments.</p>
                <Button variant="link" onClick={() => setActiveTab("assign")}>Assign a module</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map(assignment => {
                const now = new Date()
                const deadline = assignment.deadlineAt?.toDate 
                  ? assignment.deadlineAt.toDate() 
                  : (assignment.deadlineAt as any)?.seconds ? new Date((assignment.deadlineAt as any).seconds * 1000) : new Date(assignment.deadlineAt as any || Date.now())
                const diffTime = Math.max(0, deadline.getTime() - now.getTime())
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                return (
                  <Card key={assignment.id} className="overflow-hidden">
                    <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{assignment.moduleIcon}</div>
                        <div>
                          <h3 className="font-bold font-headline">{assignment.moduleName}</h3>
                          <p className="text-xs text-muted-foreground">Assigned by {assignment.assignedByName}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 gap-1.5 py-1">
                        <Clock className="size-3.5" />
                        {daysLeft} days remaining
                      </Badge>
                    </div>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {assignment.statuses.map(status => (
                          <div key={status.schoolId} className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{status.schoolName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {status.status === "pending" && <Badge variant="outline" className="text-muted-foreground">Pending Teacher Release</Badge>}
                                {status.status === "released" && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>}
                                {status.status === "completed" && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>}
                                {status.status === "overdue" && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>}
                              </div>
                            </div>
                            
                            {status.status !== "pending" && status.totalStudents > 0 && (
                              <div className="text-right w-32">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{status.completionRate}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all",
                                      status.completionRate === 100 ? "bg-emerald-500" : "bg-blue-500"
                                    )}
                                    style={{ width: `${status.completionRate}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {status.studentsCompleted}/{status.totalStudents} students
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ==============================================================
            TAB 3: OVERDUE / REASSIGN
            ============================================================== */}
        <TabsContent value="overdue" className="space-y-6 animate-fade-up">
          {loading ? (
            <div className="flex justify-center p-8"><RefreshCw className="size-6 animate-spin text-muted-foreground" /></div>
          ) : overdueAssignments.length === 0 ? (
            <Card className="border-dashed bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-emerald-600">
                <CheckCircle className="size-12 mb-4 opacity-50" />
                <p className="font-medium">All clear!</p>
                <p className="text-sm opacity-80">No schools are currently overdue on any assignments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
              <p className="text-center text-sm text-muted-foreground mb-6">
                The following schools failed to complete their assignments before the deadline.<br/>
                Reassigning will give them a new 5-day deadline, but their ranking penalty for missing the original deadline remains.
              </p>
              
              {overdueAssignments.map(assignment => {
                const overdueSchools = assignment.statuses.filter(s => s.status === "overdue")
                if (overdueSchools.length === 0) return null

                return (
                  <Card key={assignment.id} className="border-red-200 shadow-sm">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border-b border-red-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{assignment.moduleIcon}</div>
                        <div>
                          <h3 className="font-bold font-headline text-red-900 dark:text-red-300">{assignment.moduleName}</h3>
                          <p className="text-xs text-red-700/70">
                            Expired {(assignment.deadlineAt?.toDate 
                              ? assignment.deadlineAt.toDate() 
                              : (assignment.deadlineAt as any)?.seconds ? new Date((assignment.deadlineAt as any).seconds * 1000) : new Date(assignment.deadlineAt as any || Date.now())).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleReassign(
                          assignment.id, 
                          assignment.moduleId, 
                          overdueSchools.map(s => s.schoolId)
                        )}
                      >
                        <RotateCcw className="size-3.5 mr-2" /> Reassign to All ({overdueSchools.length})
                      </Button>
                    </div>
                    <CardContent className="p-0 divide-y">
                      {overdueSchools.map(status => (
                        <div key={status.schoolId} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{status.schoolName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {status.releasedAt ? "Released to students but not completed" : "Teacher never released module"}
                            </p>
                          </div>
                          {status.totalStudents > 0 && (
                            <div className="text-right w-24">
                              <span className="font-medium text-sm">{status.completionRate}%</span>
                              <p className="text-[10px] text-muted-foreground">Completion</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
