import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ICON_STROKE = 1.75

type BriefCardProps = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  code?: string
  className?: string
  style?: React.CSSProperties
}

/** Tactical incident-brief style card for admin/teacher tools */
export function BriefCard({
  title,
  description,
  href,
  icon: Icon,
  code,
  className,
  style,
}: BriefCardProps) {

  return (
    <Card
      className={cn(
        "brief-card card-hover card-press group cursor-pointer animate-fade-up",
        className
      )}
      style={style}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border/80 bg-secondary/50 p-2.5">
              <Icon className="size-5 text-primary" strokeWidth={ICON_STROKE} />
            </div>
            <div className="min-w-0 flex-1">
              {code && (
                <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {code}
                </p>
              )}
              <CardTitle className="font-headline text-base leading-snug">{title}</CardTitle>
            </div>
          </div>
        </div>
        <CardDescription className="text-xs leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="btn-lift w-full justify-between border border-transparent text-xs hover:border-border/60 hover:bg-muted/50"
        >
          <Link href={href}>
            Open Brief
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={ICON_STROKE} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

type ModuleCardProps = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  progress?: number
  moduleCode?: string
  className?: string
  style?: React.CSSProperties
}

/** Training module card — structured, progress-aware */
export function ModuleCard({
  title,
  description,
  href,
  icon: Icon,
  progress = 0,
  moduleCode,
  className,
  style,
}: ModuleCardProps) {
  const isComplete = progress >= 100

  return (
    <Link href={href} className="block h-full">
      <Card
        className={cn(
          "module-card card-hover card-press h-full animate-fade-up group",
          isComplete && "module-card-complete",
          className
        )}
        style={style}
      >
        <div className="module-card-accent" aria-hidden="true" />
        <CardContent className="flex h-full flex-col p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
              <Icon className="size-6 text-primary" strokeWidth={ICON_STROKE} />
            </div>
            {moduleCode && (
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {moduleCode}
              </span>
            )}
          </div>

          <CardTitle className="font-headline text-lg leading-snug">{title}</CardTitle>
          <CardDescription className="mt-2 flex-1 text-xs leading-relaxed">
            {description}
          </CardDescription>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span>{isComplete ? "Module Complete" : "Progress"}</span>
              <span className={isComplete ? "text-success" : "text-primary"}>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isComplete ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
