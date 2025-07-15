import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, parseISO } from "date-fns"
import type { Workout } from "@/types/database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: number): string {
  const minutes = Math.floor(time / 60000)
  const seconds = Math.floor((time % 60000) / 1000)
  const milliseconds = Math.floor((time % 1000) / 10)
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`
}

export function getIntensityColor(intensity: string): string {
  switch (intensity) {
    case "low":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "high":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-blue-100 text-blue-800"
    case "planned":
      return "bg-purple-100 text-purple-800"
    case "active":
      return "bg-green-100 text-green-800"
    case "archived":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getWorkoutTypeColor(type: string): string {
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

export function calculateWorkoutStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0

  const sortedDates = [...new Set(workouts.map((w) => w.date))].sort().reverse()
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

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function exportToCSV(data: any[], filename: string): void {
  const headers = ["Date", "Title", "Type", "Duration (min)", "Intensity", "Calories", "Equipment", "Status", "Notes"]

  const csvData = data.map((workout) => [
    workout.date,
    workout.title,
    workout.workout_type,
    workout.duration,
    workout.intensity,
    workout.calories_burned,
    workout.equipment_used || "",
    workout.status,
    workout.notes || "",
  ])

  const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
