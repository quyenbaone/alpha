import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Profile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setSession: (session: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      set({ user: data.user });
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
    set({ user: null });
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

        set({
          session,
          user: profile,
          loading: false,
          isAdmin: profile.is_admin || false
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        set({
          session: null,
          user: null,
          loading: false,
          isAdmin: false
        });
      }
    } else {
      set({
        session: null,
        user: null,
        loading: false,
        isAdmin: false
      });
    }
  },
}));