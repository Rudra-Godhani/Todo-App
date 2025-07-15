"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Filter, Calendar, Clock, Flame, Target, StickyNote } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Workout } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { format, parseISO } from "date-fns"
import { useToast } from "@/hooks/use-toast"

const workoutTypes = [
  "cardio",
  "strength",
  "yoga",
  "hiit",
  "stretching",
  "running",
  "cycling",
  "swimming",
  "pilates",
  "crossfit",
]

const intensityLevels = ["low", "medium", "high"]

export default function HistoryPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterIntensity, setFilterIntensity] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [durationMin, setDurationMin] = useState("")
  const [durationMax, setDurationMax] = useState("")
  const [caloriesMin, setCaloriesMin] = useState("")
  const [caloriesMax, setCaloriesMax] = useState("")

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user])

  useEffect(() => {
    filterWorkouts()
  }, [
    workouts,
    searchTerm,
    filterType,
    filterIntensity,
    filterStatus,
    dateFrom,
    dateTo,
    durationMin,
    durationMax,
    caloriesMin,
    caloriesMax,
  ])

  const fetchWorkouts = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch workout history",
          variant: "destructive",
        })
      } else {
        setWorkouts(data || [])
      }
    } catch (error) {
      console.error("Error fetching workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterWorkouts = () => {
    const filtered = workouts.filter((workout) => {
      // Search filter
      const matchesSearch =
        workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.workout_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workout.notes && workout.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      // Type filter
      const matchesType = filterType === "all" || workout.workout_type === filterType

      // Intensity filter
      const matchesIntensity = filterIntensity === "all" || workout.intensity === filterIntensity

      // Status filter
      const matchesStatus = filterStatus === "all" || workout.status === filterStatus

      // Date range filter
      const workoutDate = parseISO(workout.date)
      const matchesDateFrom = !dateFrom || workoutDate >= parseISO(dateFrom)
      const matchesDateTo = !dateTo || workoutDate <= parseISO(dateTo)

      // Duration range filter
      const matchesDurationMin = !durationMin || workout.duration >= Number.parseInt(durationMin)
      const matchesDurationMax = !durationMax || workout.duration <= Number.parseInt(durationMax)

      // Calories range filter
      const matchesCaloriesMin = !caloriesMin || workout.calories_burned >= Number.parseInt(caloriesMin)
      const matchesCaloriesMax = !caloriesMax || workout.calories_burned <= Number.parseInt(caloriesMax)

      return (
        matchesSearch &&
        matchesType &&
        matchesIntensity &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesDurationMin &&
        matchesDurationMax &&
        matchesCaloriesMin &&
        matchesCaloriesMax
      )
    })

    setFilteredWorkouts(filtered)
  }

  const exportToCSV = () => {
    const headers = ["Date", "Title", "Type", "Duration (min)", "Intensity", "Calories", "Equipment", "Status", "Notes"]

    const csvData = filteredWorkouts.map((workout) => [
      workout.date,
      workout.title,
      workout.workout_type,
      workout.duration,
      workout.intensity,
      workout.calories_burned,
      workout.equipment_used || "",
      workout.status,
      workout.notes || "",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `workout-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Your workout history has been exported to CSV",
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setFilterIntensity("all")
    setFilterStatus("all")
    setDateFrom("")
    setDateTo("")
    setDurationMin("")
    setDurationMax("")
    setCaloriesMin("")
    setCaloriesMax("")
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "planned":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workout History</h1>
            <p className="text-gray-600">Complete record of your fitness journey</p>
          </div>
          <Button onClick={exportToCSV} className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-200">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-1000 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search workouts, types, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterIntensity} onValueChange={setFilterIntensity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Intensities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intensities</SelectItem>
                  {intensityLevels.map((intensity) => (
                    <SelectItem key={intensity} value={intensity}>
                      {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>

            {/* Filter Row 2 - Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            {/* Filter Row 3 - Duration and Calories Range */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Min Duration (min)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Duration (min)</label>
                <Input
                  type="number"
                  placeholder="999"
                  value={durationMax}
                  onChange={(e) => setDurationMax(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Min Calories</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={caloriesMin}
                  onChange={(e) => setCaloriesMin(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Calories</label>
                <Input
                  type="number"
                  placeholder="9999"
                  value={caloriesMax}
                  onChange={(e) => setCaloriesMax(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4 animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-500">
          <p className="text-sm text-gray-600">
            Showing {filteredWorkouts.length} of {workouts.length} workouts
          </p>
        </div>

        {/* Workout Table */}
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-600">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredWorkouts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Date
                        </div>
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4" />
                          Duration
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Target className="h-4 w-4" />
                          Intensity
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Flame className="h-4 w-4" />
                          Calories
                        </div>
                      </TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <StickyNote className="h-4 w-4" />
                          Notes
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkouts.map((workout, index) => (
                      <TableRow
                        key={workout.id}
                        className="animate-in fade-in-0 slide-in-from-left-4 duration-1000"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium">{format(parseISO(workout.date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium">{workout.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {workout.workout_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{workout.duration} min</TableCell>
                        <TableCell className="text-center">
                          <Badge className={getIntensityColor(workout.intensity)}>{workout.intensity}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{workout.calories_burned}</TableCell>
                        <TableCell>{workout.equipment_used || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(workout.status)}>{workout.status}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {workout.notes ? (
                            <span className="text-sm line-clamp-2" title={workout.notes}>
                              {workout.notes}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ||
                  filterType !== "all" ||
                  filterIntensity !== "all" ||
                  filterStatus !== "all" ||
                  dateFrom ||
                  dateTo ||
                  durationMin ||
                  durationMax ||
                  caloriesMin ||
                  caloriesMax
                    ? "Try adjusting your filters or search terms"
                    : "Start your fitness journey by logging your first workout"}
                </p>
                <Button onClick={clearFilters} variant="outline" className="mr-2 bg-transparent">
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
