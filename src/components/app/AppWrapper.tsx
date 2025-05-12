import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { LoadingComponent } from '../LoadingComponent';
import { ScrollToTop } from '../ScrollToTop';

export const AppWrapper = () => {
    const { setSession, loading } = useAuthStore();
    const { fetchSettings } = useSettingsStore();
    // Initialize with shorter timeout for faster app display
    const [initializing, setInitializing] = useState(true);
    const sessionErrorRef = useRef(false);
    
    // Refs to track toast notifications needed
    const toastMessagesRef = useRef<{type: 'error' | 'success' | 'info', message: string, id?: string}[]>([]);

    useEffect(() => {
        // Set a shorter timeout to prevent prolonged loading
        const timeoutId = setTimeout(() => {
            if (initializing) {
                console.info('App initialization continuing with available data');
                setInitializing(false);
            }
        }, 5000); // 5 seconds max loading time

        // Create a single promise to handle all initialization tasks
        const initialize = async () => {
            try {
                // Check for existing session and fetch settings in parallel
                const [sessionResult, _] = await Promise.allSettled([
                    supabase.auth.getSession(),
                    fetchSettings().catch(err => {
                        console.error('Error fetching settings:', err);
                        return null;
                    })
                ]);

                if (sessionResult.status === 'fulfilled') {
                    if (sessionResult.value.error) {
                        console.error('Session retrieval error:', sessionResult.value.error);
                        // Set a flag to show error toast in a separate useEffect
                        sessionErrorRef.current = true;
                        toastMessagesRef.current.push({
                            type: 'error',
                            message: 'Lỗi kết nối với dịch vụ xác thực'
                        });
                    } else if (sessionResult.value.data.session) {
                        await setSession(sessionResult.value.data.session);
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                toastMessagesRef.current.push({
                    type: 'error',
                    message: 'Lỗi khởi tạo xác thực'
                });
            } finally {
                clearTimeout(timeoutId);
                setInitializing(false);
            }
        };

        initialize();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                if (session) {
                    await setSession(session);
                }
            } catch (err) {
                console.error('Auth state change error:', err);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [setSession, fetchSettings, initializing]);

    // Separate useEffect for showing toasts to avoid setState during render
    useEffect(() => {
        // Process any pending toast messages
        if (toastMessagesRef.current.length > 0) {
            const timeoutId = setTimeout(() => {
                toastMessagesRef.current.forEach(({ type, message, id }) => {
                    if (type === 'error') toast.error(message, id ? { id } : undefined);
                    else if (type === 'success') toast.success(message, id ? { id } : undefined);
                    else if (type === 'info') toast.info(message, id ? { id } : undefined);
                });
                toastMessagesRef.current = []; // Clear processed messages
            }, 100);

            return () => clearTimeout(timeoutId);
        }
        
        // Show session error toast if flag is set
        if (sessionErrorRef.current) {
            const timeoutId = setTimeout(() => {
                toast.error('Lỗi kết nối với dịch vụ xác thực');
                sessionErrorRef.current = false;
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [initializing]); // Run when initializing changes

    // Show loading screen while initializing auth
    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-700">Đang khởi tạo ứng dụng...</h2>
                    <div className="mt-2 text-sm text-gray-500">Đang chuẩn bị giao diện</div>
                    <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <ScrollToTop />
            <Toaster position="top-right" />
            <div className="min-h-screen flex flex-col bg-background">
                <main className="flex-1">
                    <Suspense fallback={<LoadingComponent />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </>
    );
}; 