"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { USER_ROLES, type UserRole } from "@/app/constants"
import {
  UserCog, User, GraduationCap, ChevronRight, Bell,
  LogOut, School, BookOpen, Radio, CheckCircle
} from "lucide-react"
import { SurakshaLogo } from "@/components/brand/suraksha-logo"
import { getTierEmoji, getTierLabel } from "@/lib/school-codes"
import { cn } from "@/lib/utils"
import { subscribeToEmergencyAlerts, type EmergencyAlertDoc } from "@/lib/alerts-data"

const ICON_STROKE = 1.75

const pageNames: Record<string, string> = {
  "/": "Command Dashboard",
  "/training": "Training Library",
  "/disaster-alerts": "Live Disaster Alerts",
  "/safety-audit": "Safety Audit",
  "/gamified-learning": "Gamified Learning",
  "/storytelling": "Storytelling & Visuals",
  "/creative-projects": "Creative Projects",
  "/safety-path": "Safety Hero Path",
  "/rankings": "School Rankings",
  "/admin/analytics": "Analytics Dashboard",
  "/admin/alerts": "Alert Command Center",
  "/admin/schools": "School Management",
  "/admin/drills": "Drill Management",
  "/admin/manage-videos": "Manage Videos",
  "/emergency-contacts": "Emergency Contacts",
}

