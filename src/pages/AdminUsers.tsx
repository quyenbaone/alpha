import { Ban, Bell, Check, Edit, Search, Shield, Trash2, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// User type definition
interface UserType {
    id: string;
    email?: string;
    full_name?: string;
    phone_number?: string;
    address?: string;
    avatar_url?: string;
    is_admin?: boolean;
    role?: string;
    created_at?: string;
    last_login?: string;
    bio?: string;
    date_of_birth?: string;
    gender?: string;
    verified?: boolean;
    is_active?: boolean;
    is_banned?: boolean;
}

// Edit form type
interface EditFormType {
    full_name?: string;
    email?: string;
    role?: string;
    is_active?: boolean;
    is_banned?: boolean;
    verified?: boolean;
    phone_number?: string;
    address?: string;
}

// Notification type
interface NotificationType {
    userId: string | null;
    title: string;
    message: string;
}

export function AdminUsers() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EditFormType>({});
    const [notificationModal, setNotificationModal] = useState(false);
    const [notification, setNotification] = useState<NotificationType>({
        userId: null,
        title: '',
        message: '',
    });
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;
            setUsers(usersData || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Lỗi khi tải dữ liệu người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này KHÔNG THỂ hoàn tác và sẽ xóa tất cả dữ liệu liên quan.')) return;

        try {
            // Instead of permanently deleting, consider setting is_active to false
            const { error } = await supabase
                .from('users')
                .update({ is_active: false })
                .eq('id', userId);

            if (error) throw error;
            toast.success('Đã vô hiệu hóa người dùng');
            fetchUsers();
        } catch (error) {
            console.error('Error deactivating user:', error);
            toast.error('Lỗi khi vô hiệu hóa người dùng');
        }
    };

    const handlePermanentDelete = async (userId: string) => {
        if (!confirm('CẢNH BÁO: Bạn sắp XÓA VĨNH VIỄN người dùng này. Hành động này KHÔNG THỂ hoàn tác. Tiếp tục?')) return;

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            toast.success('Đã xóa vĩnh viễn người dùng');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user permanently:', error);
            toast.error('Lỗi khi xóa vĩnh viễn người dùng');
        }
    };

    const handleEditUser = (userId: string) => {
        const userData = users.find(u => u.id === userId);
        if (!userData) return;

        setEditingItem(userId);
        setEditForm({
            full_name: userData.full_name,
            email: userData.email,
            role: userData.role,
            is_active: userData.is_active !== false, // Default to true if undefined
            is_banned: userData.is_banned === true,
            verified: userData.verified === true,
            phone_number: userData.phone_number,
            address: userData.address
        });
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`Đã cấp quyền ${newRole === 'owner' ? 'người cho thuê' : newRole} cho người dùng`);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Lỗi khi cập nhật quyền');
        }
    };

    const handleToggleUserStatus = async (userId: string, field: string, value: boolean) => {
        try {
            const updateData: Record<string, boolean> = {};
            updateData[field] = value;

            const { error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId);

            if (error) throw error;

            const statusMessages: Record<string, string> = {
                is_active: value ? 'Đã kích hoạt' : 'Đã vô hiệu hóa',
                is_banned: value ? 'Đã cấm' : 'Đã bỏ cấm',
                verified: value ? 'Đã xác thực' : 'Đã hủy xác thực'
            };

            toast.success(`${statusMessages[field]} người dùng`);
            fetchUsers();
        } catch (error) {
            console.error(`Error toggling ${field}:`, error);
            toast.error(`Lỗi khi cập nhật trạng thái ${field}`);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;

        try {
            const { error } = await supabase
                .from('users')
                .update(editForm)
                .eq('id', editingItem);

            if (error) throw error;
            toast.success('Đã cập nhật thông tin người dùng');
            setEditingItem(null);
            setEditForm({});
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Lỗi khi cập nhật thông tin');
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditForm({});
    };

    const openNotificationModal = (userId: string) => {
        setNotification({
            userId,
            title: '',
            message: ''
        });
        setNotificationModal(true);
    };

    const sendNotification = async () => {
        if (!notification.title || !notification.message || !notification.userId) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo');
            return;
        }

        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: notification.userId,
                    title: notification.title,
                    message: notification.message,
                    read: false,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success('Đã gửi thông báo thành công');
            setNotificationModal(false);
            setNotification({ userId: null, title: '', message: '' });
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Lỗi khi gửi thông báo');
        }
    };

    // Filter users by search term and role
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

        if (roleFilter === 'all') return matchesSearch;
        return matchesSearch && user.role === roleFilter;
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email, tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg pl-10"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>
                    <select
                        className="px-4 py-2 border rounded-lg"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="owner">Người cho thuê</option>
                        <option value="renter">Người thuê</option>
                    </select>
                </div>

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin người dùng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className={!user.is_active ? 'bg-gray-100' : ''}>
                                    <td className="px-6 py-4">
                                        {editingItem === user.id ? (
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="block text-xs text-gray-500">Email</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.email || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="border rounded px-2 py-1 w-full"
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500">Họ tên</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.full_name || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500">Số điện thoại</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.phone_number || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500">Địa chỉ</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.address || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="font-medium">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.full_name || 'Chưa cập nhật'}</div>
                                                {user.phone_number && (
                                                    <div className="text-sm text-gray-500">{user.phone_number}</div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingItem === user.id ? (
                                            <select
                                                value={editForm.role || 'renter'}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                className="border rounded px-2 py-1"
                                            >
                                                <option value="admin">Quản trị viên</option>
                                                <option value="owner">Người cho thuê</option>
                                                <option value="renter">Người thuê</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs 
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'}`}
                                                >
                                                    {user.role === 'admin' ? 'Quản trị viên' :
                                                        user.role === 'owner' ? 'Người cho thuê' : 'Người thuê'}
                                                </span>
                                                {!editingItem && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleUpdateUserRole(user.id, 'admin')}
                                                            className={`p-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'text-gray-400 hover:text-purple-600'}`}
                                                            title="Cấp quyền quản trị viên"
                                                        >
                                                            <Shield className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateUserRole(user.id, 'owner')}
                                                            className={`p-1 rounded-full ${user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'text-gray-400 hover:text-blue-600'}`}
                                                            title="Cấp quyền người cho thuê"
                                                        >
                                                            <User className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingItem === user.id ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm">Kích hoạt</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.is_active}
                                                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                                        className="form-checkbox h-4 w-4 text-blue-600"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm">Đã xác thực</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.verified}
                                                        onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                                                        className="form-checkbox h-4 w-4 text-green-600"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm">Bị cấm</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.is_banned}
                                                        onChange={(e) => setEditForm({ ...editForm, is_banned: e.target.checked })}
                                                        className="form-checkbox h-4 w-4 text-red-600"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${user.is_active !== false ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                    <span className="text-sm">{user.is_active !== false ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}</span>
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user.id, 'is_active', user.is_active === false)}
                                                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                                                        title={user.is_active !== false ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
                                                    >
                                                        {user.is_active !== false ? <X size={14} /> : <Check size={14} />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${user.verified ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                                                    <span className="text-sm">{user.verified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user.id, 'verified', !user.verified)}
                                                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                                                        title={user.verified ? 'Hủy xác thực' : 'Xác thực'}
                                                    >
                                                        {user.verified ? <X size={14} /> : <Check size={14} />}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${user.is_banned ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                                                    <span className="text-sm">{user.is_banned ? 'Đã bị cấm' : 'Không bị cấm'}</span>
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user.id, 'is_banned', !user.is_banned)}
                                                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                                                        title={user.is_banned ? 'Bỏ cấm' : 'Cấm'}
                                                    >
                                                        {user.is_banned ? <X size={14} /> : <Ban size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingItem === user.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                                                >
                                                    Lưu
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-xs"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user.id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Chỉnh sửa thông tin"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => openNotificationModal(user.id)}
                                                    className="text-orange-500 hover:text-orange-700"
                                                    title="Gửi thông báo"
                                                >
                                                    <Bell className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Vô hiệu hóa người dùng"
                                                >
                                                    <Ban className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDelete(user.id)}
                                                    className="text-red-700 hover:text-red-900"
                                                    title="Xóa vĩnh viễn (cẩn thận)"
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

                {/* Notification Modal */}
                {notificationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Gửi thông báo hệ thống</h2>
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={notification.title}
                                        onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                                    <textarea
                                        className="w-full px-3 py-2 border rounded-md"
                                        rows={4}
                                        value={notification.message}
                                        onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    onClick={() => setNotificationModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onClick={sendNotification}
                                >
                                    Gửi thông báo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 