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
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          full_name: string | null
          role: 'customer' | 'staff' | 'company_admin' | 'super_admin' | null
          company_id: string | null
          venue_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          role?: 'customer' | 'staff' | 'company_admin' | 'super_admin' | null
          company_id?: string | null
          venue_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          role?: 'customer' | 'staff' | 'company_admin' | 'super_admin' | null
          company_id?: string | null
          venue_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          company_id: string
          name: string
          type: 'ktv' | 'restaurant' | 'basketball_court' | 'badminton_court' | 'other'
          address: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          type: 'ktv' | 'restaurant' | 'basketball_court' | 'badminton_court' | 'other'
          address?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          type?: 'ktv' | 'restaurant' | 'basketball_court' | 'badminton_court' | 'other'
          address?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          company_id: string
          membership_type: 'company' | 'universal'
          balance: number
          total_purchased: number
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          membership_type?: 'company' | 'universal'
          balance?: number
          total_purchased?: number
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          membership_type?: 'company' | 'universal'
          balance?: number
          total_purchased?: number
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          membership_id: string
          venue_id: string | null
          type: 'purchase' | 'usage' | 'refund' | 'adjustment'
          amount: number
          description: string | null
          processed_by: string | null
          status: 'completed' | 'pending' | 'cancelled' | 'refunded'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          membership_id: string
          venue_id?: string | null
          type: 'purchase' | 'usage' | 'refund' | 'adjustment'
          amount: number
          description?: string | null
          processed_by?: string | null
          status?: 'completed' | 'pending' | 'cancelled' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          membership_id?: string
          venue_id?: string | null
          type?: 'purchase' | 'usage' | 'refund' | 'adjustment'
          amount?: number
          description?: string | null
          processed_by?: string | null
          status?: 'completed' | 'pending' | 'cancelled' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
      user_venues: {
        Row: {
          id: string
          user_id: string
          venue_id: string
          role: 'staff' | 'manager'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          venue_id: string
          role: 'staff' | 'manager'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          venue_id?: string
          role?: 'staff' | 'manager'
          created_at?: string
        }
      }
      user_companies: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role: 'admin' | 'manager'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          role: 'admin' | 'manager'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          role?: 'admin' | 'manager'
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