const getRoleConfig = (role: UserRole) => {
  switch (role) {
    case USER_ROLES.ADMINISTRATOR:
      return {
        icon: <UserCog className="size-3.5" strokeWidth={ICON_STROKE} />,
        color: "bg-primary/15 text-primary border border-primary/25",
        initial: "A",
        initialBg: "bg-secondary",
        label: "Administrator",
      }
    case USER_ROLES.TEACHER:
      return {
        icon: <User className="size-3.5" strokeWidth={ICON_STROKE} />,
        color: "bg-secondary/80 text-secondary-foreground border border-border",
        initial: "T",
        initialBg: "bg-secondary",
        label: "Teacher",
      }
    case USER_ROLES.STUDENT:
      return {
        icon: <GraduationCap className="size-3.5" strokeWidth={ICON_STROKE} />,
        color: "bg-success/15 text-success border border-success/25",
        initial: "S",
        initialBg: "bg-success",
        label: "Student",
      }
    default:
      return {
        icon: null,
        color: "",
        initial: "?",
        initialBg: "bg-muted",
        label: "Unknown",
      }
  }
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, logout } = useAuth()

  const [alerts, setAlerts] = useState<EmergencyAlertDoc[]>([])
  const [readAlertIds, setReadAlertIds] = useState<string[]>([])

  useEffect(() => {
    let unsub: (() => void) | undefined
    try {
      unsub = subscribeToEmergencyAlerts(setAlerts)
    } catch {
      // Firestore subscription failed — ignore
    }
    return () => { unsub?.() }
  }, [])

  const activeAlerts = alerts.filter(a => a.status === "active")
  const unreadAlerts = activeAlerts.filter(a => !readAlertIds.includes(a.id))
  const hasUnread = unreadAlerts.length > 0

  const handleOpenPopover = (open: boolean) => {
    if (open && hasUnread) {
      setReadAlertIds(activeAlerts.map(a => a.id))
    }
  }

  const userRole = profile?.role || "Student"
  const roleConfig = getRoleConfig(userRole as UserRole)

  const getTitle = () => {
    return pageNames[pathname] || pathname.split("/").pop()?.replace(/-/g, " ")?.replace(/^\w/, c => c.toUpperCase()) || "SURAKSHA"
  }

  const getBreadcrumbs = () => {
    if (pathname === "/") return null
    const segments = pathname.split("/").filter(Boolean)
    return segments.map((seg, i) => {
      const path = "/" + segments.slice(0, i + 1).join("/")
      const name = pageNames[path] || seg.replace(/-/g, " ").replace(/^\w/, c => c.toUpperCase())
      const isLast = i === segments.length - 1
      return (
        <span key={path} className="flex items-center gap-1.5">
          <ChevronRight className="size-3 text-muted-foreground/50" strokeWidth={ICON_STROKE} />
          {isLast ? (
            <span className="font-medium text-foreground">{name}</span>
          ) : (
            <Link href={path} className="text-muted-foreground transition-colors duration-300 hover:text-primary">
              {name}
            </Link>
          )}
        </span>
      )
    })
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const userInitial = profile?.displayName
    ? profile.displayName.charAt(0).toUpperCase()
    : roleConfig.initial

  return (
    <header className="sticky top-1 z-30 flex h-[4.25rem] items-center gap-4 border-b border-border/60 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <SidebarTrigger className="md:hidden" />

      {/* Brand mark — visible on mobile when sidebar collapsed */}
      <Link href="/" className="flex items-center gap-2 md:hidden">
        <SurakshaLogo className="size-8 text-primary" />
      </Link>

      {/* Title + Breadcrumbs */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate font-headline text-lg font-bold tracking-tight">{getTitle()}</h1>
        </div>
        <div className="-mt-0.5 flex items-center gap-0.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors duration-300 hover:text-foreground">Home</Link>
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live status indicator */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-success/20 bg-success/10 px-2.5 py-1 lg:flex">
          <Radio className="size-3 text-success animate-pulse" strokeWidth={ICON_STROKE} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-success">Systems Online</span>
        </div>

        {/* Notification bell */}
        <Popover onOpenChange={handleOpenPopover}>
          <PopoverTrigger asChild>
            <button
              className="btn-lift group relative rounded-lg border border-transparent p-2 transition-all duration-300 ease-in-out hover:border-border/60 hover:bg-muted/60"
              aria-label="Notifications"
            >
              <Bell className="size-[18px] text-muted-foreground transition-colors duration-300 group-hover:text-primary" strokeWidth={ICON_STROKE} />
              {hasUnread && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 border-2 shadow-xl">
            <div className="p-3 border-b flex items-center justify-between bg-muted/30">
              <p className="font-headline font-bold text-xs">Emergency Alerts &amp; Notifications</p>
              {hasUnread && (
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                  {unreadAlerts.length} new
                </Badge>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {activeAlerts.length > 0 ? (
                <div className="space-y-2">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors space-y-1 text-left border border-border/50">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold">
                          {alert.severity}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {typeof alert.sentAt === "string" ? new Date(alert.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>
                      <p className="text-xs font-bold font-headline line-clamp-1">{alert.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{alert.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="size-10 mx-auto rounded-full bg-muted/60 flex items-center justify-center">
                    <Bell className="size-5 text-muted-foreground/60" />
                  </div>
                  <p className="text-xs font-bold text-foreground">No new messages</p>
                  <p className="text-[11px] text-muted-foreground px-4">There are no new emergency notifications or directives at this time.</p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Role badge */}
        <div className="hidden items-center gap-2 sm:flex">
          <div className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
            roleConfig.color
          )}>
            {roleConfig.icon}
            <span>{roleConfig.label}</span>
          </div>
          {profile?.tier && userRole !== USER_ROLES.ADMINISTRATOR && (
            <div className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold",
              profile.tier === "primary"
                ? "border-success/25 bg-success/10 text-success"
                : "border-primary/25 bg-primary/10 text-primary"
            )}>
              <span>{getTierEmoji(profile.tier)}</span>
              <span>{profile.tier === "primary" ? "Class 1–5" : "Class 6–12"}</span>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "btn-lift flex size-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-md",
              "ring-2 ring-background transition-all duration-300 hover:ring-primary/40",
              roleConfig.initialBg
            )}>
              {userInitial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="pb-0">
              <p className="text-sm font-semibold">{profile?.displayName || "User"}</p>
              <p className="text-xs font-normal text-muted-foreground">{profile?.email}</p>
            </DropdownMenuLabel>

            <div className="space-y-1 px-2 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <School className="size-3" strokeWidth={ICON_STROKE} />
                <span>{profile?.schoolName || "No school assigned"}</span>
              </div>
              {userRole !== USER_ROLES.ADMINISTRATOR && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="size-3" strokeWidth={ICON_STROKE} />
                  <span>Class {profile?.classNum || "?"}-{profile?.section || "?"}</span>
                  {profile?.tier && (
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      profile.tier === "primary"
                        ? "bg-success/15 text-success"
                        : "bg-primary/15 text-primary"
                    )}>
                      {getTierLabel(profile.tier)}
                    </span>
                  )}
                </div>
              )}
              {profile?.role && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {roleConfig.icon}
                  <span>{profile.role}</span>
                </div>
              )}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                handleLogout()
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" strokeWidth={ICON_STROKE} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
