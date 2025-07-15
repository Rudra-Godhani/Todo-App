"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { WorkoutForm } from "@/components/forms/workout-form"
import type { WorkoutFormData } from "@/types/app"
import { Loader2 } from "lucide-react"

export default function AddWorkoutPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddWorkout = async (formData: WorkoutFormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add a workout.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("workouts").insert({
        user_id: user.id,
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

      if (error) throw error

      toast({
        title: "Workout Added",
        description: "Your workout has been successfully logged!",
      })
      router.push("/workouts")
    } catch (err: any) {
      console.error("Error adding workout:", err.message)
      toast({
        title: "Error",
        description: `Failed to add workout: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Workout</CardTitle>
          <CardDescription>Log your latest fitness session or plan an upcoming one.</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkoutForm onSubmit={handleAddWorkout} onCancel={() => router.push("/workouts")} loading={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  )
}
