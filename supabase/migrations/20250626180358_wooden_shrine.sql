/*
  # Add Subscription System

  1. New Tables
    - `subscriptions` - User subscription requests and status
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan` (text, monthly/yearly)
      - `price` (numeric)
      - `is_active` (boolean, default false)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on subscriptions table
    - Add policies for users to view their own subscriptions
    - Add policies for admins to manage all subscriptions

  3. Features
    - Manual approval workflow
    - Status tracking (pending, active, cancelled)
    - Plan management (monthly/yearly)
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

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

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

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert policy for users to create their own subscription requests
CREATE POLICY "Users can create subscription requests"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());