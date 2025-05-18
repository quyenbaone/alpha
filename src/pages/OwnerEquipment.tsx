import { Edit, Plus, Search, Trash2, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OwnerLayout } from '../components/OwnerLayout';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { formatDate, formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

// Types for Supabase tables
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbEquipment = Database['public']['Tables']['equipment']['Row'];
type InsertEquipment = Database['public']['Tables']['equipment']['Insert'];
type UpdateEquipment = Database['public']['Tables']['equipment']['Update'];

// Interfaces for type safety
interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

interface EquipmentItem {
    id: string;
    title: string;
    description?: string;
    price_per_day: number;
    category_id?: string;
    category?: Category;
    owner_id: string;
    images?: string[];
    quantity?: number;
    location?: string;
    status: string;
    created_at: string;
    updated_at?: string;
    slug?: string;
}

export default function OwnerEquipment() {
    const { user } = useAuthStore();
    const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price_per_day: '',
        category_id: '',
        images: [] as string[],
        quantity: '1',
        location: '',
        status: 'available'
    });

    useEffect(() => {
        if (user) {
            fetchEquipment();
            fetchCategories();
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });
            if (error) throw error;
            setCategories(data as Category[] || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Lỗi khi tải danh mục');
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            // Only fetch equipment owned by this user
            if (!user) return;

            const { data, error } = await supabase
                .from('equipment')
                .select('*, category:category_id(*)')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEquipment(data as EquipmentItem[] || []);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            toast.error('Lỗi khi tải dữ liệu thiết bị');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Special handling for images which should be an array
        if (name === 'images') {
            // Split by comma and trim whitespace
            const imagesArray = value.split(',').map((img: string) => img.trim()).filter((img: string) => img);
            setFormData({
                ...formData,
                [name]: imagesArray
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Validate form
    const validateForm = () => {
        if (!formData.title || !formData.price_per_day || !formData.category_id) {
            toast.error('Vui lòng nhập tiêu đề, giá và chọn danh mục');
            return false;
        }
        if (parseFloat(formData.price_per_day) <= 0) {
            toast.error('Giá phải lớn hơn 0');
            return false;
        }
        if (parseInt(formData.quantity) <= 0) {
            toast.error('Số lượng phải lớn hơn 0');
            return false;
        }
        if (categories.length === 0) {
            toast.error('Bạn cần tạo danh mục trước!');
            return false;
        }
        // Optionally check image URL format
        return true;
    };

    const handleAddEquipment = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !user) return;
        setIsSubmitting(true);

        try {
            // Generate slug from title
            const slug = formData.title
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6);

            const newEquipment: InsertEquipment = {
                title: formData.title,
                description: formData.description,
                slug: slug,
                price_per_day: parseFloat(formData.price_per_day),
                quantity: parseInt(formData.quantity),
                owner_id: user.id,
                category_id: formData.category_id,
                images: formData.images,
                location: formData.location,
                status: formData.status,
            };

            const { error } = await supabase
                .from('equipment')
                .insert(newEquipment);

            if (error) throw error;

            toast.success('Đã thêm thiết bị mới');
            resetForm();
            fetchEquipment();
            setShowAddForm(false);
        } catch (error: any) {
            console.error('Error adding equipment:', error);
            toast.error('Lỗi khi thêm thiết bị: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditEquipment = (item: EquipmentItem) => {
        setEditingEquipment(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            price_per_day: item.price_per_day ? item.price_per_day.toString() : '',
            category_id: item.category_id || '',
            images: item.images || [],
            quantity: item.quantity ? item.quantity.toString() : '1',
            location: item.location || '',
            status: item.status || 'available'
        });
        setShowAddForm(true);
    };

    const handleUpdateEquipment = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingEquipment || !validateForm() || !user) return;
        setIsSubmitting(true);

        try {
            // No need to regenerate slug on update
            const updatedEquipment: UpdateEquipment = {
                title: formData.title,
                description: formData.description,
                price_per_day: parseFloat(formData.price_per_day),
                quantity: parseInt(formData.quantity),
                category_id: formData.category_id,
                images: formData.images,
                location: formData.location,
                status: formData.status,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('equipment')
                .update(updatedEquipment)
                .eq('id', editingEquipment.id)
                .eq('owner_id', user.id);

            if (error) throw error;

            toast.success('Cập nhật thiết bị thành công');
            resetForm();
            setEditingEquipment(null);
            setShowAddForm(false);
            fetchEquipment();
        } catch (error: any) {
            console.error('Error updating equipment:', error);
            toast.error('Lỗi khi cập nhật thiết bị: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEquipment = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?') || !user) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('equipment')
                .delete()
                .eq('id', id)
                .eq('owner_id', user.id);

            if (error) throw error;

            toast.success('Đã xóa thiết bị');
            fetchEquipment();
        } catch (error: any) {
            console.error('Error deleting equipment:', error);
            toast.error('Lỗi khi xóa thiết bị');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price_per_day: '',
            category_id: '',
            images: [],
            quantity: '1',
            location: '',
            status: 'available'
        });
    };

    const filteredEquipment = searchTerm
        ? equipment.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category_id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : equipment;

    return (
        <OwnerLayout>
            <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Quản lý thiết bị</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý danh sách thiết bị của bạn</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => {
                                setEditingEquipment(null);
                                resetForm();
                                setShowAddForm(true);
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            disabled={loadingCategories}
                        >
                            <Plus size={16} className="mr-2" />
                            Thêm thiết bị mới
                        </button>
                    </div>
                </div>

                {/* Search and filter */}
                <div className="mb-6">
                    <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg shadow-sm px-3 py-2">
                        <Search size={20} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thiết bị..."
                            className="flex-grow bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Equipment list */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
                        {equipment.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-gray-500 dark:text-gray-400">Bạn chưa có thiết bị nào</p>
                                <button
                                    onClick={() => {
                                        setEditingEquipment(null);
                                        resetForm();
                                        setShowAddForm(true);
                                    }}
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                >
                                    Thêm thiết bị mới
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thiết bị</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Danh mục</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giá / ngày</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                        {filteredEquipment.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {item.images && item.images.length > 0 ? (
                                                                <img className="h-10 w-10 object-cover rounded-md" src={item.images[0]} alt={item.title} />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">No img</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{item.description}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.category?.name || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatPrice(item.price_per_day)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${item.status === 'available' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                                                            item.status === 'rented' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                                                                'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'}`}>
                                                        {item.status === 'available' ? 'Có sẵn' :
                                                            item.status === 'rented' ? 'Đang thuê' : 'Không có sẵn'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(item.created_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEditEquipment(item)}
                                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                                        disabled={isSubmitting}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEquipment(item.id)}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        disabled={isSubmitting}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Equipment Modal */}
            {showAddForm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingEquipment ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                    setEditingEquipment(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {loadingCategories ? (
                            <div className="text-center py-4 dark:text-gray-200">Đang tải danh mục...</div>
                        ) : categories.length === 0 ? (
                            <div className="text-center text-red-500 dark:text-red-400 font-medium py-6">
                                Bạn chưa có danh mục nào.<br />
                                Vui lòng tạo danh mục trước khi thêm thiết bị.
                            </div>
                        ) : (
                            <form onSubmit={editingEquipment ? handleUpdateEquipment : handleAddEquipment}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Tiêu đề</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Mô tả</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Giá thuê mỗi ngày (VND)</label>
                                        <input
                                            type="number"
                                            name="price_per_day"
                                            value={formData.price_per_day}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                            required
                                            min={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Danh mục</label>
                                        <select
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                            required
                                        >
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Số lượng</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Vị trí</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Đường dẫn hình ảnh</label>
                                    <input
                                        type="text"
                                        name="images"
                                        value={Array.isArray(formData.images) ? formData.images.join(', ') : ''}
                                        onChange={handleInputChange}
                                        placeholder="Nhập đường dẫn hình ảnh, cách nhau bởi dấu phẩy"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nhập nhiều URL hình ảnh, cách nhau bởi dấu phẩy</p>
                                    {Array.isArray(formData.images) && formData.images.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {formData.images.map((url, idx) => (
                                                <img key={idx} src={url} className="h-12 w-12 object-cover rounded border" alt={`Preview ${idx + 1}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Trạng thái</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
                                    >
                                        <option value="available">Có sẵn</option>
                                        <option value="unavailable">Không có sẵn</option>
                                        <option value="rented">Đang thuê</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            resetForm();
                                            setEditingEquipment(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        disabled={isSubmitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? (editingEquipment ? 'Đang cập nhật...' : 'Đang thêm...')
                                            : (editingEquipment ? 'Cập nhật' : 'Thêm thiết bị')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </OwnerLayout>
    );
}
