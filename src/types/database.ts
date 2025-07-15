export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          intensity: string
          calories_burned: number
          equipment_used: string | null
          notes: string | null
          tags: string[] | null
          status: string
          image_url: string | null
          created_at: string
          updated_at: string | null
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
          intensity: string
          calories_burned?: number
          equipment_used?: string | null
          notes?: string | null
          tags?: string[] | null
          status?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          title?: string
          workout_type?: string
          date?: string
          start_time?: string | null
          end_time?: string | null
          duration?: number
          intensity?: string
          calories_burned?: number
          equipment_used?: string | null
          notes?: string | null
          tags?: string[] | null
          status?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          status: string
          created_at: string
          updated_at: string | null
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
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          title?: string
          goal_type?: string
          target_value?: number
          current_value?: number
          unit?: string
          start_date?: string
          end_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          preferred_units: Json | null
          default_workout_type: string | null
          theme_preference: string | null
          notification_preferences: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: Json | null
          default_workout_type?: string | null
          theme_preference?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          preferred_units?: Json | null
          default_workout_type?: string | null
          theme_preference?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type Workout = Database["public"]["Tables"]["workouts"]["Row"]
export type Goal = Database["public"]["Tables"]["goals"]["Row"]
