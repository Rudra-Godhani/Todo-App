"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus, Activity, Clock, Flame } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Workout } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns"

type ViewMode = "month" | "week" | "agenda"

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user, currentDate])

  const fetchWorkouts = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get date range based on view
      const start = startOfWeek(startOfMonth(currentDate))
      const end = endOfWeek(endOfMonth(currentDate))

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"))
        .order("date", { ascending: true })

      if (error) {
        console.error("Error fetching workouts:", error)
      } else {
        setWorkouts(data || [])
      }
    } catch (error) {
      console.error("Error fetching workouts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getWorkoutsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return workouts.filter((workout) => workout.date === dateString)
  }

  const getWorkoutTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cardio: "bg-red-100 text-red-800",
      strength: "bg-blue-100 text-blue-800",
      yoga: "bg-purple-100 text-purple-800",
      hiit: "bg-orange-100 text-orange-800",
      stretching: "bg-green-100 text-green-800",
      running: "bg-red-100 text-red-800",
      cycling: "bg-yellow-100 text-yellow-800",
      swimming: "bg-cyan-100 text-cyan-800",
      pilates: "bg-pink-100 text-pink-800",
      crossfit: "bg-gray-100 text-gray-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedDateWorkouts(getWorkoutsForDate(date))
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, index) => {
          const dayWorkouts = getWorkoutsForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                ${!isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"}
                ${isToday ? "ring-2 ring-primary" : ""}
                animate-in fade-in-0 duration-1000
              `}
              style={{ animationDelay: `${index * 20}ms` }}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{format(day, "d")}</div>

              <div className="space-y-1">
                {dayWorkouts.slice(0, 2).map((workout) => (
                  <div
                    key={workout.id}
                    className={`text-xs px-1 py-0.5 rounded truncate ${getWorkoutTypeColor(workout.workout_type)}`}
                  >
                    {workout.title}
                  </div>
                ))}
                {dayWorkouts.length > 2 && <div className="text-xs text-gray-500">+{dayWorkouts.length - 2} more</div>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(currentDate),
    })

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayWorkouts = getWorkoutsForDate(day)
          const isToday = isSameDay(day, new Date())

          return (
            <Card
              key={day.toISOString()}
              className={`cursor-pointer hover:shadow-md transition-shadow animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 ${isToday ? "ring-2 ring-primary" : ""}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleDateClick(day)}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${isToday ? "text-primary" : ""}`}>{format(day, "EEE d")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {dayWorkouts.map((workout) => (
                    <div key={workout.id} className="text-xs">
                      <Badge className={getWorkoutTypeColor(workout.workout_type)}>{workout.workout_type}</Badge>
                      <p className="mt-1 truncate">{workout.title}</p>
                      <p className="text-gray-500">{workout.duration} min</p>
                    </div>
                  ))}
                  {dayWorkouts.length === 0 && <p className="text-xs text-gray-400">No workouts</p>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderAgendaView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const monthWorkouts = workouts.filter((workout) => {
      const workoutDate = parseISO(workout.date)
      return workoutDate >= monthStart && workoutDate <= monthEnd
    })

    const groupedWorkouts = monthWorkouts.reduce(
      (acc, workout) => {
        const date = workout.date
        if (!acc[date]) acc[date] = []
        acc[date].push(workout)
        return acc
      },
      {} as Record<string, Workout[]>,
    )

    return (
      <div className="space-y-4">
        {Object.entries(groupedWorkouts).map(([date, dayWorkouts], index) => (
          <Card
            key={date}
            className={`animate-in fade-in-0 slide-in-from-left-4 duration-1000`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <CardTitle className="text-lg">{format(parseISO(date), "EEEE, MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dayWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getWorkoutTypeColor(workout.workout_type)}>{workout.workout_type}</Badge>
                        <h4 className="font-medium">{workout.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {workout.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {workout.calories_burned} cal
                        </div>
                        {workout.start_time && <span>at {workout.start_time}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {Object.keys(groupedWorkouts).length === 0 && (
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts this month</h3>
              <p className="text-gray-500 mb-6">Start your fitness journey by logging your first workout</p>
              <Link href="/workouts/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Workout
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workout Calendar</h1>
            <p className="text-gray-600">Plan and track your fitness schedule</p>
          </div>
          <Link href="/workouts/add">
            <Button className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Workout
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <Card className="mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-1000 delay-300">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold min-w-[200px] text-center">
                    {format(currentDate, "MMMM yyyy")}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>

              {/* View Mode */}
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Content */}
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-500">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {viewMode === "month" && renderMonthView()}
                {viewMode === "week" && renderWeekView()}
                {viewMode === "agenda" && renderAgendaView()}
              </>
            )}
          </CardContent>
        </Card>

        {/* Day Details Modal */}
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedDateWorkouts.length > 0 ? (
                <>
                  {selectedDateWorkouts.map((workout) => (
                    <div key={workout.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getWorkoutTypeColor(workout.workout_type)}>{workout.workout_type}</Badge>
                        <h4 className="font-medium">{workout.title}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {workout.duration} min
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {workout.calories_burned} cal
                        </div>
                        {workout.start_time && <span>at {workout.start_time}</span>}
                      </div>
                      {workout.notes && <p className="text-sm text-gray-600 mt-2">{workout.notes}</p>}
                    </div>
                  ))}
                  <Link href="/workouts">
                    <Button variant="outline" className="w-full bg-transparent">
                      View All Workouts
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-6">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">No workouts scheduled for this day</p>
                  <Link href={`/workouts/add?date=${selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workout
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
