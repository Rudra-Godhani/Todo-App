"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { getGreeting, calculateWorkoutStreak } from "@/lib/utils"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Dumbbell, Flame, Clock, TrendingUp, Activity, CalendarDays, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation" // Import router
import { Target } from "lucide-react" // Import Target
import { History } from "lucide-react" // Import History
import type { DashboardStats, WeeklyData } from "@/types/app"
import type { Workout, Goal } from "@/types/database"
import { Progress } from "@/components/ui/progress"
import { getStatusColor } from "@/lib/utils"
import { format } from "date-fns"

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [activeGoals, setActiveGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter() // Declare router

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    if (!user) return

    try {
      // Fetch workouts
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(50) // Fetch enough to calculate stats

      if (workoutsError) throw workoutsError

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("end_date", { ascending: true })

      if (goalsError) throw goalsError

      // Calculate stats
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

      const workoutsThisWeek = workouts.filter((w) => {
        const workoutDate = new Date(w.date)
        return workoutDate >= startOfWeek && workoutDate <= endOfWeek
      })

      const totalWorkoutsThisWeek = workoutsThisWeek.length
      const totalMinutesExercised = workoutsThisWeek.reduce((sum, w) => sum + w.duration, 0)
      const totalCaloriesBurned = workoutsThisWeek.reduce((sum, w) => sum + (w.calories_burned || 0), 0)
      const workoutStreak = calculateWorkoutStreak(workouts)

      const workoutTypeCounts: { [key: string]: number } = {}
      workouts.forEach((w) => {
        workoutTypeCounts[w.workout_type] = (workoutTypeCounts[w.workout_type] || 0) + 1
      })
      const mostFrequentWorkoutType =
        Object.keys(workoutTypeCounts).length > 0
          ? Object.keys(workoutTypeCounts).reduce((a, b) => (workoutTypeCounts[a] > workoutTypeCounts[b] ? a : b))
          : "N/A"

      setStats({
        totalWorkoutsThisWeek,
        totalMinutesExercised,
        totalCaloriesBurned,
        workoutStreak,
        mostFrequentWorkoutType,
      })

      // Prepare weekly data for chart
      const weeklySummary: { [key: string]: { workouts: number; minutes: number } } = {}
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        weeklySummary[daysOfWeek[date.getDay()]] = { workouts: 0, minutes: 0 }
      }

      workoutsThisWeek.forEach((w) => {
        const day = daysOfWeek[new Date(w.date).getDay()]
        weeklySummary[day].workouts += 1
        weeklySummary[day].minutes += w.duration
      })

      setWeeklyData(
        daysOfWeek.map((day) => ({
          day,
          workouts: weeklySummary[day].workouts,
          minutes: weeklySummary[day].minutes,
        })),
      )

      setRecentWorkouts(workouts.slice(0, 5))
      setActiveGoals(goals)
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err.message)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<Activity className="h-16 w-16" />}
          title="Error Loading Dashboard"
          description={error}
          action={{ label: "Retry", onClick: fetchDashboardData }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        {getGreeting()}, {profile?.full_name || user?.email}!
      </h1>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Workouts This Week"
          value={stats?.totalWorkoutsThisWeek || 0}
          description="Total sessions completed"
          icon={<Dumbbell className="h-5 w-5 text-muted-foreground" />}
          delay={100}
        />
        <StatCard
          title="Minutes Exercised"
          value={stats?.totalMinutesExercised || 0}
          description="Total duration this week"
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
          delay={200}
        />
        <StatCard
          title="Calories Burned"
          value={stats?.totalCaloriesBurned || 0}
          description="Estimated calories this week"
          icon={<Flame className="h-5 w-5 text-muted-foreground" />}
          delay={300}
        />
        <StatCard
          title="Workout Streak"
          value={stats?.workoutStreak || 0}
          description="Consecutive days with a workout"
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
          delay={400}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Activity Chart */}
        <Card className="lg:col-span-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Workouts and minutes per day this week</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 && weeklyData.some((d) => d.workouts > 0 || d.minutes > 0) ? (
              <ChartContainer
                config={{
                  workouts: {
                    label: "Workouts",
                    color: "hsl(var(--primary))",
                  },
                  minutes: {
                    label: "Minutes",
                    color: "hsl(var(--secondary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary))" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="workouts" fill="var(--color-workouts)" radius={4} />
                    <Bar yAxisId="right" dataKey="minutes" fill="var(--color-minutes)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <EmptyState
                icon={<CalendarDays className="h-12 w-12" />}
                title="No Activity This Week"
                description="Log a workout to see your weekly progress here."
                action={{ label: "Add Workout", onClick: () => router.push("/workouts/add") }}
              />
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-700">
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>Your current fitness objectives</CardDescription>
          </CardHeader>
          <CardContent>
            {activeGoals.length > 0 ? (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{goal.title}</h4>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {goal.goal_type.replace(/_/g, " ")}: {goal.current_value} / {goal.target_value} {goal.unit}
                    </p>
                    <Progress value={(goal.current_value / goal.target_value) * 100} className="h-2" />
                    {goal.end_date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Ends: {format(new Date(goal.end_date), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Target className="h-12 w-12" />}
                title="No Active Goals"
                description="Set new goals to stay motivated and track your progress."
                action={{ label: "Set a Goal", onClick: () => router.push("/goals") }}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <Card className="lg:col-span-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-800">
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <CardDescription>Your latest completed sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length > 0 ? (
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <h4 className="font-medium">{workout.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {workout.workout_type} &bull; {workout.duration} mins &bull;{" "}
                        {format(new Date(workout.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(workout.status)}`}>
                      {workout.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<History className="h-12 w-12" />}
                title="No Recent Workouts"
                description="Log your first workout to see it here."
                action={{ label: "Log Workout", onClick: () => router.push("/workouts/add") }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
