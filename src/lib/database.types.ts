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
            equipment: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    description: string
                    price_per_day: number
                    status: string
                    owner_id: string
                    category_id: string
                    images: string[]
                    image?: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    description: string
                    price_per_day: number
                    status?: string
                    owner_id: string
                    category_id: string
                    images?: string[]
                    image?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    description?: string
                    price_per_day?: number
                    status?: string
                    owner_id?: string
                    category_id?: string
                    images?: string[]
                    image?: string
                }
            }
            rentals: {
                Row: {
                    id: string
                    created_at: string
                    equipment_id: string
                    renter_id: string
                    start_date: string
                    end_date: string
                    status: string
                    total_amount: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    equipment_id: string
                    renter_id: string
                    start_date: string
                    end_date: string
                    status?: string
                    total_amount: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    equipment_id?: string
                    renter_id?: string
                    start_date?: string
                    end_date?: string
                    status?: string
                    total_amount?: number
                }
            }
            users: {
                Row: {
                    id: string
                    created_at: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    phone_number: string | null
                    address: string | null
                    bio: string | null
                    date_of_birth: string | null
                    gender: string | null
                    role: string
                    is_admin: boolean
                }
                Insert: {
                    id: string
                    created_at?: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone_number?: string | null
                    address?: string | null
                    bio?: string | null
                    date_of_birth?: string | null
                    gender?: string | null
                    role?: string
                    is_admin?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone_number?: string | null
                    address?: string | null
                    bio?: string | null
                    date_of_birth?: string | null
                    gender?: string | null
                    role?: string
                    is_admin?: boolean
                }
            }
            user_preferences: {
                Row: {
                    user_id: string
                    notify_new_rentals: boolean
                    notify_rental_updates: boolean
                    theme: string
                }
                Insert: {
                    user_id: string
                    notify_new_rentals?: boolean
                    notify_rental_updates?: boolean
                    theme?: string
                }
                Update: {
                    user_id?: string
                    notify_new_rentals?: boolean
                    notify_rental_updates?: boolean
                    theme?: string
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
