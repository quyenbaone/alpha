import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, useRealtimeChannel } from '../lib/supabase';
import { Notification } from '../lib/types';
import { useAuthStore } from '../store/authStore';

interface NotificationProps {
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    user_id: string;
    action_url?: string;
    type?: string;
}

export default function NotificationCenter() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const isActiveTab = useRealtimeChannel('notifications');

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Only subscribe to realtime updates if this is the active tab
            if (isActiveTab) {
                return subscribeToNotifications();
            }
        }
    }, [user, isActiveTab]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount(data?.filter((n) => !n.read).length || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const subscribeToNotifications = () => {
        // Only create subscription if this is the active tab
        if (!isActiveTab) return () => { };

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user?.id}`,
                },
                (payload) => {
                    setNotifications((prev) => [payload.new as Notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) throw error;

            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications
                .filter((n) => !n.read)
                .map((n) => n.id);

            if (unreadIds.length === 0) return;

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', unreadIds);

            if (error) throw error;

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = (notification: NotificationProps) => {
        // Mark as read when clicked
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Handle navigation if action_url exists
        if (notification.action_url) {
            window.location.href = notification.action_url;
        }

        // Close dropdown
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Notifications"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-block w-5 h-5 text-xs text-white bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
                    <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-medium">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Không có thông báo nào
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="font-medium">{notification.title}</div>
                                    <div className="text-sm text-gray-600">
                                        {notification.message}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 