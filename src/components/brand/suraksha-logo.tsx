"use client"

import { cn } from "@/lib/utils"

type SurakshaLogoProps = React.SVGProps<SVGSVGElement> & {
  variant?: "full" | "mark"
}

/**
 * Redesigned SURAKSHA logo — disaster-themed shield with elements
 * representing earthquake, flood, fire, and lightning protection
 */
export function SurakshaLogo({ className, variant = "full", ...props }: SurakshaLogoProps) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      {/* Shield glow */}
      <defs>
        <linearGradient id="shieldGrad" x1="22" y1="2" x2="22" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="22" y1="6" x2="22" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Shield outer */}
      <path
        d="M22 2L6 9v12c0 9.5 6.8 16.2 16 20 9.2-3.8 16-10.5 16-20V9L22 2z"
        fill="url(#shieldGrad)"
      />
      {/* Shield inner */}
      <path
        d="M22 5L9 11v10c0 8 5.6 13.6 13 16.8 7.4-3.2 13-8.8 13-16.8V11L22 5z"
        fill="url(#innerGrad)"
        fillOpacity="0.2"
        stroke="white"
        strokeWidth="0.75"
        strokeOpacity="0.4"
      />

      {/* House (center, protected) */}
      <path d="M22 15l-6 4.5V26h12v-6.5L22 15z" fill="white" fillOpacity="0.95" />
      <path d="M22 15l-6 4.5V26h12v-6.5L22 15z" stroke="white" strokeWidth="0.5" />
      <path d="M22 13l-8 6h16l-8-6z" fill="white" fillOpacity="0.95" />
      <rect x="20" y="22" width="4" height="4" rx="0.5" fill="#F97316" fillOpacity="0.7" />

      {/* Lightning bolt (top-right) */}
      <path d="M32 8l-2 4h2.5l-3 5 1.5-3.5H29l2-5.5z" fill="#FDE047" fillOpacity="0.9" />

      {/* Waves (bottom-left) */}
      <path
        d="M10 30c1.5-1 3-1 4.5 0s3 1 4.5 0"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <path
        d="M9 33c1.5-1 3-1 4.5 0s3 1 4.5 0"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      {/* Flame (bottom-right) */}
      {variant === "full" && (
        <path
          d="M33 29c0-2.5-2-4-2-4s-2 1.5-2 4c0 1.7 1 3 2 3s2-1.3 2-3z"
          fill="#F97316"
          fillOpacity="0.8"
        />
      )}

      {/* Seismic zigzag (bottom-center) */}
      <path
        d="M18 35l2-2 2 3 2-3 2 2"
        stroke="white"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
    </svg>
  )
}

export function SurakshaWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span className="font-headline text-[15px] font-bold tracking-wide">Suraksha</span>
    </div>
  )
}
