import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

// Track recent email signup attempts to avoid hitting rate limits
const recentSignups = new Map<string, number>();
const EMAIL_RATE_LIMIT_WINDOW = 2 * 60 * 1000; // 2 minutes in milliseconds

// Clear expired entries from the signup tracker
setInterval(() => {
  const now = Date.now();
  recentSignups.forEach((timestamp, email) => {
    if (now - timestamp > EMAIL_RATE_LIMIT_WINDOW) {
      recentSignups.delete(email);
    }
  });
}, 60 * 1000); // Clean up every minute

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
  notification_email?: boolean;
  notification_sms?: boolean;
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

            // Handle specific error cases
            if (error.status === 400) {
              if (error.message?.includes('Invalid login credentials')) {
                return { error: { ...error, message: 'Email hoặc mật khẩu không chính xác.' } };
              }
              if (error.message?.includes('Email not confirmed')) {
                return { error: { ...error, message: 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn.' } };
              }
            }

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
        // Check if this email has been used for signup recently
        const normalizedEmail = email.trim().toLowerCase();
        const lastAttempt = recentSignups.get(normalizedEmail);
        const now = Date.now();

        if (lastAttempt && (now - lastAttempt < EMAIL_RATE_LIMIT_WINDOW)) {
          // Calculate time remaining in minutes
          const minutesRemaining = Math.ceil((EMAIL_RATE_LIMIT_WINDOW - (now - lastAttempt)) / 60000);
          return {
            error: {
              status: 429,
              code: 'over_email_send_rate_limit',
              message: `Vui lòng đợi khoảng ${minutesRemaining} phút trước khi thử lại với email này.`,
              __isAuthError: true,
              name: 'AuthApiError'
            }
          };
        }

        const maxRetries = 3;
        let retryCount = 0;
        let backoffTime = 1000; // Start with 1 second delay

        const attemptSignUp = async (): Promise<{ error: any }> => {
          try {
            const { data, error } = await supabase.auth.signUp({
              email: normalizedEmail,
              password,
              options: {
                data: {
                  full_name: name
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`
              }
            });

            if (!error) {
              // Successfully sent signup email - record this attempt
              recentSignups.set(normalizedEmail, Date.now());
              set({ user: data.user });
              return { error: null };
            }

            // Check if the error is due to rate limiting
            if (error.status === 429) {
              // Record this attempt to prevent immediate retries
              recentSignups.set(normalizedEmail, Date.now());

              if (retryCount < maxRetries) {
                retryCount++;
                // Use exponential backoff
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                backoffTime *= 2; // Double the backoff time for next retry
                return attemptSignUp(); // Retry
              } else {
                // Max retries reached
                return {
                  error: {
                    ...error,
                    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.'
                  }
                };
              }
            }

            return { error };
          } catch (err: any) {
            if (err.message?.includes('network') || err.message?.includes('fetch')) {
              return { error: { message: 'Lỗi kết nối. Vui lòng kiểm tra kết nối mạng.' } };
            }
            return { error: { message: err.message || 'Đã xảy ra lỗi khi đăng ký.' } };
          }
        };

        return attemptSignUp();
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