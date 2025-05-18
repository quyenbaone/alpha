import { Save } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OwnerLayout } from '../components/OwnerLayout';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// Define types for form state
interface UserFormData {
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    notification_email: boolean;
    notification_sms: boolean;
}

export default function OwnerSettings() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<UserFormData>({
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        notification_email: true,
        notification_sms: false
    });

    useEffect(() => {
        if (user) {
            setUserData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
                notification_email: user.notification_email !== false,
                notification_sms: user.notification_sms || false
            });
        }
    }, [user]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setUserData({
            ...userData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            setLoading(true);
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: userData.full_name,
                    phone_number: userData.phone_number,
                    address: userData.address
                } as any)
                .eq('id', user.id as any);

            if (error) throw error;

            // Update the local user state with all the form data
            setUser({
                ...user,
                full_name: userData.full_name,
                phone_number: userData.phone_number,
                address: userData.address,
                notification_email: userData.notification_email,
                notification_sms: userData.notification_sms
            });

            toast.success('Thông tin tài khoản đã được cập nhật');
        } catch (error: any) {
            console.error('Error updating user settings:', error);
            toast.error('Lỗi khi cập nhật thông tin: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <OwnerLayout>
            <div className="py-8 px-4 md:px-8 max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                        Cài đặt tài khoản
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Cập nhật thông tin tài khoản và tùy chọn nhận thông báo
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Thông tin cá nhân</h2>
                            </div>

                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={userData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={userData.email}
                                    disabled
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Email không thể thay đổi</p>
                            </div>

                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={userData.phone_number}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 pt-4 mt-4 border-t dark:border-gray-700">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                                    Tùy chọn thông báo
                                </h2>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="notification_email"
                                            name="notification_email"
                                            checked={userData.notification_email}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 dark:bg-gray-800 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded transition"
                                        />
                                        <label htmlFor="notification_email" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                                            Nhận thông báo qua email
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="notification_sms"
                                            name="notification_sms"
                                            checked={userData.notification_sms}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 dark:bg-gray-800 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded transition"
                                        />
                                        <label htmlFor="notification_sms" className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                                            Nhận thông báo qua SMS
                                        </label>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 dark:text-gray-400">
                                    Lưu ý: Tính năng thông báo đang được phát triển và sẽ được cập nhật trong phiên bản tiếp theo.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white dark:border-gray-300 border-t-transparent rounded-full"></span>
                                        Đang lưu...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <Save size={16} className="mr-2" />
                                        Lưu thay đổi
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </OwnerLayout>
    );
} 