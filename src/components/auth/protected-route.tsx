"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { type UserRole } from "@/app/constants"
import { Loader2, ShieldAlert } from "lucide-react"

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect via useEffect
  }

  // Check role access
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md animate-scale-in">
          <div className="p-4 bg-destructive/10 rounded-full inline-block mb-4">
            <ShieldAlert className="size-10 text-destructive" />
          </div>
          <h2 className="font-headline text-xl font-bold">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-2">
            You don&apos;t have permission to view this page. This content is for {allowedRoles.join(" / ")} only.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-primary font-semibold hover:underline"
          >
            ← Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
