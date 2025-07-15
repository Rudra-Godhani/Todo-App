"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Activity } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
        <div className="p-4 bg-white rounded-full shadow-lg mb-6 mx-auto w-fit">
          <Activity className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">FitTracker</h1>
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your fitness journey...</p>
      </div>
    </div>
  )
}
