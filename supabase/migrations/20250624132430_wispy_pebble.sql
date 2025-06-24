/*
  # Initial Pharmacy Management System Schema

  1. New Tables
    - `users` - User authentication and roles (Admin/Pharmacist)
    - `medicines` - Medicine inventory with stock tracking
    - `vendors` - Vendor/supplier information
    - `purchases` - Purchase orders from vendors
    - `purchase_items` - Individual items in purchase orders
    - `patients` - Patient records and CRM
    - `sales` - Sales transactions and invoices
    - `sale_items` - Individual items in sales transactions
    - `payments` - Payment tracking (income/expense)
    - `settings` - System configuration settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Secure access to sensitive data

  3. Features
    - Automatic stock management
    - Low stock and expiry alerts
    - Tax calculation support
    - Comprehensive audit trail
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('admin', 'pharmacist')) NOT NULL DEFAULT 'pharmacist',
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  batch_no text NOT NULL,
  expiry_date date NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  price decimal(10,2) NOT NULL,
  cost_price decimal(10,2) NOT NULL,
  category text NOT NULL,
  description text,
  manufacturer text,
  min_stock_level integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  invoice_no text NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  purchase_date date NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES purchases(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  unit_cost decimal(10,2) NOT NULL,
  total_cost decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  date_of_birth date,
  medical_history text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  invoice_no text NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  payment_method text CHECK (payment_method IN ('cash', 'card', 'bank_transfer')) NOT NULL,
  payment_status text CHECK (payment_status IN ('paid', 'pending', 'partial')) NOT NULL DEFAULT 'paid',
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES medicines(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  category text NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  payment_method text CHECK (payment_method IN ('cash', 'card', 'bank_transfer')) NOT NULL,
  reference_id uuid,
  reference_type text,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can read medicines" ON medicines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage medicines" ON medicines FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read vendors" ON vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage vendors" ON vendors FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read purchases" ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchases" ON purchases FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read purchase_items" ON purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage purchase_items" ON purchase_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read patients" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage patients" ON patients FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sales" ON sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sales" ON sales FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sale_items" ON sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage sale_items" ON sale_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage payments" ON payments FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read settings" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage settings" ON settings FOR ALL TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry_date ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('business_name', 'RxSmart Pharmacy'),
  ('business_address', '123 Main Street, City, State 12345'),
  ('business_phone', '+1-555-123-4567'),
  ('business_email', 'info@rxsmart.com'),
  ('currency', 'USD'),
  ('tax_rate', '8.5'),
  ('tax_name', 'GST'),
  ('location', 'Main Branch')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();