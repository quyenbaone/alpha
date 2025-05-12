import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Profile = Database['public']['Tables']['users']['Row'];

// Custom extended User type that includes profile fields
export interface ExtendedUser extends SupabaseUser {
  full_name?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
  role?: string;
  is_admin?: boolean;
  created_at?: string;
}

interface AuthState {
  user: ExtendedUser | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'owner' | 'renter' | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setSession: (session: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUser: (userData: Partial<ExtendedUser>) => void;
}

// Helper function to handle network errors
const handleNetworkError = (err: any) => {
  console.error('Network error:', err);
  return { error: { message: 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.' } };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      isAdmin: false,
      userRole: null,

      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Sign in error:', error);
            return { error };
          }

          // Set basic user info immediately from auth response
          set({ user: data.user });

          // Fetch additional user data from the profile
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (!profileError && profile) {
              // Determine the role based on profile data
              const userRole = profile.is_admin ? 'admin' :
                (profile.role === 'owner' ? 'owner' : 'renter');

              set({
                user: { ...data.user, ...profile },
                isAdmin: profile.is_admin || false,
                userRole,
              });
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }

          return { error: null };
        } catch (err) {
          return handleNetworkError(err);
        }
      },

      signInWithGoogle: async () => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          return { error };
        } catch (err) {
          return handleNetworkError(err);
        }
      },

      signUp: async (email: string, password: string, name?: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name
              }
            }
          });

          if (!error) {
            set({ user: data.user });
          }

          return { error };
        } catch (err) {
          return handleNetworkError(err);
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Sign out error:', err);
        } finally {
          set({
            user: null,
            session: null,
            isAdmin: false,
            userRole: null
          });
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
          if (error) throw error;
          toast.success('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
        } catch (error) {
          console.error('Reset password error:', error);
          toast.error('Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu');
          throw error;
        }
      },

      setSession: async (session) => {
        if (session?.user) {
          try {
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            // Determine the role based on profile data
            const userRole = profile.is_admin ? 'admin' :
              (profile.role === 'owner' ? 'owner' : 'renter');

            set({
              session,
              user: { ...session.user, ...profile },
              loading: false,
              isAdmin: profile.is_admin || false,
              userRole,
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
            set({
              session: null,
              user: null,
              loading: false,
              isAdmin: false,
              userRole: null,
            });
          }
        } else {
          set({
            session: null,
            user: null,
            loading: false,
            isAdmin: false,
            userRole: null,
          });
        }
      },

      setUser: (userData: Partial<ExtendedUser>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin,
        userRole: state.userRole,
      }),
    }
  )
);