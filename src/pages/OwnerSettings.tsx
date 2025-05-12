import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OwnerLayout } from '../components/OwnerLayout';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function OwnerSettings() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        notification_email: true,
        notification_sms: false
    });

    useEffect(() => {
        if (user) {
            setUserData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                notification_email: user.notification_email !== false,
                notification_sms: user.notification_sms || false
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData({
            ...userData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('users')
                .update({
                    full_name: userData.full_name,
                    phone: userData.phone,
                    address: userData.address,
                    notification_email: userData.notification_email,
                    notification_sms: userData.notification_sms,
                    updated_at: new Date()
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update the local user state
            setUser({
                ...user,
                ...userData
            });

            toast.success('Thông tin tài khoản đã được cập nhật');
        } catch (error) {
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Cài đặt tài khoản</h1>
                    <p className="text-gray-600 mt-1">Cập nhật thông tin tài khoản và tùy chọn nhận thông báo</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
                            </div>

                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={userData.full_name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={userData.email}
                                    disabled
                                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={userData.phone}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={userData.address}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 pt-4 mt-4 border-t">
                                <h2 className="text-lg font-semibold mb-4">Tùy chọn thông báo</h2>
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
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="notification_email" className="ml-2 block text-sm text-gray-700">
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
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="notification_sms" className="ml-2 block text-sm text-gray-700">
                                            Nhận thông báo qua SMS
                                        </label>
                                    </div>
                                </div>
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
                                        <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
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