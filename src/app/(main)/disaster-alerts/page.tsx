"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Loader2, Radio, Shield, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  Extreme: { color: "text-red-400", bg: "bg-red-950/40", border: "border-red-500/30", icon: "🔴" },
  Severe: { color: "text-orange-400", bg: "bg-orange-950/40", border: "border-orange-500/30", icon: "🟠" },
  Moderate: { color: "text-yellow-400", bg: "bg-yellow-950/40", border: "border-yellow-500/30", icon: "🟡" },
  Minor: { color: "text-blue-400", bg: "bg-blue-950/40", border: "border-blue-500/30", icon: "🔵" },
}

const schoolNames: Record<string, string> = {
  "dps-rkpuram": "DPS R.K. Puram",
  "kv-bengaluru": "KV Bengaluru",
  "stx-mumbai": "St. Xavier's Mumbai",
}

type NdmaAlert = {
  id: string
  headline: string
  description: string
  severity: string
  urgency: string
  certainty: string
  event: string
  areaDesc: string
  effective: string
  expires: string
  source: string
  affectedSchools: string[]
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return String(dateStr)
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return String(dateStr)
  }
}

export default function DisasterAlertsPage() {
  const [alerts, setAlerts] = useState<NdmaAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/ndma-alerts")
        if (!res.ok) throw new Error("Failed to fetch alerts")
        const data = await res.json()
        if (!mounted) return
        setAlerts(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!mounted) return
        setError("Unable to connect to NDMA live feed. Showing fallback data.")
        setAlerts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    fetchAlerts()
    return () => { mounted = false }
  }, [])

  const safeAlerts = Array.isArray(alerts) ? alerts : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <AlertTriangle className="size-6 text-red-500" />
            Live Disaster Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time alerts from NDMA SACHET and India's early warning network
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-red-500/30 text-red-400 w-fit">
          <Radio className="size-3 animate-pulse" />
          LIVE
        </Badge>
      </div>

      {error && (
        <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-lg text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Active alert count */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
        <div className="p-2.5 bg-red-500/10 rounded-lg">
          <Shield className="size-5 text-red-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {loading ? "Scanning for active alerts..." : `${safeAlerts.length} Active Alerts`}
          </p>
          <p className="text-xs text-muted-foreground">
            Monitoring: Delhi (Zone IV) · Karnataka (Zone II) · Maharashtra (Zone III)
          </p>
        </div>
        {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="h-32 rounded-xl bg-muted/20 animate-pulse border border-border/30" />
        ) : safeAlerts.length === 0 ? (
          <div className="text-center p-8 bg-muted/10 rounded-xl border border-border/30">
            <Shield className="size-12 text-emerald-500 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">No active disaster alerts</p>
            <p className="text-xs text-muted-foreground">All monitored regions are currently safe.</p>
          </div>
        ) : (
          safeAlerts.map((alert, i) => {
            const config = severityConfig[alert.severity] || severityConfig.Minor
            const effectiveDate = formatDate(alert.effective)
            const expiresDate = formatDate(alert.expires)
            const affectedSchools = Array.isArray(alert.affectedSchools) ? alert.affectedSchools : []

            return (
              <Card
                key={alert.id || `alert-${i}`}
                className={cn(
                  "border-l-4 animate-fade-up overflow-hidden",
                  config.border
                )}
                style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-lg">{config.icon}</span>
                        <Badge className={cn("text-[10px]", config.bg, config.color, config.border)}>
                          {alert.severity || "Alert"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {alert.event || "Disaster"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          {alert.urgency || "Advisory"}
                        </Badge>
                      </div>
                      <CardTitle className="font-headline text-base">{alert.headline || "Disaster Alert"}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {alert.description || "No further details provided."}
                  </p>

                  {/* Affected area + schools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Affected Area</p>
                      <p className="text-xs font-medium">{alert.areaDesc || "General Region"}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Schools Impacted</p>
                      <div className="flex flex-wrap gap-1">
                        {affectedSchools.length > 0 ? affectedSchools.map(sid => (
                          <Badge key={sid} variant="secondary" className="text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30">
                            {schoolNames[sid] || sid}
                          </Badge>
                        )) : (
                          <span className="text-xs text-muted-foreground">No registered schools in this area</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/50 mt-2">
                    <span>Effective: {effectiveDate}</span>
                    <span>Expires: {expiresDate}</span>
                    <span className="flex items-center gap-1">
                      <ExternalLink className="size-3" />
                      {alert.source || "NDMA"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Source attribution */}
      <div className="text-center p-4 bg-muted/20 rounded-xl border border-border/30">
        <p className="text-[11px] text-muted-foreground">
          Data sourced from NDMA SACHET (sachet.ndma.gov.in) · IMD · NCS · CWC · INCOIS
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          Alerts are refreshed automatically based on NDMA live CAP feeds
        </p>
      </div>
    </div>
  )
}
