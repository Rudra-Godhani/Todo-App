"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Target, Plus, Loader2, Edit, Trash } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"
import type { Goal } from "@/types/database"
import type { GoalFormData } from "@/types/app"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { GoalForm } from "@/components/forms/goal-form"
import { getStatusColor } from "@/lib/utils"

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchGoals()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchGoals = async () => {
    setLoading(true)
    setError(null)
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("end_date", { ascending: true })

      if (error) throw error
      setGoals(data || [])
    } catch (err: any) {
      console.error("Error fetching goals:", err.message)
      setError("Failed to load goals. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load goals.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async (formData: GoalFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        title: formData.title,
        goal_type: formData.goal_type,
        target_value: Number.parseInt(formData.target_value),
        unit: formData.unit,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        current_value: 0, // New goals start at 0 progress
      })

      if (error) throw error

      toast({
        title: "Goal Created",
        description: "Your new fitness goal has been added!",
      })
      setIsAddGoalDialogOpen(false)
      fetchGoals() // Re-fetch to update the list
    } catch (err: any) {
      console.error("Error adding goal:", err.message)
      toast({
        title: "Error",
        description: `Failed to add goal: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsDeleteDialogOpen(true)
  }

  const handleUpdateGoal = async (formData: GoalFormData) => {
    if (!selectedGoal || !user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("goals")
        .update({
          title: formData.title,
          goal_type: formData.goal_type,
          target_value: Number.parseInt(formData.target_value),
          unit: formData.unit,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          // current_value is updated separately or by triggers
        })
        .eq("id", selectedGoal.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Goal Updated",
        description: "Your goal has been successfully updated.",
      })
      setIsEditDialogOpen(false)
      fetchGoals() // Re-fetch to update the list
    } catch (err: any) {
      console.error("Error updating goal:", err.message)
      toast({
        title: "Error",
        description: `Failed to update goal: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!selectedGoal || !user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("goals").delete().eq("id", selectedGoal.id).eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Goal Deleted",
        description: "Your goal has been successfully deleted.",
      })
      setIsDeleteDialogOpen(false)
      fetchGoals() // Re-fetch to update the list
    } catch (err: any) {
      console.error("Error deleting goal:", err.message)
      toast({
        title: "Error",
        description: `Failed to delete goal: ${err.message}`,
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
        <p className="mt-4 text-lg text-gray-600">Loading your goals...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<Target className="h-16 w-16" />}
          title="Error Loading Goals"
          description={error}
          action={{ label: "Retry", onClick: fetchGoals }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold">My Goals</h1>
        <Button onClick={() => setIsAddGoalDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Set New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-16 w-16" />}
          title="No Goals Set Yet"
          description="Set new fitness goals to stay motivated and track your progress."
          action={{ label: "Set Your First Goal", onClick: () => setIsAddGoalDialogOpen(true) }}
          className="animate-in fade-in-0 duration-700"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{goal.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(goal)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(goal)}>
                      <Trash className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {goal.goal_type.replace(/_/g, " ")} &bull; {format(new Date(goal.start_date), "MMM dd, yyyy")}
                  {goal.end_date && ` - ${format(new Date(goal.end_date), "MMM dd, yyyy")}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </span>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </Badge>
                </div>
                <Progress value={(goal.current_value / goal.target_value) * 100} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Progress: {((goal.current_value / goal.target_value) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set New Goal</DialogTitle>
            <DialogDescription>Define your next fitness objective.</DialogDescription>
          </DialogHeader>
          <GoalForm onSubmit={handleAddGoal} onCancel={() => setIsAddGoalDialogOpen(false)} loading={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      {selectedGoal && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
              <DialogDescription>Update your goal details.</DialogDescription>
            </DialogHeader>
            <GoalForm
              initialData={{
                title: selectedGoal.title,
                goal_type: selectedGoal.goal_type,
                target_value: selectedGoal.target_value.toString(),
                unit: selectedGoal.unit,
                start_date: selectedGoal.start_date,
                end_date: selectedGoal.end_date || "",
              }}
              onSubmit={handleUpdateGoal}
              onCancel={() => setIsEditDialogOpen(false)}
              submitLabel="Update Goal"
              loading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Goal Dialog */}
      {selectedGoal && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your goal:{" "}
                <span className="font-medium">{selectedGoal.title}</span>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteGoal} disabled={isSubmitting}>
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
