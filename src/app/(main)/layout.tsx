"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "@/components/error-boundary"

// Lazy-load chatbot — it's a floating widget, not needed for initial render
const SafetyChatbot = dynamic(
  () => import("@/components/ai-companion/safety-chatbot").then(mod => ({ default: mod.SafetyChatbot })),
  { ssr: false }
)

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedRoute>
          {/* Tricolor stripe */}
          <div className="tricolor-stripe h-1 w-full fixed top-0 left-0 z-50" />
          <SidebarProvider>
            <AppSidebar />
            <div className="relative flex min-h-svh flex-1 flex-col bg-background md:ml-[--sidebar-width-icon] pt-1">
              <Header />
              <main className="flex-1 p-4 md:p-6 animate-fade-up">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <SafetyChatbot />
            </div>
          </SidebarProvider>
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  )
}

