"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  format,
  startOfWeek,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, Plus, Edit, Trash, Dumbbell } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getWorkoutTypeColor, getIntensityColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { WorkoutForm } from "@/components/forms/workout-form"
import type { Workout } from "@/types/database"
import type { WorkoutFormData, ViewMode } from "@/types/app"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<Workout[]>([])
  const [isWorkoutDetailsOpen, setIsWorkoutDetailsOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("month")

  useEffect(() => {
    if (!authLoading && user) {
      fetchWorkoutsForMonth()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading, currentDate])

  const fetchWorkoutsForMonth = async () => {
    setLoading(true)
    setError(null)
    if (!user) return

    const startOfMonthDate = format(startOfMonth(currentDate), "yyyy-MM-dd")
    const endOfMonthDate = format(endOfMonth(currentDate), "yyyy-MM-dd")

    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startOfMonthDate)
        .lte("date", endOfMonthDate)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })

      if (error) throw error
      setWorkouts(data || [])
    } catch (err: any) {
      console.error("Error fetching workouts:", err.message)
      setError("Failed to load workouts for the calendar. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load workouts for the calendar.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })
    return days
  }

  const getWorkoutsForDay = (day: Date) => {
    return workouts.filter((workout) => isSameDay(parseISO(workout.date), day))
  }

  const handleDayClick = (day: Date) => {
    const workoutsForThisDay = getWorkoutsForDay(day)
    setSelectedDayWorkouts(workoutsForThisDay)
    setIsWorkoutDetailsOpen(true)
  }

  const handleEditClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsEditDialogOpen(true)
    setIsWorkoutDetailsOpen(false) // Close details dialog if open
  }

  const handleDeleteClick = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsDeleteDialogOpen(true)
    setIsWorkoutDetailsOpen(false) // Close details dialog if open
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
      fetchWorkoutsForMonth() // Re-fetch to update the calendar
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
      fetchWorkoutsForMonth() // Re-fetch to update the calendar
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
        <p className="mt-4 text-lg text-gray-600">Loading calendar...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<CalendarDays className="h-16 w-16" />}
          title="Error Loading Calendar"
          description={error}
          action={{ label: "Retry", onClick: fetchWorkoutsForMonth }}
        />
      </div>
    )
  }

  const daysInMonth = getDaysInMonth()
  const firstDayOfMonth = startOfMonth(currentDate)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Fitness Calendar</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push("/workouts/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Workout
          </Button>
        </div>
      </div>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{format(currentDate, "MMMM yyyy")}</CardTitle>
          <CardDescription className="text-center">Click on a day to see or add workouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-center font-medium text-sm mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, index) => {
              const dayWorkouts = getWorkoutsForDay(day)
              const isCurrentMonth = day.getMonth() === currentDate.getMonth()
              const isTodayDate = isToday(day)

              return (
                <div
                  key={index}
                  className={`relative p-2 h-28 border rounded-md flex flex-col items-center cursor-pointer transition-all duration-200
                    ${isCurrentMonth ? "bg-background hover:bg-muted" : "bg-muted/50 text-muted-foreground"}
                    ${isTodayDate ? "border-primary ring-2 ring-primary/50" : ""}
                  `}
                  onClick={() => handleDayClick(day)}
                >
                  <span className={`font-semibold ${isTodayDate ? "text-primary" : ""}`}>{format(day, "d")}</span>
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden w-full">
                    {dayWorkouts.slice(0, 2).map((workout) => (
                      <Badge
                        key={workout.id}
                        className={`w-full justify-center text-xs px-1 py-0.5 truncate ${getWorkoutTypeColor(workout.workout_type)}`}
                      >
                        {workout.title}
                      </Badge>
                    ))}
                    {dayWorkouts.length > 2 && (
                      <span className="text-xs text-muted-foreground text-center">+{dayWorkouts.length - 2} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workout Details Dialog */}
      <Dialog open={isWorkoutDetailsOpen} onOpenChange={setIsWorkoutDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Workouts on{" "}
              {selectedDayWorkouts.length > 0 ? format(parseISO(selectedDayWorkouts[0].date), "MMM dd, yyyy") : ""}
            </DialogTitle>
            <DialogDescription>Details of your fitness sessions for this day.</DialogDescription>
          </DialogHeader>
          {selectedDayWorkouts.length > 0 ? (
            <div className="space-y-4 py-4">
              {selectedDayWorkouts.map((workout) => (
                <div key={workout.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{workout.title}</h3>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(workout)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(workout)}>
                        <Trash className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <Badge className={getWorkoutTypeColor(workout.workout_type)}>
                      {workout.workout_type.charAt(0).toUpperCase() + workout.workout_type.slice(1)}
                    </Badge>{" "}
                    &bull; {workout.duration} mins &bull;{" "}
                    <Badge className={getIntensityColor(workout.intensity)}>
                      {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
                    </Badge>
                  </p>
                  {workout.start_time && workout.end_time && (
                    <p className="text-sm text-muted-foreground">
                      {workout.start_time} - {workout.end_time}
                    </p>
                  )}
                  {workout.calories_burned && (
                    <p className="text-sm text-muted-foreground">Calories Burned: {workout.calories_burned}</p>
                  )}
                  {workout.equipment_used && (
                    <p className="text-sm text-muted-foreground">Equipment: {workout.equipment_used}</p>
                  )}
                  {workout.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {workout.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Dumbbell className="h-12 w-12" />}
              title="No Workouts"
              description="No workouts logged for this day."
            />
          )}
        </DialogContent>
      </Dialog>

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
