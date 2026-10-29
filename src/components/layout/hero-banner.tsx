import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SurakshaLogo } from "@/components/brand/suraksha-logo"
import type { LucideIcon } from "lucide-react"

type HeroAction = {
  label: string
  href: string
  icon?: LucideIcon
  variant?: "primary" | "outline"
}

type HeroBannerProps = {
  eyebrow: string
  title: string
  description: string
  actions?: HeroAction[]
  badge?: React.ReactNode
  icon?: LucideIcon
  variant?: "command" | "field" | "academy"
  className?: string
}

const variantStyles = {
  command: "gradient-hero-institutional",
  field: "gradient-hero-field",
  academy: "gradient-hero-academy",
}

export function HeroBanner({
  eyebrow,
  title,
  description,
  actions = [],
  badge,
  icon: Icon,
  variant = "command",
  className,
}: HeroBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 p-8 md:p-10 animate-fade-up",
        "pattern-topo pattern-radar-sweep shadow-hero",
        variantStyles[variant],
        className
      )}
    >
      {/* Structural grid overlay */}
      <div className="pointer-events-none absolute inset-0 pattern-tactical-grid opacity-40" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-sm">
              {Icon ? (
                <Icon className="size-7 text-white" strokeWidth={1.75} />
              ) : (
                <SurakshaLogo className="size-7 text-white" />
              )}
            </div>
            <div className="hidden h-8 w-px bg-white/20 sm:block" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
              {eyebrow}
            </p>
          </div>
          {badge}
        </div>

        <h1 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/72 md:text-lg">
          {description}
        </p>

        {actions.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-3">
            {actions.map((action) => {
              const ActionIcon = action.icon
              const isOutline = action.variant === "outline"
              return (
                <Button
                  key={action.href}
                  asChild
                  size="lg"
                  className={cn(
                    "btn-lift font-semibold transition-all duration-300 ease-in-out",
                    isOutline
                      ? "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                      : "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                  )}
                  variant={isOutline ? "outline" : "default"}
                >
                  <Link href={action.href}>
                    {action.label}
                    {ActionIcon && <ActionIcon className="ml-2 size-4" strokeWidth={1.75} />}
                  </Link>
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Corner status strip — institutional HUD accent */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 hidden h-px w-48 bg-gradient-to-l from-primary/80 to-transparent md:block"
        aria-hidden="true"
      />
    </section>
  )
}
