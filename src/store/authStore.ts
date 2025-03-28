import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Database } from '../lib/database.types';
import { getAuthError } from '../lib/auth';

type Profile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: any) => Promise<void>;
  checkAdminStatus: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });
      
      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('Không thể đăng nhập. Vui lòng thử lại sau.');
      }

      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        throw new Error('Email not confirmed');
      }

      // Fetch full user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      set({ 
        user: profile, 
        session: data.session, 
        isAdmin: profile.is_admin || false,
        loading: false
      });

      toast.success('Đăng nhập thành công!');
    } catch (error) {
      console.error('Sign in error:', error);
      const message = error instanceof Error ? getAuthError(error) : 'Đã xảy ra lỗi khi đăng nhập';
      toast.error(message);
      throw error;
    }
  },

  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;

      if (!data.user) {
        throw new Error('Không thể tạo tài khoản');
      }

      toast.success(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
        { duration: 6000 }
      );
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      const message = error instanceof Error ? getAuthError(error) : 'Đã xảy ra lỗi khi đăng ký';
      toast.error(message);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, isAdmin: false });
      toast.success('Đã đăng xuất');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Đã xảy ra lỗi khi đăng xuất');
      throw error;
    }
  },

  setSession: async (session) => {
    if (session?.user) {
      try {
        // Check if email is confirmed
        if (!session.user.email_confirmed_at) {
          set({ 
            session: null, 
            user: null,
            loading: false,
            isAdmin: false
          });
          return;
        }

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

  checkAdminStatus: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        set({ user: data, isAdmin: data.is_admin || false });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      set({ isAdmin: false });
    }
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      const { data: updatedProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      set({ user: updatedProfile });
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật thông tin');
      throw error;
    }
  }
}));