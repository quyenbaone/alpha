import { toast } from 'sonner';
import { supabase } from '../supabase';

interface UserData {
    email: string;
    password: string;
    fullName?: string;
    phoneNumber?: string;
    role?: 'owner' | 'renter';
}

// Track recent email signup attempts to avoid hitting rate limits - outside the hook to persist between instances
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

export const useUserRegistration = () => {
    const registerUser = async (userData: UserData) => {
        const { email, password, fullName, phoneNumber, role = 'renter' } = userData;
        const normalizedEmail = email.trim().toLowerCase();

        // Check if this email has been used for signup recently
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
                }
            };
        }

        try {
            // Step 1: Register the user with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: {
                        full_name: fullName || ''
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                return { error };
            }

            // Record this successful signup attempt
            recentSignups.set(normalizedEmail, Date.now());

            // Step 2: Create user profile in the users table
            if (data.user) {
                try {
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert([{
                            id: data.user.id,
                            email: normalizedEmail,
                            full_name: fullName || null,
                            phone_number: phoneNumber || null,
                            role: role || 'renter',
                            is_admin: false
                        }]);

                    if (profileError) {
                        console.error('Error saving user profile:', profileError);
                        toast.error('Tạo hồ sơ người dùng thất bại');
                    }
                } catch (profileErr) {
                    console.error('Unexpected error saving profile:', profileErr);
                }
            }

            return { data, error: null };
        } catch (err: any) {
            console.error('Registration error:', err);
            return {
                error: {
                    message: err.message || 'Đã xảy ra lỗi khi đăng ký.',
                    status: err.status || 500
                }
            };
        }
    };

    return { registerUser };
}; 