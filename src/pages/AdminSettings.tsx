import { Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';

export function AdminSettings() {
    const [settings, setSettings] = useState({
        siteName: 'RentHub',
        siteDescription: 'Nền tảng cho thuê thiết bị hàng đầu',
        contactEmail: 'contact@renthub.com',
        contactPhone: '(84) 123 456 789',
        contactAddress: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
        maxRentalDays: 30,
        minRentalDays: 1,
        feePercentage: 10,
        maintenanceMode: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSaveSettings = () => {
        // In a real application, you would save these settings to your database
        // For this example, we'll just show a success message
        toast.success('Đã lưu cài đặt hệ thống');
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
                    <button
                        onClick={handleSaveSettings}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save className="h-5 w-5" /> Lưu cài đặt
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <h2 className="text-xl font-semibold mb-4">Cài đặt chung</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên trang web
                            </label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tên trang web"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <input
                                type="text"
                                name="siteDescription"
                                value={settings.siteDescription}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập mô tả trang web"
                            />
                        </div>

                        <div className="col-span-2">
                            <h2 className="text-xl font-semibold mb-4 mt-6">Thông tin liên hệ</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email liên hệ
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={settings.contactEmail}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập email liên hệ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                name="contactPhone"
                                value={settings.contactPhone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                name="contactAddress"
                                value={settings.contactAddress}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập địa chỉ"
                            />
                        </div>

                        <div className="col-span-2">
                            <h2 className="text-xl font-semibold mb-4 mt-6">Cài đặt cho thuê</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tối đa số ngày cho thuê
                            </label>
                            <input
                                type="number"
                                name="maxRentalDays"
                                value={settings.maxRentalDays}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số ngày tối đa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tối thiểu số ngày cho thuê
                            </label>
                            <input
                                type="number"
                                name="minRentalDays"
                                value={settings.minRentalDays}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số ngày tối thiểu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phí dịch vụ (%)
                            </label>
                            <input
                                type="number"
                                name="feePercentage"
                                value={settings.feePercentage}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập phần trăm phí"
                            />
                        </div>

                        <div>
                            <div className="flex items-center mt-4">
                                <input
                                    type="checkbox"
                                    id="maintenanceMode"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                                    Bật chế độ bảo trì
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Khi bật chế độ bảo trì, trang web sẽ không truy cập được với người dùng thông thường.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 