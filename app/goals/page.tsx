"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Archive,
  Trophy,
  Calendar,
  Activity,
  Clock,
  Flame,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase, type Goal, type Workout } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"

interface GoalFormData {
  title: string
  goal_type: string
  target_value: string
  unit: string
  start_date: string
  end_date: string
}

export default function GoalsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    goal_type: "weekly_workouts",
    target_value: "",
    unit: "sessions",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  })

  const goalTypes = [
    { value: "weekly_workouts", label: "Weekly Workouts", unit: "sessions" },
    { value: "weekly_duration", label: "Weekly Duration", unit: "minutes" },
    { value: "weekly_calories", label: "Weekly Calories", unit: "calories" },
    { value: "monthly_workouts", label: "Monthly Workouts", unit: "sessions" },
    { value: "monthly_duration", label: "Monthly Duration", unit: "minutes" },
    { value: "monthly_calories", label: "Monthly Calories", unit: "calories" },
    { value: "custom", label: "Custom Goal", unit: "custom" },
  ]

  useEffect(() => {
    if (user) {
      fetchGoalsAndWorkouts()
    }
  }, [user])

  const fetchGoalsAndWorkouts = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      // Fetch workouts for progress calculation
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")

      if (goalsError || workoutsError) {
        toast({
          title: "Error",
          description: "Failed to fetch goals and workouts",
          variant: "destructive",
        })
      } else {
        setGoals(goalsData || [])
        setWorkouts(workoutsData || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGoalProgress = (goal: Goal) => {
    const now = new Date()
    const startDate = parseISO(goal.start_date)
    const endDate = goal.end_date ? parseISO(goal.end_date) : now

    let relevantWorkouts: Workout[] = []

    if (goal.goal_type.includes("weekly")) {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
      relevantWorkouts = workouts.filter((workout) =>
        isWithinInterval(parseISO(workout.date), { start: weekStart, end: weekEnd }),
      )
    } else if (goal.goal_type.includes("monthly")) {
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)
      relevantWorkouts = workouts.filter((workout) =>
        isWithinInterval(parseISO(workout.date), { start: monthStart, end: monthEnd }),
      )
    } else {
      relevantWorkouts = workouts.filter((workout) =>
        isWithinInterval(parseISO(workout.date), { start: startDate, end: endDate }),
      )
    }

    let currentValue = 0
    if (goal.goal_type.includes("workouts")) {
      currentValue = relevantWorkouts.length
    } else if (goal.goal_type.includes("duration")) {
      currentValue = relevantWorkouts.reduce((sum, workout) => sum + workout.duration, 0)
    } else if (goal.goal_type.includes("calories")) {
      currentValue = relevantWorkouts.reduce((sum, workout) => sum + workout.calories_burned, 0)
    }

    const progress = Math.min((currentValue / goal.target_value) * 100, 100)
    const isCompleted = currentValue >= goal.target_value

    return { currentValue, progress, isCompleted }
  }

  const handleFormChange = (field: keyof GoalFormData) => (value: string) => {
    const newFormData = { ...formData, [field]: value }

    // Auto-set unit based on goal type
    if (field === "goal_type") {
      const goalType = goalTypes.find((type) => type.value === value)
      if (goalType) {
        newFormData.unit = goalType.unit
      }
    }

    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.target_value) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const goalData = {
        user_id: user!.id,
        title: formData.title,
        goal_type: formData.goal_type,
        target_value: Number.parseInt(formData.target_value),
        unit: formData.unit,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        status: "active" as const,
      }

      if (editingGoal) {
        const { error } = await supabase.from("goals").update(goalData).eq("id", editingGoal.id).eq("user_id", user!.id)

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update goal",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Goal updated successfully",
          })
          fetchGoalsAndWorkouts()
          setEditingGoal(null)
        }
      } else {
        const { error } = await supabase.from("goals").insert([goalData])

        if (error) {
          toast({
            title: "Error",
            description: "Failed to create goal",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Goal created successfully",
          })
          fetchGoalsAndWorkouts()
          setShowAddDialog(false)
        }
      }

      // Reset form
      setFormData({
        title: "",
        goal_type: "weekly_workouts",
        target_value: "",
        unit: "sessions",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      })
    } catch (error) {
      console.error("Error saving goal:", error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId).eq("user_id", user!.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete goal",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Goal deleted successfully",
        })
        fetchGoalsAndWorkouts()
      }
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
    setDeleteGoal(null)
  }

  const handleArchiveGoal = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update({ status: "archived" })
        .eq("id", goal.id)
        .eq("user_id", user!.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to archive goal",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Goal archived successfully",
        })
        fetchGoalsAndWorkouts()
      }
    } catch (error) {
      console.error("Error archiving goal:", error)
    }
  }

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      goal_type: goal.goal_type,
      target_value: goal.target_value.toString(),
      unit: goal.unit,
      start_date: goal.start_date,
      end_date: goal.end_date || "",
    })
    setShowAddDialog(true)
  }

  const getGoalIcon = (goalType: string) => {
    if (goalType.includes("workouts")) return <Activity className="h-5 w-5" />
    if (goalType.includes("duration")) return <Clock className="h-5 w-5" />
    if (goalType.includes("calories")) return <Flame className="h-5 w-5" />
    return <Target className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
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
            <h1 className="text-3xl font-bold text-gray-900">Fitness Goals</h1>
            <p className="text-gray-600">Set targets and track your progress</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Workout 3 times per week"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title")(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal_type">Goal Type *</Label>
                  <Select value={formData.goal_type} onValueChange={handleFormChange("goal_type")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {goalTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_value">Target Value *</Label>
                    <Input
                      id="target_value"
                      type="number"
                      min="1"
                      placeholder="5"
                      value={formData.target_value}
                      onChange={(e) => handleFormChange("target_value")(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => handleFormChange("unit")(e.target.value)}
                      placeholder="sessions"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleFormChange("start_date")(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleFormChange("end_date")(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false)
                      setEditingGoal(null)
                      setFormData({
                        title: "",
                        goal_type: "weekly_workouts",
                        target_value: "",
                        unit: "sessions",
                        start_date: new Date().toISOString().split("T")[0],
                        end_date: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Grid */}
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
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal, index) => {
              const { currentValue, progress, isCompleted } = calculateGoalProgress(goal)

              return (
                <Card
                  key={goal.id}
                  className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 hover:shadow-lg transition-shadow ${
                    isCompleted ? "ring-2 ring-green-200" : ""
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getGoalIcon(goal.goal_type)}
                          <CardTitle className="text-lg line-clamp-1">{goal.title}</CardTitle>
                          {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </div>
                        <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(goal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleArchiveGoal(goal)}>
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteGoal(goal)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">
                            {currentValue} / {goal.target_value} {goal.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% complete</div>
                      </div>

                      {/* Goal Details */}
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(parseISO(goal.start_date), "MMM d, yyyy")}
                            {goal.end_date && ` - ${format(parseISO(goal.end_date), "MMM d, yyyy")}`}
                          </span>
                        </div>
                        <div className="capitalize">
                          {goalTypes.find((type) => type.value === goal.goal_type)?.label || goal.goal_type}
                        </div>
                      </div>

                      {/* Motivational Message */}
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                          <Trophy className="h-4 w-4" />
                          <span className="text-sm font-medium">Goal achieved! 🎉</span>
                        </div>
                      ) : progress > 75 ? (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          Almost there! Keep pushing! 💪
                        </div>
                      ) : progress > 50 ? (
                        <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          Great progress! You're halfway there! 🔥
                        </div>
                      ) : progress > 25 ? (
                        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                          Good start! Keep building momentum! ⚡
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          Time to get started! You've got this! 🚀
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set yet</h3>
              <p className="text-gray-500 mb-6">
                Set your first fitness goal to start tracking your progress and stay motivated!
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteGoal} onOpenChange={() => setDeleteGoal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteGoal?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteGoal && handleDeleteGoal(deleteGoal.id)}
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
