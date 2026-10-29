"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Youtube, Megaphone, Cloudy,
  Gamepad2, Video, Puzzle, FilePenLine, Film, BookImage,
  Trophy, BarChart3, Phone, AlertTriangle, MapPin,
  ClipboardCheck, School, Calendar,
} from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SurakshaLogo, SurakshaWordmark } from "@/components/brand/suraksha-logo"
import { useAuth } from "@/contexts/auth-context"
import { USER_ROLES } from "@/app/constants"
import { cn } from "@/lib/utils"
import { getTierEmoji } from "@/lib/school-codes"

const ICON_STROKE = 1.75

type MenuSection = {
  label: string
  items: MenuItem[]
}

type MenuItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>
  adminOnly?: boolean
  badge?: string
  badgeColor?: string
}

const adminTeacherSections: MenuSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/rankings", label: "School Rankings", icon: Trophy },
    ],
  },
  {
    label: "Response Tools",
    items: [
      { href: "/disaster-alerts", label: "Disaster Alerts", icon: AlertTriangle, badge: "LIVE", badgeColor: "bg-primary/20 text-primary border border-primary/30" },
      { href: "/safety-audit", label: "Safety Audit", icon: ClipboardCheck },
    ],
  },
  {
    label: "Training",
    items: [
      { href: "/training", label: "Training Library", icon: Youtube },
      { href: "/emergency-contacts", label: "Emergency Contacts", icon: Phone },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/alerts", label: "Alert Command", icon: Megaphone, adminOnly: true, badge: "CMD", badgeColor: "bg-primary text-primary-foreground" },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
      { href: "/admin/homework", label: "Assign Homework", icon: BookImage, adminOnly: true },
      { href: "/admin/schools", label: "School Management", icon: School, adminOnly: true },
      { href: "/admin/drills", label: "Drill Management", icon: Calendar, adminOnly: true },
      { href: "/admin/manage-videos", label: "Manage Videos", icon: Film, adminOnly: true },
    ],
  },
]

const studentSections: MenuSection[] = [
  {
    label: "Home",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Training Modules",
    items: [
      { href: "/module-learn", label: "My Modules", icon: BookImage, badge: "NEW", badgeColor: "bg-primary/20 text-primary border border-primary/30" },
      { href: "/gamified-learning", label: "Gamified Learning", icon: Gamepad2 },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/storytelling", label: "Storytelling", icon: Video },
      { href: "/disaster-alerts", label: "Disaster Alerts", icon: AlertTriangle, badge: "LIVE", badgeColor: "bg-primary/20 text-primary border border-primary/30" },
      { href: "/emergency-contacts", label: "Emergency Contacts", icon: Phone },
    ],
  },
  {
    label: "Engage",
    items: [
      { href: "/creative-projects", label: "Creative Projects", icon: FilePenLine },
      { href: "/rankings", label: "School Rankings", icon: Trophy },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const userRole = profile?.role || USER_ROLES.STUDENT

  const sections = userRole === USER_ROLES.STUDENT ? studentSections : adminTeacherSections

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Logo header */}
      <SidebarHeader className="p-0 group-data-[collapsible=icon]:p-0">
        <Link
          href="/"
          className={cn(
            "relative flex items-center gap-3 overflow-hidden p-4 bg-white",
            "border-b border-sidebar-border",
            "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-3",
            "transition-all duration-300 ease-in-out hover:bg-slate-50"
          )}
        >
          <SurakshaLogo className="relative z-10 size-8 text-primary transition-transform duration-300 group-hover:scale-105" />
          <div className="relative z-10 text-slate-900 group-data-[collapsible=icon]:hidden">
            <SurakshaWordmark />
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400">
              Disaster Preparedness
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 pt-3">
        {sections.map((section, sectionIdx) => {
          const visibleItems = section.items.filter(item => {
            if (item.adminOnly && userRole !== USER_ROLES.ADMINISTRATOR) return false
            return true
          })
          if (visibleItems.length === 0) return null

          return (
            <div key={section.label}>
              {sectionIdx > 0 && <Separator className="my-2 opacity-40" />}
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                {section.label}
              </p>
              <SidebarMenu>
                {visibleItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href) || (item.href === "/gamified-learning" && pathname.startsWith("/safety-path"))
                  return (
                    <SidebarMenuItem key={item.label}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={{ children: item.label }}
                          className={cn(
                            "group/item relative rounded-lg transition-all duration-300 ease-in-out",
                            isActive
                              ? "border-l-[3px] border-primary bg-primary/10 font-semibold text-primary shadow-sm hover:bg-primary/15"
                              : "hover:translate-x-0.5 hover:bg-muted/60"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "size-[18px] transition-colors duration-300",
                              isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                            )}
                            strokeWidth={ICON_STROKE}
                          />
                          <span className="text-[13px]">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              "ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide",
                              item.badgeColor || "bg-primary/10 text-primary"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </div>
          )
        })}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-0 group-data-[collapsible=icon]:hidden">
        {profile && (
          <div className="space-y-1 border-t border-sidebar-border px-4 py-2.5">
            <p className="truncate text-[11px] font-semibold">{profile.displayName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{profile.schoolName}</p>
            {profile.tier && userRole !== USER_ROLES.ADMINISTRATOR && (
              <p className="text-[10px] text-muted-foreground">
                {getTierEmoji(profile.tier)} Class {profile.classNum}-{profile.section}
              </p>
            )}
          </div>
        )}
        <div className="border-t border-sidebar-border px-4 py-2">
          <p className="text-center text-[10px] font-medium text-muted-foreground/60">
            SURAKSHA v2.0
          </p>
        </div>
        <div className="tricolor-stripe h-0.5 w-full" />
      </SidebarFooter>
    </Sidebar>
  )
}
