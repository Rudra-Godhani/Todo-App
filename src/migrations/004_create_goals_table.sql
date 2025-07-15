-- Create a table for goals
CREATE TABLE public.goals (
  id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  goal_type text NOT NULL, -- e.g., 'weekly_workouts', 'monthly_calories', 'custom'
  target_value integer NOT NULL,
  current_value integer DEFAULT 0 NOT NULL,
  unit text NOT NULL, -- e.g., 'sessions', 'minutes', 'calories'
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'active'::text NOT NULL, -- 'active', 'completed', 'archived'
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own goals
CREATE POLICY "Users can view their own goals." ON public.goals FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own goals
CREATE POLICY "Users can insert their own goals." ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own goals
CREATE POLICY "Users can update their own goals." ON public.goals FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own goals
CREATE POLICY "Users can delete their own goals." ON public.goals FOR DELETE USING (auth.uid() = user_id);
