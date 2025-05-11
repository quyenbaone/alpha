import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function AuthCallback() {
    const navigate = useNavigate();
    const { setSession } = useAuthStore();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session) {
                    await setSession(session);
                    toast.success('Đăng nhập thành công!');
                    navigate('/');
                } else {
                    toast.error('Không thể xác thực phiên đăng nhập');
                    navigate('/signin');
                }
            } catch (error) {
                console.error('Error handling auth callback:', error);
                toast.error('Đã xảy ra lỗi khi xử lý đăng nhập');
                navigate('/signin');
            }
        };

        handleAuthCallback();
    }, [navigate, setSession]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Đang xử lý đăng nhập...</h2>
                <p className="mt-2 text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
        </div>
    );
} 