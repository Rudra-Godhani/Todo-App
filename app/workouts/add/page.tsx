"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
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

const intensityLevels = [
  { value: "low", label: "Low", description: "Light activity, easy pace" },
  { value: "medium", label: "Medium", description: "Moderate effort, some challenge" },
  { value: "high", label: "High", description: "Intense effort, very challenging" },
]

interface WorkoutFormData {
  title: string
  workout_type: string
  date: string
  start_time: string
  end_time: string
  duration: string
  intensity: string
  calories_burned: string
  equipment_used: string
  notes: string
  status: string
}

export default function AddWorkoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<WorkoutFormData>({
    title: "",
    workout_type: "",
    date: new Date().toISOString().split("T")[0],
    start_time: "",
    end_time: "",
    duration: "",
    intensity: "",
    calories_burned: "",
    equipment_used: "",
    notes: "",
    status: "completed",
  })

  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<WorkoutFormData>>({})

  const validateForm = () => {
    const newErrors: Partial<WorkoutFormData> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.workout_type) {
      newErrors.workout_type = "Workout type is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    if (!formData.duration || Number.parseInt(formData.duration) <= 0) {
      newErrors.duration = "Duration must be greater than 0"
    }

    if (!formData.intensity) {
      newErrors.intensity = "Intensity level is required"
    }

    if (formData.calories_burned && Number.parseInt(formData.calories_burned) < 0) {
      newErrors.calories_burned = "Calories cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`)
      const end = new Date(`2000-01-01T${formData.end_time}`)

      if (end > start) {
        const diffMs = end.getTime() - start.getTime()
        const diffMins = Math.round(diffMs / (1000 * 60))
        setFormData({ ...formData, duration: diffMins.toString() })
      }
    }
  }

  const handleInputChange =
    (field: keyof WorkoutFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setFormData({ ...formData, [field]: value })

      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined })
      }

      // Auto-calculate duration when times change
      if (field === "start_time" || field === "end_time") {
        setTimeout(calculateDuration, 100)
      }
    }

  const handleSelectChange = (field: keyof WorkoutFormData) => (value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert([
          {
            user_id: user!.id,
            title: formData.title.trim(),
            workout_type: formData.workout_type,
            date: formData.date,
            start_time: formData.start_time || null,
            end_time: formData.end_time || null,
            duration: Number.parseInt(formData.duration),
            intensity: formData.intensity as "low" | "medium" | "high",
            calories_burned: Number.parseInt(formData.calories_burned) || 0,
            equipment_used: formData.equipment_used.trim() || null,
            notes: formData.notes.trim() || null,
            tags: tags.length > 0 ? tags : null,
            status: formData.status as "completed" | "planned",
          },
        ])
        .select()
        .single()

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: "Workout added successfully",
        })
        router.push("/workouts")
      }
    } catch (error) {
      console.error("Error adding workout:", error)
      toast({
        title: "Error",
        description: "Failed to add workout",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
          <Link href="/workouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Workout</h1>
            <p className="text-gray-600">Log your fitness session</p>
          </div>
        </div>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Workout Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Morning Run, Chest & Triceps"
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Workout Type and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workout_type">Workout Type *</Label>
                  <Select value={formData.workout_type} onValueChange={handleSelectChange("workout_type")}>
                    <SelectTrigger className={errors.workout_type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workoutTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.workout_type && <p className="text-sm text-red-500">{errors.workout_type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange("date")}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={handleInputChange("start_time")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input id="end_time" type="time" value={formData.end_time} onChange={handleInputChange("end_time")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.duration}
                    onChange={handleInputChange("duration")}
                    className={errors.duration ? "border-red-500" : ""}
                  />
                  {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
                </div>
              </div>

              {/* Intensity and Calories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity Level *</Label>
                  <Select value={formData.intensity} onValueChange={handleSelectChange("intensity")}>
                    <SelectTrigger className={errors.intensity ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      {intensityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-gray-500">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.intensity && <p className="text-sm text-red-500">{errors.intensity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calories_burned">Calories Burned</Label>
                  <Input
                    id="calories_burned"
                    type="number"
                    min="0"
                    placeholder="250"
                    value={formData.calories_burned}
                    onChange={handleInputChange("calories_burned")}
                    className={errors.calories_burned ? "border-red-500" : ""}
                  />
                  {errors.calories_burned && <p className="text-sm text-red-500">{errors.calories_burned}</p>}
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-2">
                <Label htmlFor="equipment_used">Equipment Used</Label>
                <Input
                  id="equipment_used"
                  placeholder="e.g., Dumbbells, Treadmill, Yoga Mat"
                  value={formData.equipment_used}
                  onChange={handleInputChange("equipment_used")}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="How did the workout feel? Any observations?"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange("notes")}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleSelectChange("status")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Workout
                    </>
                  )}
                </Button>
                <Link href="/workouts">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
