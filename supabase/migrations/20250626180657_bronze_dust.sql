/*
  # Subscription System Migration

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan` (text, monthly/yearly)
      - `price` (numeric)
      - `is_active` (boolean)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on subscriptions table
    - Add policies for users to view their own subscriptions
    - Add policies for admins to manage all subscriptions
    - Add policy for users to create subscription requests

  3. Features
    - Automatic timestamp updates
    - Plan validation constraints
    - User-specific access control
*/

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  plan text DEFAULT 'monthly' CHECK (plan IN ('monthly', 'yearly')),
  price numeric DEFAULT 9.99,
  is_active boolean DEFAULT false,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'subscriptions' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "View own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admin can manage all" ON subscriptions;
DROP POLICY IF EXISTS "Users can create subscription requests" ON subscriptions;

-- Create policies
CREATE POLICY "View own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'
  );

-- Insert policy for users to create their own subscription requests
CREATE POLICY "Users can create subscription requests"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;