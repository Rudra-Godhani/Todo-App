"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { getIntensityColor, getWorkoutTypeColor, exportToCSV } from "@/lib/utils"
import { History, Loader2, Download, Filter, Search, Edit, Trash } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Workout } from "@/types/database"
import { WORKOUT_TYPES, INTENSITY_LEVELS } from "@/types/app"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { WorkoutForm } from "@/components/forms/workout-form"
import type { WorkoutFormData } from "@/types/app"

export default function WorkoutHistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterIntensity, setFilterIntensity] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchWorkouts()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchWorkouts = async () => {
    setLoading(true)
    setError(null)
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false })

      if (error) throw error
      setWorkouts(data || [])
    } catch (err: any) {
      console.error("Error fetching workouts:", err.message)
      setError("Failed to load workout history. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load workout history.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch =
      workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.workout_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.equipment_used?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || workout.workout_type === filterType
    const matchesIntensity = filterIntensity === "all" || workout.intensity === filterIntensity

    return matchesSearch && matchesType && matchesIntensity
  })

  const handleExport = () => {
    if (filteredWorkouts.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no workouts matching your current filters to export.",
        variant: "default",
      })
      return
    }
    exportToCSV(filteredWorkouts, "fittracker_workout_history.csv")
    toast({
      title: "Export Successful",
      description: "Your filtered workout data has been exported to CSV.",
    })
  }

  const handleEditClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsDeleteDialogOpen(true)
  }

  const handleUpdateWorkout = async (formData: WorkoutFormData) => {
    if (!selectedWorkout || !user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("workouts")
        .update({
          title: formData.title,
          workout_type: formData.workout_type,
          date: formData.date,
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          duration: Number.parseInt(formData.duration),
          intensity: formData.intensity as "low" | "medium" | "high",
          calories_burned: formData.calories_burned ? Number.parseInt(formData.calories_burned) : null,
          equipment_used: formData.equipment_used || null,
          notes: formData.notes || null,
          status: formData.status as "completed" | "planned",
        })
        .eq("id", selectedWorkout.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Workout Updated",
        description: "Your workout has been successfully updated.",
      })
      setIsEditDialogOpen(false)
      fetchWorkouts() // Re-fetch to update the list
    } catch (err: any) {
      console.error("Error updating workout:", err.message)
      toast({
        title: "Error",
        description: `Failed to update workout: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteWorkout = async () => {
    if (!selectedWorkout || !user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("workouts").delete().eq("id", selectedWorkout.id).eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Workout Deleted",
        description: "Your workout has been successfully deleted.",
      })
      setIsDeleteDialogOpen(false)
      fetchWorkouts() // Re-fetch to update the list
    } catch (err: any) {
      console.error("Error deleting workout:", err.message)
      toast({
        title: "Error",
        description: `Failed to delete workout: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Loading workout history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<History className="h-16 w-16" />}
          title="Error Loading History"
          description={error}
          action={{ label: "Retry", onClick: fetchWorkouts }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold">Workout History</h1>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
          <CardDescription>Find specific workouts by type, intensity, or keywords.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, notes, equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {WORKOUT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterIntensity} onValueChange={setFilterIntensity}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by Intensity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intensities</SelectItem>
                {INTENSITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredWorkouts.length === 0 ? (
        <EmptyState
          icon={<History className="h-16 w-16" />}
          title="No Workouts Found"
          description="Adjust your filters or add new workouts to see them here."
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearchTerm("")
              setFilterType("all")
              setFilterIntensity("all")
            },
          }}
          className="animate-in fade-in-0 duration-700"
        />
      ) : (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Intensity</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkouts.map((workout) => (
                    <TableRow key={workout.id}>
                      <TableCell>{format(new Date(workout.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-medium">{workout.title}</TableCell>
                      <TableCell>
                        <Badge className={getWorkoutTypeColor(workout.workout_type)}>
                          {workout.workout_type.charAt(0).toUpperCase() + workout.workout_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{workout.duration} mins</TableCell>
                      <TableCell>
                        <Badge className={getIntensityColor(workout.intensity)}>
                          {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{workout.calories_burned || "N/A"}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{workout.equipment_used || "N/A"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{workout.notes || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(workout)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(workout)}>
                            <Trash className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Workout Dialog */}
      {selectedWorkout && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Workout</DialogTitle>
              <DialogDescription>Make changes to your workout here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <WorkoutForm
              initialData={{
                title: selectedWorkout.title,
                workout_type: selectedWorkout.workout_type,
                date: selectedWorkout.date,
                start_time: selectedWorkout.start_time || "",
                end_time: selectedWorkout.end_time || "",
                duration: selectedWorkout.duration.toString(),
                intensity: selectedWorkout.intensity,
                calories_burned: selectedWorkout.calories_burned?.toString() || "",
                equipment_used: selectedWorkout.equipment_used || "",
                notes: selectedWorkout.notes || "",
                status: selectedWorkout.status,
              }}
              onSubmit={handleUpdateWorkout}
              onCancel={() => setIsEditDialogOpen(false)}
              submitLabel="Update Workout"
              loading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Workout Dialog */}
      {selectedWorkout && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your workout:{" "}
                <span className="font-medium">{selectedWorkout.title}</span>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteWorkout} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
