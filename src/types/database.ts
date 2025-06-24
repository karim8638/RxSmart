export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'pharmacist';
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'admin' | 'pharmacist';
          full_name: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'pharmacist';
          full_name?: string;
          phone?: string | null;
          updated_at?: string;
        };
      };
      medicines: {
        Row: {
          id: string;
          name: string;
          batch_no: string;
          expiry_date: string;
          quantity: number;
          price: number;
          cost_price: number;
          category: string;
          description: string | null;
          manufacturer: string | null;
          min_stock_level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          batch_no: string;
          expiry_date: string;
          quantity: number;
          price: number;
          cost_price: number;
          category: string;
          description?: string | null;
          manufacturer?: string | null;
          min_stock_level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          batch_no?: string;
          expiry_date?: string;
          quantity?: number;
          price?: number;
          cost_price?: number;
          category?: string;
          description?: string | null;
          manufacturer?: string | null;
          min_stock_level?: number;
          updated_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          contact_person: string;
          phone: string;
          email: string | null;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person: string;
          phone: string;
          email?: string | null;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string;
          phone?: string;
          email?: string | null;
          address?: string;
          updated_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          vendor_id: string;
          invoice_no: string;
          total_amount: number;
          purchase_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          invoice_no: string;
          total_amount: number;
          purchase_date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          invoice_no?: string;
          total_amount?: number;
          purchase_date?: string;
          updated_at?: string;
        };
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          medicine_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          medicine_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_id?: string;
          medicine_id?: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
        };
      };
      patients: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string;
          date_of_birth: string | null;
          medical_history: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          address: string;
          date_of_birth?: string | null;
          medical_history?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          address?: string;
          date_of_birth?: string | null;
          medical_history?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          patient_id: string | null;
          invoice_no: string;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          payment_method: 'cash' | 'card' | 'bank_transfer';
          payment_status: 'paid' | 'pending' | 'partial';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id?: string | null;
          invoice_no: string;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          payment_method: 'cash' | 'card' | 'bank_transfer';
          payment_status?: 'paid' | 'pending' | 'partial';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string | null;
          invoice_no?: string;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          payment_method?: 'cash' | 'card' | 'bank_transfer';
          payment_status?: 'paid' | 'pending' | 'partial';
          updated_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          medicine_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          medicine_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          medicine_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          description: string;
          payment_method: 'cash' | 'card' | 'bank_transfer';
          reference_id: string | null;
          reference_type: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          description: string;
          payment_method: 'cash' | 'card' | 'bank_transfer';
          reference_id?: string | null;
          reference_type?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'income' | 'expense';
          category?: string;
          amount?: number;
          description?: string;
          payment_method?: 'cash' | 'card' | 'bank_transfer';
          reference_id?: string | null;
          reference_type?: string | null;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          updated_at?: string;
        };
      };
    };
  };
}