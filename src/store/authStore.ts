import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Profile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'owner' | 'renter' | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setSession: (session: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      isAdmin: false,
      userRole: null,

      signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error) {
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
        }

        return { error };
      },

      signInWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        return { error };
      },

      signUp: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (!error) {
          set({ user: data.user });
        }

        return { error };
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAdmin: false,
          userRole: null
        });
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