"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Copy, Calendar, Clock, Flame, Target } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Workout } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

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

export default function WorkoutsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterIntensity, setFilterIntensity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [deleteWorkout, setDeleteWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user])

  useEffect(() => {
    filterAndSortWorkouts()
  }, [workouts, searchTerm, filterType, filterIntensity, sortBy])

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
          description: "Failed to fetch workouts",
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

  const filterAndSortWorkouts = () => {
    const filtered = workouts.filter((workout) => {
      const matchesSearch =
        workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.workout_type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || workout.workout_type === filterType
      const matchesIntensity = filterIntensity === "all" || workout.intensity === filterIntensity

      return matchesSearch && matchesType && matchesIntensity
    })

    // Sort workouts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "duration-desc":
          return b.duration - a.duration
        case "duration-asc":
          return a.duration - b.duration
        case "calories-desc":
          return b.calories_burned - a.calories_burned
        case "calories-asc":
          return a.calories_burned - b.calories_burned
        default:
          return 0
      }
    })

    setFilteredWorkouts(filtered)
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase.from("workouts").delete().eq("id", workoutId).eq("user_id", user?.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete workout",
          variant: "destructive",
        })
      } else {
        setWorkouts(workouts.filter((w) => w.id !== workoutId))
        toast({
          title: "Success",
          description: "Workout deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting workout:", error)
    }
    setDeleteWorkout(null)
  }

  const handleDuplicateWorkout = async (workout: Workout) => {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert([
          {
            user_id: user!.id,
            title: `${workout.title} (Copy)`,
            workout_type: workout.workout_type,
            date: new Date().toISOString().split("T")[0],
            start_time: workout.start_time,
            end_time: workout.end_time,
            duration: workout.duration,
            intensity: workout.intensity,
            calories_burned: workout.calories_burned,
            equipment_used: workout.equipment_used,
            notes: workout.notes,
            tags: workout.tags,
            status: "planned",
          },
        ])
        .select()
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to duplicate workout",
          variant: "destructive",
        })
      } else {
        setWorkouts([data, ...workouts])
        toast({
          title: "Success",
          description: "Workout duplicated successfully",
        })
      }
    } catch (error) {
      console.error("Error duplicating workout:", error)
    }
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
            <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>
            <p className="text-gray-600">Manage and track all your fitness sessions</p>
          </div>
          <Link href="/workouts/add">
            <Button className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Workout
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-1000 delay-300">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search workouts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
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
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Intensity" />
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="duration-desc">Longest First</SelectItem>
                    <SelectItem value="duration-asc">Shortest First</SelectItem>
                    <SelectItem value="calories-desc">Most Calories</SelectItem>
                    <SelectItem value="calories-asc">Least Calories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workouts List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout, index) => (
              <Card
                key={workout.id}
                className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 hover:shadow-lg transition-shadow`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-1">{workout.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {workout.workout_type}
                        </Badge>
                        <Badge className={getIntensityColor(workout.intensity)}>{workout.intensity}</Badge>
                        <Badge className={getStatusColor(workout.status)}>{workout.status}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/workouts/edit/${workout.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateWorkout(workout)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteWorkout(workout)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(workout.date), "MMM d, yyyy")}
                      </div>
                      {workout.start_time && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          {workout.start_time}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span>{workout.calories_burned} cal</span>
                      </div>
                    </div>

                    {workout.equipment_used && (
                      <div className="text-sm text-gray-600">
                        <strong>Equipment:</strong> {workout.equipment_used}
                      </div>
                    )}

                    {workout.notes && (
                      <div className="text-sm text-gray-600 line-clamp-2">
                        <strong>Notes:</strong> {workout.notes}
                      </div>
                    )}

                    {workout.tags && workout.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {workout.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {workout.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{workout.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterType !== "all" || filterIntensity !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Start your fitness journey by logging your first workout"}
              </p>
              <Link href="/workouts/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Workout
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteWorkout} onOpenChange={() => setDeleteWorkout(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Workout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteWorkout?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteWorkout && handleDeleteWorkout(deleteWorkout.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
