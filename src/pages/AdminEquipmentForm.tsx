import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// Function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Function to format price for display
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

export function AdminEquipmentForm() {
    const { user } = useAuthStore();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [previewUrl, setPreviewUrl] = useState('');
    const [equipment, setEquipment] = useState({
        title: '',
        description: '',
        price_per_day: '',
        category_id: '',
        images: [],
        deposit_amount: '',
        location: 'Hồ Chí Minh',
        imageInput: '', // Temporary field for UI
        condition: 'Mới',
        available_quantity: '1',
        tags: [],
        status: 'available',
        tagInput: '' // Temporary field for UI
    });

    useEffect(() => {
        if (user) {
            fetchCategories();
            if (id) {
                fetchEquipment(id);
            } else {
                setLoading(false);
            }
        }
    }, [user, id]);

    // Update preview URL when imageInput changes
    useEffect(() => {
        if (equipment.imageInput) {
            setPreviewUrl(equipment.imageInput);
        }
    }, [equipment.imageInput]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Lỗi khi tải danh mục thiết bị');
        }
    };

    const fetchEquipment = async (equipmentId) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('equipment')
                .select('*')
                .eq('id', equipmentId)
                .single();

            if (error) throw error;

            if (data) {
                setEquipment({
                    ...data,
                    imageInput: data.images?.[0] || '',
                    tagInput: '',
                    available_quantity: data.available_quantity?.toString() || '1',
                    tags: data.tags || []
                });
                setPreviewUrl(data.images?.[0] || '');
            }
        } catch (error) {
            console.error('Error fetching equipment:', error);
            toast.error('Lỗi khi tải thông tin thiết bị');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEquipment(prev => ({ ...prev, [name]: value }));
    };

    // Function to handle numeric input with formatting
    const handleNumericInput = (e) => {
        const { name, value } = e.target;
        // Remove any non-digit characters except for the decimal point
        const numericValue = value.replace(/[^\d]/g, '');
        setEquipment(prev => ({ ...prev, [name]: numericValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!equipment.title || !equipment.price_per_day || !equipment.category_id) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                setLoading(false);
                return;
            }

            // Generate slug from title
            const slug = generateSlug(equipment.title);

            // Prepare images array
            const images = equipment.imageInput ? [equipment.imageInput] : [];

            // Create payload with all required fields
            const equipmentPayload = {
                title: equipment.title,
                slug: slug,
                description: equipment.description || '',
                category_id: equipment.category_id,
                price_per_day: parseFloat(equipment.price_per_day) || 0,
                deposit_amount: parseFloat(equipment.deposit_amount) || 0,
                images: images,
                condition: equipment.condition,
                available_quantity: parseInt(equipment.available_quantity) || 0,
                tags: equipment.tags,
                status: equipment.status,
                location: equipment.location || 'Hồ Chí Minh',
                updated_at: new Date()
            };

            if (!id) {
                // Creating new equipment
                equipmentPayload.owner_id = user.id;
                equipmentPayload.created_at = new Date();

                const { error } = await supabase
                    .from('equipment')
                    .insert([equipmentPayload]);

                if (error) throw error;
                toast.success('Đã thêm thiết bị mới thành công');
            } else {
                // Updating existing equipment
                const { error } = await supabase
                    .from('equipment')
                    .update(equipmentPayload)
                    .eq('id', id);

                if (error) throw error;
                toast.success('Đã cập nhật thiết bị thành công');
            }

            // Go back to equipment list
            navigate('/admin/equipment');
        } catch (error) {
            console.error('Error saving equipment:', error);
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (equipment.tagInput.trim()) {
            setEquipment({
                ...equipment,
                tags: [...equipment.tags, equipment.tagInput.trim()],
                tagInput: ''
            });
        }
    };

    const removeTag = (index) => {
        setEquipment({
            ...equipment,
            tags: equipment.tags.filter((_, i) => i !== index)
        });
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{id ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}</h1>
                    <button
                        onClick={() => navigate('/admin/equipment')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Quay lại
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên thiết bị <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={equipment.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tên thiết bị"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thể loại <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category_id"
                                    value={equipment.category_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Chọn thể loại</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá thuê/ngày <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="price_per_day"
                                        value={equipment.price_per_day}
                                        onChange={handleNumericInput}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập giá thuê"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        VND
                                    </div>
                                </div>
                                {equipment.price_per_day && (
                                    <div className="mt-1 text-xs text-gray-500">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(equipment.price_per_day))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiền đặt cọc
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="deposit_amount"
                                        value={equipment.deposit_amount}
                                        onChange={handleNumericInput}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tiền đặt cọc"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        VND
                                    </div>
                                </div>
                                {equipment.deposit_amount && (
                                    <div className="mt-1 text-xs text-gray-500">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(equipment.deposit_amount))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa điểm
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={equipment.location}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập địa điểm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link hình ảnh
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        name="imageInput"
                                        value={equipment.imageInput}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập link hình ảnh"
                                    />
                                </div>
                                {previewUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="h-32 w-auto object-cover rounded-lg border"
                                            onError={() => setPreviewUrl('/placeholder.png')}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tình trạng thiết bị
                                </label>
                                <select
                                    name="condition"
                                    value={equipment.condition}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Mới">Mới</option>
                                    <option value="Cũ">Cũ</option>
                                    <option value="Còn tốt">Còn tốt</option>
                                    <option value="Cần bảo trì">Cần bảo trì</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số lượng khả dụng
                                </label>
                                <input
                                    type="text"
                                    name="available_quantity"
                                    value={equipment.available_quantity}
                                    onChange={handleNumericInput}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập số lượng khả dụng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái hiển thị
                                </label>
                                <select
                                    name="status"
                                    value={equipment.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="available">Hiển thị (Có sẵn)</option>
                                    <option value="hidden">Ẩn</option>
                                    <option value="maintenance">Bảo trì</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thẻ/Tags
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        name="tagInput"
                                        value={equipment.tagInput}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nhập tag (vd: outdoor)"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && equipment.tagInput.trim()) {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
                                        onClick={addTag}
                                    >
                                        Thêm
                                    </button>
                                </div>
                                {equipment.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {equipment.tags.map((tag, index) => (
                                            <div key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center">
                                                {tag}
                                                <button
                                                    type="button"
                                                    className="ml-1 text-gray-500 hover:text-red-500"
                                                    onClick={() => removeTag(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-500">Nhấn Enter hoặc bấm Thêm để thêm tag</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={equipment.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập mô tả thiết bị"
                                rows={4}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/equipment')}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : (id ? 'Cập nhật' : 'Thêm mới')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}