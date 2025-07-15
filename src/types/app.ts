import type { Workout, Goal, Profile } from "./database"

export interface DashboardStats {
  totalWorkoutsThisWeek: number
  totalMinutesExercised: number
  totalCaloriesBurned: number
  workoutStreak: number
  mostFrequentWorkoutType: string
}

export interface WeeklyData {
  day: string
  workouts: number
  minutes: number
}

export interface GoalProgress {
  currentValue: number
  progress: number
  isCompleted: boolean
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface WorkoutFormData {
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

export interface GoalFormData {
  title: string
  goal_type: string
  target_value: string
  unit: string
  start_date: string
  end_date: string
}

export interface ProfileFormData {
  full_name: string
  avatar_url: string
  preferred_units: {
    time: string
    calories: string
  }
  default_workout_type: string
  theme_preference: string
  notification_preferences: {
    email_reminders: boolean
  }
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type ViewMode = "month" | "week" | "agenda"

export type { Workout, Goal, Profile }

export const WORKOUT_TYPES = [
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
] as const

export const INTENSITY_LEVELS = ["low", "medium", "high"] as const

export const GOAL_TYPES = [
  { value: "weekly_workouts", label: "Weekly Workouts", unit: "sessions" },
  { value: "weekly_duration", label: "Weekly Duration", unit: "minutes" },
  { value: "weekly_calories", label: "Weekly Calories", unit: "calories" },
  { value: "monthly_workouts", label: "Monthly Workouts", unit: "sessions" },
  { value: "monthly_duration", label: "Monthly Duration", unit: "minutes" },
  { value: "monthly_calories", label: "Monthly Calories", unit: "calories" },
  { value: "custom", label: "Custom Goal", unit: "custom" },
] as const
