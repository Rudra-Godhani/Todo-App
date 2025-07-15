"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TriangleAlert } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 text-center">
      <TriangleAlert className="h-24 w-24 text-destructive mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500" />
      <h1 className="text-5xl font-bold text-gray-900 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        Something went wrong!
      </h1>
      <p className="text-lg text-gray-700 mb-8 animate-in fade-in-0 duration-1000">
        We're sorry, but an unexpected error occurred.
      </p>
      <p className="text-sm text-gray-500 mb-8 animate-in fade-in-0 duration-1000">{error.message}</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="animate-in fade-in-0 zoom-in-90 duration-1000"
      >
        Try again
      </Button>
    </div>
  )
}
