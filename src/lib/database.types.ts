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
          email: string
          created_at: string
          is_admin: boolean
          last_login: string | null
          full_name: string | null
          phone_number: string | null
          address: string | null
          avatar_url: string | null
          bio: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          verified: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          is_admin?: boolean
          last_login?: string | null
          full_name?: string | null
          phone_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          verified?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          is_admin?: boolean
          last_login?: string | null
          full_name?: string | null
          phone_number?: string | null
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          verified?: boolean
        }
      }
      equipment: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          category: string
          image: string
          location: string
          owner_id: string
          rating: number
          reviews: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          category: string
          image: string
          location: string
          owner_id: string
          rating?: number
          reviews?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          category?: string
          image?: string
          location?: string
          owner_id?: string
          rating?: number
          reviews?: number
          created_at?: string
        }
      }
      rentals: {
        Row: {
          id: string
          equipment_id: string
          renter_id: string
          start_date: string
          end_date: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id: string
          renter_id: string
          start_date: string
          end_date: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string
          renter_id?: string
          start_date?: string
          end_date?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'rental_request' | 'rental_status'
          content: string
          read: boolean
          created_at: string
          related_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'rental_request' | 'rental_status'
          content: string
          read?: boolean
          created_at?: string
          related_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'message' | 'rental_request' | 'rental_status'
          content?: string
          read?: boolean
          created_at?: string
          related_id?: string | null
        }
      }
      admin_audit_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          target_table: string
          target_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          target_table: string
          target_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          target_table?: string
          target_id?: string | null
          details?: Json | null
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
  }
}