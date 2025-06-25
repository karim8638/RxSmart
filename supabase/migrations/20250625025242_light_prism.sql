/*
  # Fix User Registration RLS Policy

  1. Security Changes
    - Add RLS policy to allow authenticated users to insert their own profile
    - Ensure users can only create records where the ID matches their auth.uid()
  
  2. Policy Details
    - Policy name: "Users can insert own profile"
    - Target: INSERT operations on users table
    - Allows: Authenticated users to insert records where id = auth.uid()
*/

-- Create policy to allow users to insert their own profile during registration
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);