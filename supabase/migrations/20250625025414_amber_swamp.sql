/*
  # Fix RLS policy for users table during sign-up

  1. Security Changes
    - Update RLS policies for users table to allow profile creation during sign-up
    - Remove restrictive INSERT policy that prevents sign-up
    - Add policy that allows users to create their own profile using auth.uid()
    - Maintain security by ensuring users can only create profiles for themselves

  2. Changes Made
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that works during sign-up process
    - Keep existing SELECT and UPDATE policies for security
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new INSERT policy that allows users to create their own profile during sign-up
CREATE POLICY "Users can create own profile during signup"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also add a policy for public role during the brief moment of sign-up
CREATE POLICY "Allow profile creation during signup"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);