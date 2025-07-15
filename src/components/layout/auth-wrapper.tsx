"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Activity } from "lucide-react"

const publicRoutes = ["/auth/login", "/auth/signup"]

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.includes(pathname)

      if (!user && !isPublicRoute) {
        router.push("/auth/login")
      } else if (user && isPublicRoute) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
          <div className="p-4 bg-white rounded-full shadow-lg mb-6 mx-auto w-fit">
            <Activity className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">FitTracker</h1>
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your fitness journey...</p>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!user && !publicRoutes.includes(pathname)) {
    return null
  }

  if (user && publicRoutes.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
