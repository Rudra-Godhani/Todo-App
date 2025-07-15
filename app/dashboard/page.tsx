"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, Flame, Target, Plus, Calendar, TrendingUp, Dumbbell } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Workout } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, differenceInDays } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardStats {
  totalWorkoutsThisWeek: number
  totalMinutesExercised: number
  totalCaloriesBurned: number
  workoutStreak: number
  mostFrequentWorkoutType: string
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkoutsThisWeek: 0,
    totalMinutesExercised: 0,
    totalCaloriesBurned: 0,
    workoutStreak: 0,
    mostFrequentWorkoutType: "None",
  })
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; workouts: number; minutes: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch all workouts for calculations
      const { data: allWorkouts, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching workouts:", error)
        return
      }

      const workoutsData = allWorkouts || []
      setWorkouts(workoutsData)

      // Get recent workouts (last 3)
      setRecentWorkouts(workoutsData.slice(0, 3))

      // Calculate stats
      calculateStats(workoutsData)
      generateWeeklyData(workoutsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (workoutsData: Workout[]) => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    // This week's workouts
    const thisWeekWorkouts = workoutsData.filter((workout) =>
      isWithinInterval(parseISO(workout.date), { start: weekStart, end: weekEnd }),
    )

    // Total minutes and calories (all time)
    const totalMinutes = workoutsData.reduce((sum, workout) => sum + workout.duration, 0)
    const totalCalories = workoutsData.reduce((sum, workout) => sum + workout.calories_burned, 0)

    // Most frequent workout type
    const workoutTypeCounts = workoutsData.reduce(
      (acc, workout) => {
        acc[workout.workout_type] = (acc[workout.workout_type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostFrequent = Object.entries(workoutTypeCounts).reduce(
      (max, [type, count]) => (count > max.count ? { type, count } : max),
      { type: "None", count: 0 },
    )

    // Calculate workout streak
    const streak = calculateWorkoutStreak(workoutsData)

    setStats({
      totalWorkoutsThisWeek: thisWeekWorkouts.length,
      totalMinutesExercised: totalMinutes,
      totalCaloriesBurned: totalCalories,
      workoutStreak: streak,
      mostFrequentWorkoutType: mostFrequent.type,
    })
  }

  const calculateWorkoutStreak = (workoutsData: Workout[]): number => {
    if (workoutsData.length === 0) return 0

    const sortedDates = [...new Set(workoutsData.map((w) => w.date))].sort().reverse()
    const today = new Date().toISOString().split("T")[0]

    let streak = 0
    let currentDate = today

    for (const workoutDate of sortedDates) {
      const daysDiff = differenceInDays(parseISO(currentDate), parseISO(workoutDate))

      if (daysDiff === 0) {
        streak++
        currentDate = workoutDate
      } else if (daysDiff === 1) {
        streak++
        currentDate = workoutDate
      } else {
        break
      }
    }

    return streak
  }

  const generateWeeklyData = (workoutsData: Workout[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })

    const weeklyStats = days.map((day, index) => {
      const currentDay = new Date(weekStart)
      currentDay.setDate(weekStart.getDate() + index)
      const dayString = currentDay.toISOString().split("T")[0]

      const dayWorkouts = workoutsData.filter((workout) => workout.date === dayString)
      const totalMinutes = dayWorkouts.reduce((sum, workout) => sum + workout.duration, 0)

      return {
        day,
        workouts: dayWorkouts.length,
        minutes: totalMinutes,
      }
    })

    setWeeklyData(weeklyStats)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {profile?.full_name || user.email?.split("@")[0]}! 👋
          </h1>
          <p className="text-gray-600">Ready to crush your fitness goals today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkoutsThisWeek}</div>
              <p className="text-xs text-muted-foreground">workouts completed</p>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Minutes</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMinutesExercised.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">minutes exercised</p>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCaloriesBurned.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">total calories</p>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.workoutStreak}</div>
              <p className="text-xs text-muted-foreground">consecutive days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Chart */}
          <Card className="lg:col-span-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                This Week's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === "workouts" ? "Workouts" : "Minutes"]} />
                    <Bar dataKey="workouts" fill="#3b82f6" name="workouts" />
                    <Bar dataKey="minutes" fill="#10b981" name="minutes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-600">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/workouts/add">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Log New Workout
                  </Button>
                </Link>
                <Link href="/goals">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Target className="h-4 w-4 mr-2" />
                    View Goals
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar View
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Favorite Workout Type */}
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-700">
              <CardHeader>
                <CardTitle>Favorite Workout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium capitalize">{stats.mostFrequentWorkoutType}</p>
                    <p className="text-sm text-muted-foreground">Most frequent type</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-800">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : recentWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {recentWorkouts.map((workout) => (
                      <div key={workout.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{workout.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {workout.workout_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{workout.duration} min</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{format(parseISO(workout.date), "MMM d")}</div>
                      </div>
                    ))}
                    <Link href="/workouts">
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        View All Workouts
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No workouts yet</p>
                    <Link href="/workouts/add">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Log First Workout
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
