import { Brush, Globe, Mail, MapPin, Phone, Save, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { SettingsType } from '../lib/services/settings';
import { uploadFile } from '../lib/services/storage';
import { useSettingsStore } from '../store/settingsStore';

export function AdminSettings() {
    const { settings, loading, fetchSettings, updateSettings: saveSettings } = useSettingsStore();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<SettingsType>(settings);
    const [logoPreview, setLogoPreview] = useState(settings.site_logo || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Update form when settings change
    useEffect(() => {
        setFormData(settings);
        if (settings.site_logo) {
            setLogoPreview(settings.site_logo);
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });

            // Update logo preview when URL changes
            if (name === 'site_logo') {
                setLogoPreview(value);
            }
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            // Invalidate logo cache by appending a timestamp parameter if it's a URL
            if (formData.site_logo && formData.site_logo.startsWith('http')) {
                const separator = formData.site_logo.includes('?') ? '&' : '?';
                const timestamp = `${separator}t=${Date.now()}`;
                formData.site_logo = formData.site_logo.split('?')[0] + timestamp;
            }

            const success = await saveSettings(formData);
            if (success) {
                toast.success('Đã lưu cài đặt thành công');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Lỗi khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Chỉ hỗ trợ tệp hình ảnh (JPG, PNG, GIF)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước tệp không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        toast.info('Đang tải lên...', { duration: 2000 });

        try {
            // First try using our storage service
            let publicUrl = await uploadFile(file, 'public', 'logos');

            // If storage service fails, try with a temporary URL (data URL)
            if (!publicUrl) {
                publicUrl = await convertToDataURL(file);
                toast.warning('Đã sử dụng phương thức tải lên thay thế');
            }

            if (publicUrl) {
                // Add timestamp to force cache refresh
                if (publicUrl.startsWith('http')) {
                    const separator = publicUrl.includes('?') ? '&' : '?';
                    publicUrl = `${publicUrl}${separator}t=${Date.now()}`;
                }

                // Update form data
                setFormData({
                    ...formData,
                    site_logo: publicUrl
                });

                // Update preview
                setLogoPreview(publicUrl);

                toast.success('Tải lên thành công');
            } else {
                throw new Error('Không thể tải lên tệp');
            }
        } catch (error: any) {
            console.error('Error uploading file:', error);

            // Try one last fallback - data URL
            try {
                const dataUrl = await convertToDataURL(file);
                if (dataUrl) {
                    setFormData({
                        ...formData,
                        site_logo: dataUrl
                    });
                    setLogoPreview(dataUrl);
                    toast.success('Tải lên thành công (phương thức thay thế)');
                    return;
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }

            // Give more helpful error messages based on error type
            if (error.message?.includes('permission')) {
                toast.error('Lỗi quyền truy cập: Không có quyền tải lên tệp');
            } else if (error.message?.includes('network')) {
                toast.error('Lỗi kết nối mạng khi tải lên tệp');
            } else if (error.message?.includes('not found')) {
                toast.error('Lỗi: Không tìm thấy bucket lưu trữ');
            } else {
                toast.error(`Lỗi khi tải lên tệp: ${error.message || 'Lỗi không xác định'}`);
            }
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Helper function to convert file to data URL as a last resort
    const convertToDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving || loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="mr-2 h-4 w-4 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>

                {loading && !formData ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Thông tin trang web */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-blue-500" />
                                    Thông tin trang web
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên trang web
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            name="site_name"
                                            value={formData.site_name}
                                            onChange={handleChange}
                                            placeholder="Nhập tên trang web"
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Logo trang web
                                    </label>
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                name="site_logo"
                                                value={formData.site_logo}
                                                onChange={handleChange}
                                                placeholder="URL của logo (https://...)"
                                                className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                            />
                                            <button
                                                type="button"
                                                onClick={triggerFileInput}
                                                disabled={uploading}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {uploading ? (
                                                    <div className="mr-1 h-4 w-4 border-2 border-dashed rounded-full animate-spin border-gray-500"></div>
                                                ) : (
                                                    <UploadCloud className="h-4 w-4 mr-1" />
                                                )}
                                                Upload
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                        {logoPreview && (
                                            <div className="mt-2 flex justify-center p-2 border rounded-md">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo Preview"
                                                    className="h-16 object-contain"
                                                    onError={() => setLogoPreview('')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 border-t">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                                        Địa chỉ liên hệ
                                    </label>
                                    <textarea
                                        name="contact_address"
                                        value={formData.contact_address}
                                        onChange={handleChange}
                                        rows={2}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                        placeholder="Địa chỉ liên hệ của công ty"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                        <Phone className="w-4 h-4 mr-1 text-blue-500" />
                                        Số điện thoại liên hệ
                                    </label>
                                    <input
                                        type="text"
                                        name="contact_phone"
                                        value={formData.contact_phone}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                        placeholder="Số điện thoại liên hệ"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                        <Mail className="w-4 h-4 mr-1 text-blue-500" />
                                        Email liên hệ
                                    </label>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={formData.contact_email}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                        placeholder="Email liên hệ của công ty"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cài đặt chung */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Brush className="w-5 h-5 mr-2 text-blue-500" />
                                    Cài đặt chung
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đơn vị tiền tệ
                                    </label>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                    >
                                        <option value="VNĐ">VNĐ</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Đơn vị thời gian thuê
                                    </label>
                                    <select
                                        name="rental_time_unit"
                                        value={formData.rental_time_unit}
                                        onChange={handleChange}
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                    >
                                        <option value="hour">Giờ</option>
                                        <option value="day">Ngày</option>
                                        <option value="week">Tuần</option>
                                        <option value="month">Tháng</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Link Facebook
                                    </label>
                                    <input
                                        type="url"
                                        name="facebook_link"
                                        value={formData.facebook_link}
                                        onChange={handleChange}
                                        placeholder="https://facebook.com/..."
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white text-gray-900"
                                    />
                                </div>

                                <div className="pt-4 space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="allow_user_equipment_creation"
                                                name="allow_user_equipment_creation"
                                                type="checkbox"
                                                checked={formData.allow_user_equipment_creation}
                                                onChange={handleChange}
                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="allow_user_equipment_creation" className="font-medium text-gray-700">
                                                Cho phép người dùng thêm thiết bị
                                            </label>
                                            <p className="text-gray-500">
                                                Người dùng có thể thêm thiết bị mới vào hệ thống
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="auto_email_notifications"
                                                name="auto_email_notifications"
                                                type="checkbox"
                                                checked={formData.auto_email_notifications}
                                                onChange={handleChange}
                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="auto_email_notifications" className="font-medium text-gray-700">
                                                Gửi email thông báo tự động
                                            </label>
                                            <p className="text-gray-500">
                                                Gửi email tự động khi có đơn thuê mới, hết hạn, v.v.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 