import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function AuthCallback() {
    const navigate = useNavigate();
    const { setSession } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the URL hash and process it with Supabase auth
                const hash = window.location.hash;
                if (hash && hash.includes('access_token')) {
                    const { data, error } = await supabase.auth.getSession();

                    if (error) {
                        console.error('Session error:', error);
                        setError('Không thể xác thực phiên đăng nhập');
                        throw error;
                    }

                    if (data.session) {
                        await setSession(data.session);
                        toast.success('Đăng nhập thành công!');
                        // Redirect to the homepage after successful login
                        setTimeout(() => navigate('/'), 500);
                        return;
                    }
                }

                // If we got here without a session, try to get the session anyway
                const { data: sessionData } = await supabase.auth.getSession();

                if (sessionData?.session) {
                    await setSession(sessionData.session);
                    toast.success('Đăng nhập thành công!');
                    navigate('/');
                } else {
                    // If still no session, navigate to the signin page
                    setError('Không thể xác thực phiên đăng nhập');
                    setTimeout(() => navigate('/signin'), 2000);
                }
            } catch (err: any) {
                console.error('Error handling auth callback:', err);
                setError(err.message || 'Đã xảy ra lỗi khi xử lý đăng nhập');
                setTimeout(() => navigate('/signin'), 2000);
            }
        };

        handleAuthCallback();
    }, [navigate, setSession]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {error ? 'Lỗi đăng nhập' : 'Đang xử lý đăng nhập...'}
                </h2>
                <p className="mt-2 text-gray-600">
                    {error || 'Vui lòng đợi trong giây lát'}
                </p>
                {error && (
                    <div className="mt-4 animate-pulse">
                        Đang chuyển hướng về trang đăng nhập...
                    </div>
                )}
            </div>
            {!error && (
                <div className="mt-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
} 