export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          tax_id: string | null
          address: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          currency: string
          language: string
          subscription_tier: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tax_id?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          currency?: string
          language?: string
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tax_id?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          currency?: string
          language?: string
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          company_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          role?: string
          company_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          company_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          company_id: string
          sku: string
          name: string
          description: string | null
          category_id: string | null
          price: number
          cost: number | null
          stock: number
          min_stock: number
          max_stock: number | null
          barcode: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          sku: string
          name: string
          description?: string | null
          category_id?: string | null
          price: number
          cost?: number | null
          stock?: number
          min_stock?: number
          max_stock?: number | null
          barcode?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          sku?: string
          name?: string
          description?: string | null
          category_id?: string | null
          price?: number
          cost?: number | null
          stock?: number
          min_stock?: number
          max_stock?: number | null
          barcode?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          company_id: string
          user_id: string
          customer_id: string | null
          sale_number: string
          subtotal: number
          tax: number
          discount: number
          total: number
          payment_method: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          customer_id?: string | null
          sale_number?: string
          subtotal: number
          tax: number
          discount?: number
          total: number
          payment_method: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          customer_id?: string | null
          sale_number?: string
          subtotal?: number
          tax?: number
          discount?: number
          total?: number
          payment_method?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          price: number
          discount: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          price: number
          discount?: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          price?: number
          discount?: number
          total?: number
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          company_id: string
          supplier_id: string
          purchase_number: string
          subtotal: number
          tax: number
          total: number
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          supplier_id: string
          purchase_number?: string
          subtotal: number
          tax: number
          total: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          supplier_id?: string
          purchase_number?: string
          subtotal?: number
          tax?: number
          total?: number
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchase_items: {
        Row: {
          id: string
          purchase_id: string
          product_id: string
          quantity: number
          price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_id: string
          product_id: string
          quantity: number
          price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          purchase_id?: string
          product_id?: string
          quantity?: number
          price?: number
          total?: number
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          company_id: string
          name: string
          tax_id: string | null
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          tax_id?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          tax_id?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          loyalty_points: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          loyalty_points?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          loyalty_points?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          movement_type: string
          quantity: number
          reference_type: string | null
          reference_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          movement_type: string
          quantity: number
          reference_type?: string | null
          reference_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          movement_type?: string
          quantity?: number
          reference_type?: string | null
          reference_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          sale_id: string
          invoice_number: string
          electronic_invoice_id: string | null
          electronic_invoice_status: string | null
          xml_url: string | null
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          sale_id: string
          invoice_number: string
          electronic_invoice_id?: string | null
          electronic_invoice_status?: string | null
          xml_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          sale_id?: string
          invoice_number?: string
          electronic_invoice_id?: string | null
          electronic_invoice_status?: string | null
          xml_url?: string | null
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      woocommerce_connections: {
        Row: {
          id: string
          company_id: string
          store_url: string
          consumer_key: string
          consumer_secret: string
          is_active: boolean
          sync_products: boolean
          sync_orders: boolean
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          store_url: string
          consumer_key: string
          consumer_secret: string
          is_active?: boolean
          sync_products?: boolean
          sync_orders?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          store_url?: string
          consumer_key?: string
          consumer_secret?: string
          is_active?: boolean
          sync_products?: boolean
          sync_orders?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

