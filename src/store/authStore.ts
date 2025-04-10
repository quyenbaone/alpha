import { toast } from 'sonner';
import { create } from 'zustand';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

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
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
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

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại chính tả và đảm bảo bạn đang sử dụng đúng địa chỉ email đã đăng ký.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Vui lòng xác nhận email của bạn trước khi đăng nhập. Kiểm tra hộp thư của bạn để tìm email xác nhận.');
        }
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Không thể đăng nhập. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('Không thể tải thông tin người dùng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
      }

      set({
        user: profile,
        session: data.session,
        isAdmin: profile.is_admin || false,
        loading: false
      });

      toast.success('Đăng nhập thành công!');
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
      }
      throw error;
    }
  },

  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Không thể tạo tài khoản');
      }

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Đã xảy ra lỗi khi đăng ký');
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