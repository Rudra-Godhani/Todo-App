import { Loader2, Activity } from "lucide-react"

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
        <div className="p-4 bg-white rounded-full shadow-lg mb-6 mx-auto w-fit">
          <Activity className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">FitTracker</h1>
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  )
}
