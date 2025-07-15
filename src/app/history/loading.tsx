import { Loader2, History } from "lucide-react"

export default function HistoryLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-gray-600">Loading workout history...</p>
      <History className="h-24 w-24 text-gray-200 mt-8" />
    </div>
  )
}
