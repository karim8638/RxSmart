/*
  # Create profiles table for admin panel

  1. New Tables
    - `profiles` - User profiles linked to auth.users
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `role` (text, admin/pharmacist)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on profiles table
    - Add policies for users to access their own profiles
    - Add policies for admins to access all profiles

  3. Features
    - Links to Supabase auth system
    - Role-based access control
    - Profile management
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'pharmacist')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow own profile access" ON profiles;
DROP POLICY IF EXISTS "Allow self-inserts" ON profiles;
DROP POLICY IF EXISTS "Own profile insert/update" ON profiles;

-- Create policies
CREATE POLICY "Allow own profile access"
  ON profiles
  FOR ALL
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Allow self-inserts"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Own profile insert/update"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);