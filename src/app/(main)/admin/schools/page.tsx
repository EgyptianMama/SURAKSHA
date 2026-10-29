"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { School, Users, GraduationCap, User, MapPin, Mountain, Droplets, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { getSchools, SEED_SCHOOLS, type SchoolDoc } from "@/lib/firestore-collections"

const trendIcon: Record<string, JSX.Element> = {
  up: <TrendingUp className="size-3.5 text-emerald-500" />,
  down: <TrendingDown className="size-3.5 text-red-500" />,
  stable: <Minus className="size-3.5 text-amber-500" />,
}

const zoneColors: Record<number, string> = {
  2: "text-green-400",
  3: "text-yellow-400",
  4: "text-orange-400",
  5: "text-red-400",
}

export default function SchoolManagementPage() {
  const [schools, setSchools] = useState<SchoolDoc[]>(SEED_SCHOOLS)

  useEffect(() => {
    getSchools().then((data) => {
      if (data && data.length > 0) {
        setSchools(data)
      }
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
          <School className="size-6 text-primary" />
          School Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage registered schools, their students, teachers, and safety status
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Registered Schools", value: schools.length, icon: School, color: "text-primary" },
          { label: "Total Regions", value: "3 States", icon: MapPin, color: "text-cyan-500" },
          { label: "Seismic Coverage", value: "Zone II–IV", icon: Mountain, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={stat.label} className="animate-fade-up" style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-muted/30 rounded-lg">
                <stat.icon className={cn("size-5", stat.color)} />
              </div>
              <div>
                <p className="text-xl font-headline font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* School Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {schools.map((school, i) => (
          <Card
            key={school.id}
            className="card-hover animate-fade-up overflow-hidden"
            style={{ "--delay": `${(i + 3) * 80}ms` } as React.CSSProperties}
          >
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* School info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-lg">{school.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{school.id}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {school.region}, {school.state}</span>
                    <span className={cn("flex items-center gap-1 font-semibold", zoneColors[school.seismicZone])}>
                      <Mountain className="size-3" /> Seismic Zone {school.seismicZone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="size-3 text-blue-400" /> Flood: {school.floodZone}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg min-w-[80px]">
                    <div className="flex items-center justify-center gap-1">
                      <GraduationCap className="size-3.5 text-emerald-500" />
                      <span className="text-lg font-bold">{school.stats.studentCount ?? "—"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg min-w-[80px]">
                    <div className="flex items-center justify-center gap-1">
                      <User className="size-3.5 text-blue-500" />
                      <span className="text-lg font-bold">{school.stats.teacherCount ?? "—"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Teachers</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg min-w-[80px]">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg font-bold">{school.stats.drillsCompleted ?? "—"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Drills</p>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg min-w-[80px]">
                    <div className="flex items-center justify-center gap-1">
                      {trendIcon[school.trend]}
                      <span className="text-lg font-bold">{school.stats.avgScore ?? "—"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-[10px] text-muted-foreground/50">
        School data is synced from Firestore in real-time. Stats update as students complete modules and drills are logged.
      </p>
    </div>
  )
}
