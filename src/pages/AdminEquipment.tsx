import { Edit, Plus, Save, Search, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

// ======= INTERFACE =======
interface Equipment {
    id: string;
    title: string;
    description?: string;
    price_per_day: number;
    category_id: string;
    owner_id: string;
    images?: string[];
    deposit_amount?: number;
    location?: string;
    status?: string;
    quantity?: number;
    created_at?: Date;
    updated_at?: Date;
    owner?: {
        email: string;
    };
    category?: {
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
}

interface EditFormData {
    title: string;
    description: string;
    price_per_day: string;
    category_id: string;
    images: string[];
    imageInput: string;
    deposit_amount: string | number;
    location: string;
    status: string;
    quantity: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

interface EquipmentFormProps {
    formData: any;
    setFormData: (data: any) => void;
    onSave: () => void;
    onCancel: () => void;
    title: string;
    saveButtonText: string;
}

// ======= UTILS =======
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ======= MODAL COMPONENT =======
const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
};

// ======= MAIN COMPONENT =======
export function AdminEquipment() {
    const { user } = useAuthStore();
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EditFormData>({
        title: '',
        description: '',
        price_per_day: '',
        category_id: '',
        images: [],
        imageInput: '',
        deposit_amount: '',
        location: '',
        status: '',
        quantity: ''
    });
    const [showNewEquipmentForm, setShowNewEquipmentForm] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        title: '',
        description: '',
        price_per_day: '',
        category_id: '',
        images: [],
        imageInput: '',
        deposit_amount: '',
        location: 'Hồ Chí Minh',
        status: 'available',
        quantity: '1'
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCategories();
            fetchEquipment();
        }
        // eslint-disable-next-line
    }, [user]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            toast.error('Lỗi khi tải danh mục thiết bị');
        }
    };

    const getCategoryName = (categoryId: string): string => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Không xác định';
    };

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const { data: equipmentData, error: equipmentError } = await supabase
                .from('equipment')
                .select(`
                    *,
                    owner:owner_id (
                        email
                    ),
                    category:category_id (
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (equipmentError) throw equipmentError;
            setEquipment(equipmentData || []);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu thiết bị');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEquipment = async (equipmentId: string) => {
        const item = equipment.find(e => e.id === equipmentId);
        if (!item) {
            toast.error('Không tìm thấy thiết bị');
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setEditingItem(equipmentId);
        setEditForm({
            title: item.title,
            description: item.description || '',
            price_per_day: item.price_per_day.toString(),
            category_id: item.category_id,
            images: item.images || [],
            imageInput: item.images && item.images.length > 0 ? item.images[0] : '',
            deposit_amount: item.deposit_amount?.toString() || '',
            location: item.location || 'Hồ Chí Minh',
            status: item.status || 'available',
            quantity: item.quantity?.toString() || '1'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            if (!editForm.title || !editForm.category_id || !editForm.price_per_day) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }
            const price_per_day = parseFloat(editForm.price_per_day);
            const deposit_amount = parseFloat(editForm.deposit_amount.toString()) || 0;
            const quantity = parseInt(editForm.quantity) || 1;
            if (isNaN(price_per_day) || price_per_day <= 0) {
                toast.error('Giá thuê phải là số dương');
                return;
            }
            if (isNaN(quantity) || quantity <= 0) {
                toast.error('Số lượng phải là số dương');
                return;
            }
            const slug = generateSlug(editForm.title);
            const images = editForm.imageInput ? [editForm.imageInput] : [];
            const updatePayload = {
                title: editForm.title,
                slug,
                description: editForm.description || '',
                price_per_day,
                category_id: editForm.category_id,
                images,
                deposit_amount,
                location: editForm.location || 'Hồ Chí Minh',
                status: editForm.status,
                quantity,
                updated_at: new Date()
            };
            const { error } = await supabase
                .from('equipment')
                .update(updatePayload)
                .eq('id', editingItem);

            if (error) throw error;
            toast.success('Đã cập nhật thông tin thiết bị');
            setEditingItem(null);
            setEditForm({
                title: '',
                description: '',
                price_per_day: '',
                category_id: '',
                images: [],
                imageInput: '',
                deposit_amount: '',
                location: '',
                status: '',
                quantity: ''
            });
            setIsEditModalOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            fetchEquipment();
        } catch (error: any) {
            toast.error(`Lỗi khi cập nhật thông tin: ${error.message || 'Lỗi không xác định'}`);
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditForm({
            title: '',
            description: '',
            price_per_day: '',
            category_id: '',
            images: [],
            imageInput: '',
            deposit_amount: '',
            location: '',
            status: '',
            quantity: ''
        });
        setIsEditModalOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteEquipment = async (equipmentId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
        try {
            const { error } = await supabase
                .from('equipment')
                .delete()
                .eq('id', equipmentId);
            if (error) throw error;
            toast.success('Đã xóa thiết bị');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            fetchEquipment();
        } catch (error) {
            toast.error('Lỗi khi xóa thiết bị');
        }
    };

    const handleCreateEquipment = async () => {
        try {
            if (!newEquipment.title || !newEquipment.price_per_day || !newEquipment.category_id) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }
            if (!user) {
                toast.error('Bạn cần đăng nhập để thêm thiết bị');
                return;
            }
            const slug = generateSlug(newEquipment.title);
            const images = newEquipment.imageInput ? [newEquipment.imageInput] : [];
            const equipmentPayload = {
                title: newEquipment.title,
                slug,
                description: newEquipment.description || '',
                category_id: newEquipment.category_id,
                price_per_day: parseFloat(newEquipment.price_per_day),
                deposit_amount: parseFloat(newEquipment.deposit_amount) || 0,
                images,
                owner_id: user.id,
                location: newEquipment.location || 'Hồ Chí Minh',
                status: newEquipment.status,
                quantity: parseInt(newEquipment.quantity) || 1,
                created_at: new Date(),
                updated_at: new Date()
            };
            const { error } = await supabase
                .from('equipment')
                .insert([equipmentPayload]);
            if (error) throw error;
            toast.success('Đã thêm thiết bị mới');
            setShowNewEquipmentForm(false);
            setNewEquipment({
                title: '',
                description: '',
                price_per_day: '',
                category_id: '',
                images: [],
                imageInput: '',
                deposit_amount: '',
                location: 'Hồ Chí Minh',
                status: 'available',
                quantity: '1'
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            fetchEquipment();
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi thêm thiết bị mới');
        }
    };

    const filteredEquipment = equipment.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ====== FORM COMPONENT ======
    const EquipmentForm = ({ formData, setFormData, onSave, onCancel, title, saveButtonText }: EquipmentFormProps) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900 border-b border-blue-100 dark:border-blue-800 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                    {title === "Thêm thiết bị mới" ? <Plus className="h-5 w-5 mr-2 text-blue-600" /> : <Edit className="h-5 w-5 mr-2 text-blue-600" />}
                    {title}
                </h2>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left */}
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">Thông tin cơ bản</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                        Tên thiết bị <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                        placeholder="Nhập tên thiết bị"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                        Danh mục <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            Giá thuê/ngày <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.price_per_day}
                                                onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">VNĐ</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            Tiền đặt cọc
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.deposit_amount}
                                                onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-2 text-sm text-gray-500 dark:text-gray-400">VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            Số lượng
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                            placeholder="1"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            Địa điểm
                                        </label>
                                        <input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                            placeholder="Nhập địa điểm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">Hình ảnh & Vị trí</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                        Link hình ảnh
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            value={formData.imageInput}
                                            onChange={(e) => setFormData({ ...formData, imageInput: e.target.value })}
                                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                    {formData.imageInput && (
                                        <div className="mt-2 flex justify-center">
                                            <img
                                                className="h-32 w-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                                src={formData.imageInput}
                                                alt="Preview"
                                                onError={(e) => e.currentTarget.src = '/placeholder.png'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right */}
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">Trạng thái & Hiển thị</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                    Trạng thái hiển thị
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div
                                        className={`border rounded-lg p-3 text-center cursor-pointer ${formData.status === 'available' ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-200' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        onClick={() => setFormData({ ...formData, status: 'available' })}
                                    >
                                        <div className="flex justify-center mb-1">
                                            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                                        </div>
                                        <span className="text-sm font-medium">Có sẵn</span>
                                    </div>
                                    <div
                                        className={`border rounded-lg p-3 text-center cursor-pointer ${formData.status === 'hidden' ? 'bg-gray-50 border-gray-500 text-gray-700 dark:bg-gray-700 dark:border-gray-400 dark:text-gray-100' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        onClick={() => setFormData({ ...formData, status: 'hidden' })}
                                    >
                                        <div className="flex justify-center mb-1">
                                            <span className="w-3 h-3 rounded-full bg-gray-500 inline-block"></span>
                                        </div>
                                        <span className="text-sm font-medium">Ẩn</span>
                                    </div>
                                    <div
                                        className={`border rounded-lg p-3 text-center cursor-pointer ${formData.status === 'maintenance' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-200' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        onClick={() => setFormData({ ...formData, status: 'maintenance' })}
                                    >
                                        <div className="flex justify-center mb-1">
                                            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                                        </div>
                                        <span className="text-sm font-medium">Bảo trì</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-4 border-b pb-2 border-gray-100 dark:border-gray-800">Mô tả thiết bị</h3>
                            <textarea
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[180px] resize-y dark:bg-gray-800 dark:text-white"
                                placeholder="Nhập thông tin chi tiết về thiết bị, tính năng, cách sử dụng..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                            >
                                <XCircle className="h-5 w-5 text-red-500" /> Hủy
                            </button>
                            <button
                                onClick={onSave}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                            >
                                <Save className="h-5 w-5" /> {saveButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-4 py-8 text-gray-800 dark:text-gray-100">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý thiết bị</h1>
                    <button
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setShowNewEquipmentForm(!showNewEquipmentForm);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" /> Thêm thiết bị mới
                    </button>
                </div>
                {showNewEquipmentForm && (
                    <EquipmentForm
                        formData={newEquipment}
                        setFormData={setNewEquipment}
                        onSave={handleCreateEquipment}
                        onCancel={() => setShowNewEquipmentForm(false)}
                        title="Thêm thiết bị mới"
                        saveButtonText="Lưu thiết bị"
                    />
                )}
                <Modal isOpen={isEditModalOpen} onClose={handleCancelEdit}>
                    <EquipmentForm
                        formData={editForm}
                        setFormData={setEditForm}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                        title="Chỉnh sửa thiết bị"
                        saveButtonText="Lưu thay đổi"
                    />
                </Modal>
                <div className="mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên thiết bị hoặc chủ sở hữu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 h-5 w-5" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thiết bị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Chủ sở hữu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá thuê</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tiền đặt cọc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lượng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Địa điểm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredEquipment.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                                    src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'}
                                                    alt={item.title}
                                                    onError={(e) => {
                                                        if (e.currentTarget.src !== window.location.origin + '/placeholder.png') {
                                                            e.currentTarget.src = '/placeholder.png';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {item.title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-300">
                                                    {item.category?.name || getCategoryName(item.category_id)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.owner?.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatPrice(item.price_per_day)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatPrice(item.deposit_amount || 0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={(item.quantity && parseInt(item.quantity.toString()) > 0) ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                            {(item.quantity && parseInt(item.quantity.toString())) || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'available'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : item.status === 'hidden'
                                                    ? 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                            {item.status === 'available' ? (
                                                <><span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></span>Có sẵn</>
                                            ) : item.status === 'hidden' ? (
                                                <><span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-1.5"></span>Ẩn</>
                                            ) : item.status === 'maintenance' ? (
                                                <><span className="w-1.5 h-1.5 rounded-full bg-yellow-600 mr-1.5"></span>Bảo trì</>
                                            ) : (
                                                'Không xác định'
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditEquipment(item.id)}
                                                className="p-2 text-blue-500 hover:text-white hover:bg-blue-500 rounded-md transition-colors group relative"
                                                aria-label="Chỉnh sửa thiết bị"
                                            >
                                                <Edit className="h-5 w-5" />
                                                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    Chỉnh sửa thiết bị
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEquipment(item.id)}
                                                className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-md transition-colors group relative"
                                                aria-label="Xóa thiết bị"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    Xóa thiết bị
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
