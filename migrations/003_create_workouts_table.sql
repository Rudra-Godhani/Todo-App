-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration INTEGER NOT NULL, -- in minutes
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')) NOT NULL,
  calories_burned INTEGER DEFAULT 0,
  equipment_used TEXT,
  notes TEXT,
  tags TEXT[], -- array of tags
  status TEXT CHECK (status IN ('completed', 'planned')) DEFAULT 'completed',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);
