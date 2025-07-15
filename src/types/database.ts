export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          user_id: string
          title: string
          workout_type: string
          date: string
          start_time: string | null
          end_time: string | null
          duration: number
          intensity: "low" | "medium" | "high"
          calories_burned: number
          equipment_used: string | null
          notes: string | null
          tags: string[] | null
          status: "completed" | "planned"
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          workout_type: string
          date: string
          start_time?: string | null
          end_time?: string | null
          duration: number
          intensity: "low" | "medium" | "high"
          calories_burned?: number
          equipment_used?: string | null
          notes?: string | null
          tags?: string[] | null
          status?: "completed" | "planned"
          image_url?: string | null
        }
        Update: {
          title?: string
          workout_type?: string
          date?: string
          start_time?: string | null
          end_time?: string | null
          duration?: number
          intensity?: "low" | "medium" | "high"
          calories_burned?: number
          equipment_used?: string | null
          notes?: string | null
          tags?: string[] | null
          status?: "completed" | "planned"
          image_url?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          goal_type: string
          target_value: number
          current_value: number
          unit: string
          start_date: string
          end_date: string | null
          status: "active" | "completed" | "archived"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          goal_type: string
          target_value: number
          current_value?: number
          unit: string
          start_date: string
          end_date?: string | null
          status?: "active" | "completed" | "archived"
        }
        Update: {
          title?: string
          goal_type?: string
          target_value?: number
          current_value?: number
          unit?: string
          start_date?: string
          end_date?: string | null
          status?: "active" | "completed" | "archived"
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          preferred_units: Json
          default_workout_type: string
          theme_preference: string
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: Json
          default_workout_type?: string
          theme_preference?: string
          notification_preferences?: Json
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: Json
          default_workout_type?: string
          theme_preference?: string
          notification_preferences?: Json
        }
      }
    }
  }
}

export type Workout = Database["public"]["Tables"]["workouts"]["Row"]
export type WorkoutInsert = Database["public"]["Tables"]["workouts"]["Insert"]
export type WorkoutUpdate = Database["public"]["Tables"]["workouts"]["Update"]

export type Goal = Database["public"]["Tables"]["goals"]["Row"]
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"]
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"]

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"]
export type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"]
