import { Edit, Search, Shield, Trash2, User, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function AdminUsers() {
    const { user } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});

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
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Lỗi khi tải dữ liệu người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            toast.success('Đã xóa người dùng');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Lỗi khi xóa người dùng');
        }
    };

    const handleEditUser = async (userId: string) => {
        const userData = users.find(u => u.id === userId);
        setEditingItem(userId);
        setEditForm({
            business_name: userData.business_name,
            business_address: userData.business_address,
            business_tax_number: userData.business_tax_number,
            business_bank_account: userData.business_bank_account
        });
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            toast.success('Đã cập nhật quyền người dùng');
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Lỗi khi cập nhật quyền');
        }
    };

    const handleSaveEdit = async () => {
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

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email, tên doanh nghiệp..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên doanh nghiệp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingItem === user.id ? (
                                            <input
                                                type="text"
                                                value={editForm.business_name || ''}
                                                onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                                                className="border rounded px-2 py-1"
                                            />
                                        ) : (
                                            user.business_name || '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingItem === user.id ? (
                                            <input
                                                type="text"
                                                value={editForm.business_address || ''}
                                                onChange={(e) => setEditForm({ ...editForm, business_address: e.target.value })}
                                                className="border rounded px-2 py-1"
                                            />
                                        ) : (
                                            user.business_address || '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role === 'admin' ? 'Quản trị viên' :
                                                    user.role === 'owner' ? 'Chủ thiết bị' :
                                                        'Người thuê'}
                                            </span>
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
                                                    title="Cấp quyền chủ thiết bị"
                                                >
                                                    <User className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingItem === user.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="text-green-500 hover:text-green-700"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user.id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-500 hover:text-red-700"
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