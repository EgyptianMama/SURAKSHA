"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { 
  Megaphone, Send, Radio, Clock, CheckCircle, AlertTriangle, Bell, Users, Loader2, Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SEED_SCHOOLS } from "@/lib/firestore-collections"
import { 
  sendEmergencyAlert, subscribeToEmergencyAlerts,
  type EmergencyAlertDoc, type AlertSeverity, type AlertRoleTarget
} from "@/lib/alerts-data"

const severityOptions: { value: AlertSeverity; label: string; color: string }[] = [
  { value: "info", label: "ℹ️ Info Advisory", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "warning", label: "⚠️ Warning Alert", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "critical", label: "🔶 Critical Warning", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "emergency", label: "🚨 Emergency Disaster Evacuation", color: "bg-red-500/20 text-red-400 border-red-500/30" },
]

export default function AlertCommandPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [severity, setSeverity] = useState<AlertSeverity>("warning")
  const [targetSchoolId, setTargetSchoolId] = useState("all")
  
  // Target roles: Teachers and Students
  const [targetRoles, setTargetRoles] = useState<AlertRoleTarget[]>(["Teacher", "Student"])
  const [alerts, setAlerts] = useState<EmergencyAlertDoc[]>([])
  const [loading, setLoading] = useState(false)

  // Real-time alerts subscription
  useEffect(() => {
    const unsubscribe = subscribeToEmergencyAlerts((updatedAlerts) => {
      setAlerts(updatedAlerts)
    })
    return () => unsubscribe()
  }, [])

  const toggleRole = (role: AlertRoleTarget) => {
    if (targetRoles.includes(role)) {
      if (targetRoles.length > 1) {
        setTargetRoles(targetRoles.filter(r => r !== role))
      }
    } else {
      setTargetRoles([...targetRoles, role])
    }
  }

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      toast({ title: "Validation Error", description: "Please enter alert title and message.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await sendEmergencyAlert({
        title,
        message,
        severity,
        targetSchoolId,
        targetRoles,
        adminUid: profile?.uid || "admin-system",
        adminName: profile?.displayName || "System Admin",
      })

      toast({
        title: "Emergency Alert Broadcasted! 🚨",
        description: `Alert is now active on top of ${targetSchoolId === "all" ? "All School Dashboards" : "Target School Dashboard"}.`,
      })

      // Reset form
      setTitle("")
      setMessage("")
    } catch (err) {
      console.error(err)
      toast({ title: "Failed to Send Alert", description: "An error occurred while broadcasting.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 p-6 md:p-8 text-white shadow-xl pattern-dots-light">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <Megaphone className="size-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-white/20 text-white border-0 text-[10px] font-bold uppercase tracking-wider">
                  Real-time Dashboard Alert Center
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-headline font-bold">Alert Command Center</h1>
              <p className="text-white/80 text-xs md:text-sm mt-0.5">
                Broadcast instant emergency alerts directly to the top of Teacher &amp; Student dashboards
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 px-4 py-2 border-white/30 bg-white/10 text-white font-bold text-xs backdrop-blur-sm shadow-sm">
            <Radio className="size-3.5 text-emerald-300 animate-pulse" />
            LIVE BROADCAST READY
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Create Alert Form */}
        <Card className="lg:col-span-3 shadow-md border-2 border-border/60">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-base font-headline flex items-center gap-2">
              <Send className="size-4 text-primary" />
              Compose Dashboard Top Alert
            </CardTitle>
            <CardDescription className="text-xs">
              Alerts will appear immediately as a sticky emergency banner at the very top of user dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSendAlert} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alert Title</Label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., HEAVY RAINFALL WARNING: School Early Dismissal" 
                  required 
                  className="h-11 font-medium" 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alert Message &amp; Directives</Label>
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the disaster details, classroom action steps, or evacuation directives..." 
                  required 
                  className="min-h-[110px] text-sm leading-relaxed" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Severity Level</Label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverity)}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {severityOptions.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target School</Label>
                  <Select value={targetSchoolId} onValueChange={setTargetSchoolId}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🏫 All Schools Broadcast</SelectItem>
                      {SEED_SCHOOLS.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target User Roles */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target User Dashboards</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleRole("Teacher")}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                      targetRoles.includes("Teacher") ? "border-blue-500 bg-blue-500/10 text-blue-300" : "border-border opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-blue-400" />
                      <div>
                        <p className="text-xs font-bold">Teachers</p>
                        <p className="text-[10px] text-muted-foreground">Classroom Supervisors</p>
                      </div>
                    </div>
                    {targetRoles.includes("Teacher") && <CheckCircle className="size-4 text-blue-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleRole("Student")}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                      targetRoles.includes("Student") ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-border opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold">Students</p>
                        <p className="text-[10px] text-muted-foreground">Dashboard Top Banner</p>
                      </div>
                    </div>
                    {targetRoles.includes("Student") && <CheckCircle className="size-4 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="p-3 bg-muted/40 rounded-xl border text-xs text-muted-foreground flex items-center gap-2">
                <Bell className="size-4 text-amber-500 shrink-0" />
                <span>Alerts are displayed live as a sticky top banner on targeted user dashboards.</span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg btn-lift" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Send className="mr-2 size-5" />}
                Publish Top Dashboard Alert
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active & Recent Broadcast Log */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-base font-headline flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Broadcast History
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {alerts.length} Alerts
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">Active and past emergency dashboard alerts</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[560px] overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => {
                const severityObj = severityOptions.find(s => s.value === alert.severity)
                
                return (
                  <div key={alert.id || i} className="p-3.5 bg-muted/30 rounded-xl border border-border/60 space-y-2 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <Badge className={cn("text-[10px] font-bold uppercase", severityObj?.color)}>
                        {alert.severity}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {typeof alert.sentAt === "string" ? new Date(alert.sentAt).toLocaleDateString() : "Just now"}
                      </span>
                    </div>

                    <p className="text-xs font-bold font-headline leading-tight">{alert.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{alert.message}</p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="size-3 text-primary" /> {alert.targetSchoolName}
                      </span>
                      <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Top Banner Active
                      </Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No active alerts sent yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
