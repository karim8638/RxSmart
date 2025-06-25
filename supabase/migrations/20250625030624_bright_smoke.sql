/*
  # Fix User Registration RLS Policies

  1. Security Changes
    - Drop all existing conflicting INSERT policies on users table
    - Create a single, clear INSERT policy for user registration
    - Ensure authenticated users can create their own profile during signup

  2. Policy Changes
    - Remove duplicate and conflicting INSERT policies
    - Add proper INSERT policy that allows users to create their own profile
    - Keep existing SELECT and UPDATE policies intact
*/

-- Drop all existing INSERT policies that are causing conflicts
DROP POLICY IF EXISTS "Allow admins only" ON users;
DROP POLICY IF EXISTS "Allow authenticated insert" ON users;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON users;
DROP POLICY IF EXISTS "Allow insert for auth users" ON users;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON users;
DROP POLICY IF EXISTS "Users can create own profile during signup" ON users;

-- Create a single, clear INSERT policy for user registration
CREATE POLICY "Enable insert for authenticated users creating own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also add a policy to allow inserts during the signup process when user might not be fully authenticated yet
CREATE POLICY "Enable insert during signup"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);