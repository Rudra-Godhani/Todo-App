-- Create a table for workouts
CREATE TABLE public.workouts (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  workout_type text NOT NULL,
  date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  duration integer NOT NULL, -- in minutes
  intensity text NOT NULL, -- 'low', 'medium', 'high'
  calories_burned integer,
  equipment_used text,
  notes text,
  tags text[],
  status text DEFAULT 'completed'::text NOT NULL, -- 'completed', 'planned'
  image_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own workouts
CREATE POLICY "Users can view their own workouts." ON public.workouts FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own workouts
CREATE POLICY "Users can insert their own workouts." ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own workouts
CREATE POLICY "Users can update their own workouts." ON public.workouts FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own workouts
CREATE POLICY "Users can delete their own workouts." ON public.workouts FOR DELETE USING (auth.uid() = user_id);
