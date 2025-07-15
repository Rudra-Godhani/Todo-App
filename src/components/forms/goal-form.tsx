"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { GOAL_TYPES } from "@/types/app"
import type { GoalFormData } from "@/types/app"

interface GoalFormProps {
  initialData?: Partial<GoalFormData>
  onSubmit: (data: GoalFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  loading?: boolean
}

export function GoalForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Create Goal",
  loading = false,
}: GoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: initialData.title || "",
    goal_type: initialData.goal_type || "weekly_workouts",
    target_value: initialData.target_value || "",
    unit: initialData.unit || "sessions",
    start_date: initialData.start_date || new Date().toISOString().split("T")[0],
    end_date: initialData.end_date || "",
  })

  const handleFormChange = (field: keyof GoalFormData) => (value: string) => {
    const newFormData = { ...formData, [field]: value }

    // Auto-set unit based on goal type
    if (field === "goal_type") {
      const goalType = GOAL_TYPES.find((type) => type.value === value)
      if (goalType) {
        newFormData.unit = goalType.unit
      }
    }

    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.target_value) {
      return
    }

    await onSubmit(formData)
  }

  return (
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
            {GOAL_TYPES.map((type) => (
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
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
