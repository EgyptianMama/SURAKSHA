"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Plus, CheckCircle, Clock, AlertTriangle, Users, Loader2, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

const drillTypes = [
  { value: "Earthquake", emoji: "🏚️" },
  { value: "Fire", emoji: "🔥" },
  { value: "Flood", emoji: "🌊" },
  { value: "Cyclone", emoji: "🌀" },
  { value: "Lockdown", emoji: "🔒" },
]

const scheduledDrills: Array<{
  id: string
  type: string
  school: string
  date: string
  status: "scheduled" | "completed" | "cancelled"
  teacher: string
}> = []

const completedDrills: Array<{
  id: string
  type: string
  school: string
  date: string
  status: "completed" | "scheduled" | "cancelled"
  teacher: string
  participationRate: number
  avgScore: number
  participants: number
}> = []

const statusConfig = {
  scheduled: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
  completed: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  cancelled: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
}

export default function DrillManagementPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast({ title: "Drill Scheduled", description: "The drill has been added to the calendar." })
    setLoading(false)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <Calendar className="size-6 text-primary" />
            Drill Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule drills, log results, and track NDMA compliance (min. 2 drills/year)
          </p>
        </div>
      </div>

      {/* Compliance stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Drills This Year", value: completedDrills.length, target: "/ 6 required", color: "text-primary" },
          { label: "Avg Participation", value: completedDrills.length > 0 ? `${Math.round(completedDrills.reduce((a, d) => a + d.participationRate, 0) / completedDrills.length)}%` : "0%", target: "across all drills", color: "text-emerald-500" },
          { label: "Upcoming Scheduled", value: scheduledDrills.length, target: "drills pending", color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={stat.label} className="animate-fade-up" style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}>
            <CardContent className="p-4">
              <p className={cn("text-2xl font-headline font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs font-semibold mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground">{stat.target}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Schedule form */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-headline flex items-center gap-2">
              <Plus className="size-4" /> Schedule New Drill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Drill Type</Label>
                <Select required>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {drillTypes.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.emoji} {d.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">School</Label>
                <Select required>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select school" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dps-rkpuram">DPS R.K. Puram</SelectItem>
                    <SelectItem value="kv-bengaluru">KV Bengaluru</SelectItem>
                    <SelectItem value="stx-mumbai">St. Xavier&apos;s Mumbai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Date</Label>
                <Input type="date" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Notes</Label>
                <Textarea placeholder="Any special instructions..." className="min-h-[60px]" />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Calendar className="mr-2 size-4" />}
                Schedule Drill
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Drill timeline */}
        <div className="lg:col-span-3 space-y-4">
          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Clock className="size-4 text-blue-500" /> Upcoming Drills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {scheduledDrills.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No upcoming drills scheduled</p>
                  <p className="text-[10px] mt-1">Use the form to schedule a new drill</p>
                </div>
              ) : scheduledDrills.map((drill, i) => {
                const type = drillTypes.find(d => d.value === drill.type)
                return (
                  <div key={drill.id} className="flex items-center gap-3 p-3 bg-blue-950/10 border border-blue-500/10 rounded-lg animate-fade-up" style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}>
                    <span className="text-xl">{type?.emoji}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{drill.type} Drill — {drill.school}</p>
                      <p className="text-[10px] text-muted-foreground">{drill.date} · Assigned: {drill.teacher}</p>
                    </div>
                    <Badge className={statusConfig.scheduled.color} variant="outline">{drill.status}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Completed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <CheckCircle className="size-4 text-emerald-500" /> Completed Drills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedDrills.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No drills completed yet</p>
                  <p className="text-[10px] mt-1">Completed drills will appear here</p>
                </div>
              ) : completedDrills.map((drill, i) => {
                const type = drillTypes.find(d => d.value === drill.type)
                return (
                  <div key={drill.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg animate-fade-up" style={{ "--delay": `${(i + 2) * 80}ms` } as React.CSSProperties}>
                    <span className="text-xl">{type?.emoji}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{drill.type} Drill — {drill.school}</p>
                      <p className="text-[10px] text-muted-foreground">{drill.date} · {drill.teacher}</p>
                    </div>
                    <div className="flex gap-3 text-center">
                      <div>
                        <p className="text-sm font-bold text-emerald-400">{drill.participationRate}%</p>
                        <p className="text-[9px] text-muted-foreground">Participation</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{drill.avgScore}</p>
                        <p className="text-[9px] text-muted-foreground">Avg Score</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-400">{drill.participants}</p>
                        <p className="text-[9px] text-muted-foreground">Students</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
