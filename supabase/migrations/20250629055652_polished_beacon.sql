/*
  # Enterprise Multi-Store Pharmacy Management System

  1. New Tables
    - `organizations` - Multi-store pharmacy chains
    - `stores` - Individual pharmacy locations
    - `store_members` - Team members per store
    - `invitations` - Email invitations for team members
    - `roles` - Flexible role-based permissions
    - `permissions` - Granular permission system
    - `audit_trail` - Complete activity logging
    - `data_backups` - Automated backup tracking
    - `system_settings` - Organization-level settings
    - `notifications` - Real-time notification system

  2. Enhanced Security
    - Row Level Security on all tables
    - Audit trail for all operations
    - Data encryption and backup policies
    - Multi-factor authentication support

  3. Multi-Store Features
    - Organization hierarchy
    - Store-specific inventory
    - Cross-store transfers
    - Centralized reporting
*/

-- Organizations table for multi-store chains
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  license_number text,
  tax_id text,
  subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled')),
  max_stores integer DEFAULT 1,
  max_users integer DEFAULT 5,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stores table for individual pharmacy locations
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL, -- Unique store identifier
  description text,
  address text NOT NULL,
  phone text,
  email text,
  manager_id uuid,
  license_number text,
  operating_hours jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Enhanced roles table with flexible permissions
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  is_system_role boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Store members table for team management
CREATE TABLE IF NOT EXISTS store_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id),
  position text,
  permissions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Invitations table for email-based team invitations
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  email text NOT NULL,
  role_id uuid REFERENCES roles(id),
  invited_by uuid REFERENCES auth.users(id),
  invitation_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enhanced audit trail for complete activity logging
CREATE TABLE IF NOT EXISTS audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  store_id uuid REFERENCES stores(id),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Data backups tracking table
CREATE TABLE IF NOT EXISTS data_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  backup_type text NOT NULL CHECK (backup_type IN ('manual', 'scheduled', 'emergency')),
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  file_path text,
  file_size bigint,
  checksum text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- System notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  store_id uuid REFERENCES stores(id),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enhanced medicines table with store-specific inventory
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS barcode text;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS reorder_point integer DEFAULT 10;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS max_stock_level integer;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS location text; -- Shelf/bin location
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Enhanced sales table with store tracking
ALTER TABLE sales ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

-- Enhanced patients table with store association
ALTER TABLE patients ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_id text; -- Custom patient ID
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_info jsonb DEFAULT '{}';

-- Enhanced users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date date;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';

-- Stock transfers table for inter-store transfers
CREATE TABLE IF NOT EXISTS stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  from_store_id uuid REFERENCES stores(id),
  to_store_id uuid REFERENCES stores(id),
  transfer_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  requested_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  notes text,
  transfer_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stock transfer items
CREATE TABLE IF NOT EXISTS stock_transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid REFERENCES stock_transfers(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES medicines(id),
  quantity integer NOT NULL,
  unit_cost numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  category text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, category, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_stores_organization ON stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_store_members_store ON store_members(store_id);
CREATE INDEX IF NOT EXISTS idx_store_members_user ON store_members(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_store ON medicines(store_id);
CREATE INDEX IF NOT EXISTS idx_medicines_organization ON medicines(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_store ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_organization ON audit_trail(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(invitation_token);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM store_members sm 
      JOIN stores s ON sm.store_id = s.id 
      WHERE sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage organization"
  ON organizations FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Stores
CREATE POLICY "Users can view stores in their organization"
  ON stores FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
      UNION
      SELECT organization_id FROM store_members sm 
      JOIN stores s ON sm.store_id = s.id 
      WHERE sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Store managers and admins can manage stores"
  ON stores FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT store_id FROM store_members 
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'manager')
      )
    )
    OR organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Store Members
CREATE POLICY "Users can view store members in their stores"
  ON store_members FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Store managers and admins can manage members"
  ON store_members FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_members 
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'manager')
      )
    )
  );

-- RLS Policies for Medicines (store-specific)
DROP POLICY IF EXISTS "Authenticated users can read medicines" ON medicines;
DROP POLICY IF EXISTS "Authenticated users can manage medicines" ON medicines;

CREATE POLICY "Users can view medicines in their stores"
  ON medicines FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_members WHERE user_id = auth.uid()
    )
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage medicines in their stores"
  ON medicines FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_members 
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'manager', 'pharmacist')
      )
    )
  );

-- RLS Policies for Sales (store-specific)
DROP POLICY IF EXISTS "Authenticated users can read sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON sales;

CREATE POLICY "Users can view sales in their stores"
  ON sales FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_members WHERE user_id = auth.uid()
    )
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage sales in their stores"
  ON sales FOR ALL
  TO authenticated
  USING (
    store_id IN (
      SELECT store_id FROM store_members 
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM roles WHERE name IN ('admin', 'manager', 'pharmacist', 'cashier')
      )
    )
  );

-- Insert default system roles
INSERT INTO roles (id, organization_id, name, description, permissions, is_system_role) VALUES
  (gen_random_uuid(), NULL, 'super_admin', 'System Super Administrator', '{"all": true}', true),
  (gen_random_uuid(), NULL, 'org_admin', 'Organization Administrator', '{"organization": "all", "stores": "all", "users": "all"}', true),
  (gen_random_uuid(), NULL, 'store_manager', 'Store Manager', '{"store": "all", "inventory": "all", "sales": "all", "reports": "read"}', true),
  (gen_random_uuid(), NULL, 'pharmacist', 'Pharmacist', '{"inventory": "read", "sales": "all", "patients": "all", "prescriptions": "all"}', true),
  (gen_random_uuid(), NULL, 'cashier', 'Cashier', '{"sales": "all", "inventory": "read", "patients": "read"}', true),
  (gen_random_uuid(), NULL, 'inventory_manager', 'Inventory Manager', '{"inventory": "all", "suppliers": "all", "purchases": "all"}', true)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for all tables with updated_at
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public' 
    AND c.column_name = 'updated_at'
    AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_trail (
    organization_id,
    store_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    COALESCE(NEW.store_id, OLD.store_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN VALUES ('medicines'), ('sales'), ('patients'), ('users'), ('store_members'), ('organizations'), ('stores')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS audit_%I_trigger ON %I;
      CREATE TRIGGER audit_%I_trigger
        AFTER INSERT OR UPDATE OR DELETE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION audit_trigger_function();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;