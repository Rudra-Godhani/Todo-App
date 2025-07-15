import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
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
          preferred_units: any
          default_workout_type: string
          theme_preference: string
          notification_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: any
          default_workout_type?: string
          theme_preference?: string
          notification_preferences?: any
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: any
          default_workout_type?: string
          theme_preference?: string
          notification_preferences?: any
        }
      }
    }
  }
}

export type Workout = Database["public"]["Tables"]["workouts"]["Row"]
export type Goal = Database["public"]["Tables"]["goals"]["Row"]
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
