export interface User {
  id: string;
  email: string;
  role: 'admin' | 'pharmacist';
  full_name: string;
  phone?: string;
}

export interface Medicine {
  id: string;
  name: string;
  batch_no: string;
  expiry_date: string;
  quantity: number;
  price: number;
  cost_price: number;
  category: string;
  description?: string;
  manufacturer?: string;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  date_of_birth?: string;
  medical_history?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  patient_id?: string;
  invoice_no: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  payment_status: 'paid' | 'pending' | 'partial';
  created_by: string;
  created_at: string;
  items: SaleItem[];
  patient?: Patient;
}

export interface SaleItem {
  id: string;
  medicine_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  medicine?: Medicine;
}

export interface Purchase {
  id: string;
  vendor_id: string;
  invoice_no: string;
  total_amount: number;
  purchase_date: string;
  created_by: string;
  created_at: string;
  items: PurchaseItem[];
  vendor?: Vendor;
}

export interface PurchaseItem {
  id: string;
  medicine_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  medicine?: Medicine;
}

export interface Payment {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  payment_method: 'cash' | 'card' | 'bank_transfer';
  reference_id?: string;
  reference_type?: string;
  created_by: string;
  created_at: string;
}

export interface Settings {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  currency: string;
  tax_rate: number;
  tax_name: string;
  location: string;
}