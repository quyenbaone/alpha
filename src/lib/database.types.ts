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