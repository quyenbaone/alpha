import { Edit, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OwnerLayout } from '../components/OwnerLayout';
import { supabase } from '../lib/supabase';
import { formatDate, formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

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
            setCategories(data || []);
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
            const { data, error } = await supabase
                .from('equipment')
                .select('*, category:category_id(*)')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEquipment(data || []);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            toast.error('Lỗi khi tải dữ liệu thiết bị');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Special handling for images which should be an array
        if (name === 'images') {
            // Split by comma and trim whitespace
            const imagesArray = value.split(',').map(img => img.trim()).filter(img => img);
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

    const handleAddEquipment = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title || !formData.price_per_day || !formData.category_id) {
            toast.error('Vui lòng nhập tiêu đề, giá và chọn danh mục');
            return;
        }

        try {
            // Generate slug from title
            const slug = formData.title
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6);

            const newEquipment = {
                ...formData,
                slug: slug,
                price_per_day: parseFloat(formData.price_per_day),
                quantity: parseInt(formData.quantity),
                owner_id: user.id,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('equipment')
                .insert([newEquipment])
                .select();

            if (error) throw error;

            toast.success('Đã thêm thiết bị mới');
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
            setShowAddForm(false);
            fetchEquipment();
        } catch (error) {
            console.error('Error adding equipment:', error);
            toast.error('Lỗi khi thêm thiết bị: ' + error.message);
        }
    };

    const handleEditEquipment = (item) => {
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

    const handleUpdateEquipment = async (e) => {
        e.preventDefault();

        if (!editingEquipment) return;

        try {
            // No need to regenerate slug on update
            const updatedEquipment = {
                ...formData,
                price_per_day: parseFloat(formData.price_per_day),
                quantity: parseInt(formData.quantity),
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('equipment')
                .update(updatedEquipment)
                .eq('id', editingEquipment.id)
                .eq('owner_id', user.id); // Extra safety to ensure they own it

            if (error) throw error;

            toast.success('Cập nhật thiết bị thành công');
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
            setEditingEquipment(null);
            setShowAddForm(false);
            fetchEquipment();
        } catch (error) {
            console.error('Error updating equipment:', error);
            toast.error('Lỗi khi cập nhật thiết bị: ' + error.message);
        }
    };

    const handleDeleteEquipment = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;

        try {
            // Extra check to ensure they own the equipment
            const { error } = await supabase
                .from('equipment')
                .delete()
                .eq('id', id)
                .eq('owner_id', user.id);

            if (error) throw error;

            toast.success('Đã xóa thiết bị');
            fetchEquipment();
        } catch (error) {
            console.error('Error deleting equipment:', error);
            toast.error('Lỗi khi xóa thiết bị');
        }
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
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quản lý thiết bị</h1>
                        <p className="text-gray-600 mt-1">Quản lý danh sách thiết bị của bạn</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button
                            onClick={() => {
                                setEditingEquipment(null);
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
                                setShowAddForm(true);
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            Thêm thiết bị mới
                        </button>
                    </div>
                </div>

                {/* Search and filter */}
                <div className="mb-6">
                    <div className="flex items-center bg-white rounded-lg shadow-sm px-3 py-2">
                        <Search size={20} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thiết bị..."
                            className="flex-grow outline-none text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-gray-600"
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
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {equipment.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-gray-500">Bạn chưa có thiết bị nào</p>
                                <button
                                    onClick={() => {
                                        setEditingEquipment(null);
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
                                        setShowAddForm(true);
                                    }}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Thêm thiết bị mới
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thiết bị
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Danh mục
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Giá / ngày
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ngày tạo
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hành động
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredEquipment.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {item.images && item.images.length > 0 ? (
                                                                <img className="h-10 w-10 object-cover rounded-md" src={item.images[0]} alt={item.title} />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500">No img</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                                            <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category?.name || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(item.price_per_day)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                            item.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                        {item.status === 'available' ? 'Có sẵn' :
                                                            item.status === 'rented' ? 'Đang thuê' : 'Không có sẵn'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEditEquipment(item)}
                                                        className="text-blue-600 hover:text-blue-800 mr-3"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEquipment(item.id)}
                                                        className="text-red-600 hover:text-red-800"
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
                    <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingEquipment ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
                            </h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={editingEquipment ? handleUpdateEquipment : handleAddEquipment}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-1">Tiêu đề</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-1">Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Giá thuê mỗi ngày (VND)</label>
                                    <input
                                        type="number"
                                        name="price_per_day"
                                        value={formData.price_per_day}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Danh mục</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Số lượng</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Vị trí</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-1">Đường dẫn hình ảnh</label>
                                <input
                                    type="text"
                                    name="images"
                                    value={Array.isArray(formData.images) ? formData.images.join(', ') : ''}
                                    onChange={handleInputChange}
                                    placeholder="Nhập đường dẫn hình ảnh, cách nhau bởi dấu phẩy"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Nhập nhiều URL hình ảnh, cách nhau bởi dấu phẩy</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-1">Trạng thái</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="available">Có sẵn</option>
                                    <option value="unavailable">Không có sẵn</option>
                                    <option value="rented">Đang thuê</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingEquipment ? 'Cập nhật' : 'Thêm thiết bị'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </OwnerLayout>
    );
} 