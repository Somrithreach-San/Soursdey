-- Soursdey Database Migration
-- Run this SQL in your Supabase dashboard (SQL Editor)

-- ============================================
-- 1. Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  avatar_url TEXT,
  streak INT DEFAULT 0,
  diamonds INT DEFAULT 0,
  hearts INT DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only read/update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ============================================
-- 2. Create units table
-- ============================================
CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  section INT NOT NULL,
  unit INT NOT NULL,
  color TEXT NOT NULL,
  dark_color TEXT NOT NULL,
  light_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on units (public read-only)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Units are publicly readable"
  ON units FOR SELECT
  USING (true);


-- ============================================
-- 3. Create user_progress table
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, unit_id)
);

-- Enable RLS on user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- 4. Create store_items table
-- ============================================
CREATE TABLE IF NOT EXISTS store_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cost INT NOT NULL CHECK (cost >= 0),
  type TEXT NOT NULL CHECK (type IN ('heart', 'diamond', 'power-up')),
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on store_items (public read-only)
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store items are publicly readable"
  ON store_items FOR SELECT
  USING (true);


-- ============================================
-- 5. Create user_inventory table
-- ============================================
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_item_id UUID REFERENCES store_items(id) ON DELETE CASCADE NOT NULL,
  quantity INT DEFAULT 1 CHECK (quantity >= 0),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_item_id)
);

-- Enable RLS on user_inventory
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
  ON user_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
  ON user_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their inventory"
  ON user_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- 6. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_unit_id ON user_progress(unit_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_store_items_type ON store_items(type);


-- ============================================
-- 7. Sample Data (Optional - remove if not needed)
-- ============================================

-- Insert sample units
INSERT INTO units (title, description, section, unit, color, dark_color, light_color) VALUES
  ('Name food and drinks', 'Learn vocabulary for common foods and beverages', 1, 1, '#58cc02', '#46a302', '#a5e67e'),
  ('Talk about nationalities', 'Master nationality vocabulary and usage', 1, 2, '#ff9600', '#e68700', '#ffc800'),
  ('Discuss professions', 'Learn job titles and work-related vocabulary', 1, 3, '#B68758', '#966a3e', '#d4b48d'),
  ('Common greetings', 'Learn how to greet people in different situations', 1, 4, '#3c4dff', '#2e3bcc', '#6b7eff'),
  ('Tell the time', 'Master time-telling vocabulary and phrases', 1, 5, '#ff33cc', '#cc1aa3', '#ff99dd')
ON CONFLICT DO NOTHING;

-- Insert sample store items
INSERT INTO store_items (title, description, cost, type, icon_url) VALUES
  ('Refill Hearts', 'Get back to full health!', 450, 'heart', NULL),
  ('Extra Hearts', 'Get 3 bonus hearts', 300, 'heart', NULL),
  ('Streak Freeze', 'Keep your streak alive if you miss a day', 200, 'power-up', NULL),
  ('2x XP Boost', 'Double your experience gains for 1 hour', 150, 'power-up', NULL)
ON CONFLICT DO NOTHING;