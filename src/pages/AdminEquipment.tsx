import { Edit, Plus, Save, Search, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export function AdminEquipment() {
    const { user } = useAuthStore();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showNewEquipmentForm, setShowNewEquipmentForm] = useState(false);
    const [newEquipment, setNewEquipment] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        image: '',
        quantity: '',
        owner_id: ''
    });

    useEffect(() => {
        if (user) {
            fetchEquipment();
        }
    }, [user]);

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const { data: equipmentData, error: equipmentError } = await supabase
                .from('equipment')
                .select(`
          *,
          owner:owner_id (
            email
          )
        `)
                .order('created_at', { ascending: false });

            if (equipmentError) throw equipmentError;
            setEquipment(equipmentData);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            toast.error('Lỗi khi tải dữ liệu thiết bị');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEquipment = async (equipmentId: string) => {
        const item = equipment.find(e => e.id === equipmentId);
        setEditingItem(equipmentId);
        setEditForm({
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
            quantity: item.quantity
        });
    };

    const handleSaveEdit = async () => {
        try {
            // Validate required fields
            if (!editForm.title || !editForm.category || !editForm.price || !editForm.quantity) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            // Convert price and quantity to numbers
            const price = parseFloat(editForm.price);
            const quantity = parseInt(editForm.quantity);

            // Validate numeric values
            if (isNaN(price) || price <= 0) {
                toast.error('Giá thuê phải là số dương');
                return;
            }

            if (isNaN(quantity) || quantity < 0) {
                toast.error('Số lượng phải là số không âm');
                return;
            }

            const { error } = await supabase
                .from('equipment')
                .update({
                    title: editForm.title,
                    description: editForm.description || '',
                    price: price,
                    category: editForm.category,
                    image: editForm.image || '',
                    quantity: quantity
                })
                .eq('id', editingItem);

            if (error) throw error;
            toast.success('Đã cập nhật thông tin thiết bị');
            setEditingItem(null);
            setEditForm({});
            fetchEquipment();
        } catch (error) {
            console.error('Error updating equipment:', error);
            toast.error('Lỗi khi cập nhật thông tin');
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditForm({});
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
            fetchEquipment();
        } catch (error) {
            console.error('Error deleting equipment:', error);
            toast.error('Lỗi khi xóa thiết bị');
        }
    };

    const handleCreateEquipment = async () => {
        try {
            // Validate required fields
            if (!newEquipment.title || !newEquipment.price || !newEquipment.category) {
                toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                return;
            }

            const { error } = await supabase
                .from('equipment')
                .insert([{
                    ...newEquipment,
                    price: parseFloat(newEquipment.price),
                    quantity: parseInt(newEquipment.quantity) || 1,
                    owner_id: user.id // Set the current admin as the owner
                }]);

            if (error) throw error;

            toast.success('Đã thêm thiết bị mới');
            setShowNewEquipmentForm(false);
            setNewEquipment({
                title: '',
                description: '',
                price: '',
                category: '',
                image: '',
                quantity: '',
                owner_id: ''
            });
            fetchEquipment();
        } catch (error) {
            console.error('Error creating equipment:', error);
            toast.error('Lỗi khi thêm thiết bị mới');
        }
    };

    const filteredEquipment = equipment.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-4 py-8">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Quản lý thiết bị</h1>
                    <button
                        onClick={() => setShowNewEquipmentForm(!showNewEquipmentForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" /> Thêm thiết bị mới
                    </button>
                </div>

                {showNewEquipmentForm && (
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-semibold mb-4">Thêm thiết bị mới</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên thiết bị <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.title}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tên thiết bị"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thể loại <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newEquipment.category}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Chọn thể loại</option>
                                    <option value="camera">Camera</option>
                                    <option value="lighting">Đèn chiếu sáng</option>
                                    <option value="audio">Thiết bị âm thanh</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá thuê/ngày <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.price}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, price: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập giá thuê"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số lượng
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.quantity}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, quantity: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập số lượng"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link hình ảnh
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.image}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, image: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập link hình ảnh"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={newEquipment.description}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập mô tả thiết bị"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setShowNewEquipmentForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateEquipment}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Thêm thiết bị
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, chủ sở hữu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg pl-10"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ sở hữu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEquipment.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-lg object-cover"
                                                    src={item.image || '/placeholder.png'}
                                                    alt={item.title}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {editingItem === item.id ? (
                                                        <input
                                                            type="text"
                                                            value={editForm.title}
                                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Tên thiết bị"
                                                        />
                                                    ) : (
                                                        item.title
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {editingItem === item.id ? (
                                                        <select
                                                            value={editForm.category}
                                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="camera">Camera</option>
                                                            <option value="lighting">Đèn chiếu sáng</option>
                                                            <option value="audio">Thiết bị âm thanh</option>
                                                            <option value="other">Khác</option>
                                                        </select>
                                                    ) : (
                                                        item.category
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.owner?.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingItem === item.id ? (
                                            <input
                                                type="number"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Giá thuê"
                                            />
                                        ) : (
                                            formatPrice(item.price)
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingItem === item.id ? (
                                            <input
                                                type="number"
                                                value={editForm.quantity}
                                                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Số lượng"
                                            />
                                        ) : (
                                            item.quantity
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingItem === item.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="p-2 text-green-500 hover:text-green-700 rounded-lg hover:bg-green-50"
                                                    title="Lưu thay đổi"
                                                >
                                                    <Save className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                                                    title="Hủy thay đổi"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditEquipment(item.id)}
                                                    className="p-2 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50"
                                                    title="Chỉnh sửa thiết bị"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEquipment(item.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                                                    title="Xóa thiết bị"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
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