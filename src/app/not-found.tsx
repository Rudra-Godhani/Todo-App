import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Frown } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
      <Frown className="h-24 w-24 text-primary mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500" />
      <h1 className="text-5xl font-bold text-gray-900 mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8 animate-in fade-in-0 duration-1000">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link href="/dashboard" passHref>
        <Button className="animate-in fade-in-0 zoom-in-90 duration-1000">Go to Dashboard</Button>
      </Link>
    </div>
  )
}
