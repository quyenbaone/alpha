import { Ban, Bell, Edit, Search, Shield, ShieldCheck, SlidersHorizontal, Trash2, User, X } from 'lucide-react';
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

// Filter type
interface FilterType {
    role: string[];
    activeStatus: string[];
    verifiedStatus: string[];
    bannedStatus: string[];
}

// Tooltip component
const Tooltip = ({ content, children }: { content: string, children: React.ReactNode }) => {
    const [show, setShow] = useState(false);

    return (
        <div className="relative"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={() => setShow(false)}
        >
            {children}
            {show && (
                <div className="absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    {content}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
            )}
        </div>
    );
};

// Status Badge component
const StatusBadge = ({
    active,
    icon: Icon,
    activeColor,
    inactiveColor,
    text,
    onClick,
    tooltip
}: {
    active: boolean,
    icon: React.ElementType,
    activeColor: string,
    inactiveColor: string,
    text: string,
    onClick: () => void,
    tooltip: string
}) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors
            ${active ? activeColor : inactiveColor}`}
        title={tooltip}
    >
        <Icon className={`h-3.5 w-3.5 mr-1.5 ${active ? 'opacity-100' : 'opacity-50'}`} />
        <span>{text}</span>
    </button>
);

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

    // New filter states
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [filters, setFilters] = useState<FilterType>({
        role: [],
        activeStatus: [],
        verifiedStatus: [],
        bannedStatus: []
    });
    const [tempFilters, setTempFilters] = useState<FilterType>({
        role: [],
        activeStatus: [],
        verifiedStatus: [],
        bannedStatus: []
    });

    // Selected users for batch operations
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showBatchActions, setShowBatchActions] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const usersPerPage = 10;

    useEffect(() => {
        if (user) {
            fetchUsers();
            debugTableStructure();
        }
    }, [user]);

    useEffect(() => {
        // Update pagination when filters change
        if (users.length > 0) {
            setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));
            setCurrentPage(1); // Reset to first page when filters change
        }
    }, [filters, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;
            setUsers(usersData || []);
            setTotalPages(Math.ceil((usersData?.length || 0) / usersPerPage));
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Lỗi khi tải dữ liệu người dùng');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm debug để xem cấu trúc bảng users
    const debugTableStructure = async () => {
        try {
            // Lấy thông tin cấu trúc bảng từ Supabase
            const { data, error } = await supabase.rpc('get_schema_info', {
                table_name: 'users'
            });

            if (error) {
                console.error("Không thể lấy thông tin schema:", error);
                return;
            }

            console.log("=== USERS TABLE STRUCTURE ===");
            console.log(data);

            // Cách khác để lấy thông tin
            const { data: sample, error: sampleError } = await supabase
                .from('users')
                .select('*')
                .limit(1);

            if (sampleError) {
                console.error("Lỗi khi lấy mẫu:", sampleError);
                return;
            }

            console.log("=== USERS SAMPLE DATA ===");
            console.log(sample);
            console.log("Column names:", sample && sample[0] ? Object.keys(sample[0]) : []);

        } catch (err) {
            console.error("Error in debugTableStructure:", err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Bạn có chắc chắn muốn vô hiệu hóa người dùng này? Người dùng sẽ không thể đăng nhập.')) return;

        try {
            // Thay vì cố gắng cập nhật is_active (không tồn tại), cập nhật trường verified thành false
            const { error } = await supabase
                .from('users')
                .update({ verified: false })
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
            verified: userData.verified === true,
            phone_number: userData.phone_number,
            address: userData.address
            // Các trường is_active và is_banned đã được xóa vì không tồn tại trong schema
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

    const handleToggleUserStatus = async (userId: string, fieldName: string, currentValue: boolean) => {
        try {
            // Chỉ cho phép thay đổi trường verified vì các trường khác không tồn tại
            if (fieldName !== 'verified') {
                toast.error('Không thể cập nhật trạng thái này. Chỉ có thể thay đổi trạng thái xác thực.');
                return;
            }

            const { error } = await supabase
                .from('users')
                .update({ [fieldName]: !currentValue })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`Đã cập nhật trạng thái người dùng`);
            fetchUsers();
        } catch (error) {
            console.error(`Error toggling user ${fieldName}:`, error);
            toast.error(`Lỗi khi cập nhật trạng thái người dùng`);
        }
    };

    const handleSaveEdit = async () => {
        try {
            // Đánh dấu đang lưu
            const userData = users.find(u => u.id === editingItem);

            if (!editingItem || !userData) return;

            // Chỉ bao gồm các trường có trong schema
            const validFields: Record<string, any> = {};

            // Trường role luôn tồn tại 
            if (editForm.role) {
                validFields.role = editForm.role;
            }

            // Trường verified
            if (editForm.verified !== undefined) {
                validFields.verified = editForm.verified;
            }

            // Nếu có email và email đã thay đổi
            if (editForm.email && editForm.email !== userData.email) {
                validFields.email = editForm.email;
            }

            // Chỉ cập nhật tên nếu đã thay đổi
            if (editForm.full_name && editForm.full_name !== userData.full_name) {
                validFields.full_name = editForm.full_name;
            }

            // Số điện thoại và địa chỉ
            if (editForm.phone_number && editForm.phone_number !== userData.phone_number) {
                validFields.phone_number = editForm.phone_number;
            }

            if (editForm.address && editForm.address !== userData.address) {
                validFields.address = editForm.address;
            }

            // Nếu không có gì để cập nhật
            if (Object.keys(validFields).length === 0) {
                setEditingItem(null);
                setEditForm({});
                toast.info('Không có thông tin nào được thay đổi');
                return;
            }

            // Log dữ liệu cập nhật để debug
            console.log('Updating user with data:', validFields);

            const { error } = await supabase
                .from('users')
                .update(validFields)
                .eq('id', editingItem);

            if (error) throw error;

            toast.success('Đã cập nhật thông tin người dùng');
            setEditingItem(null);
            setEditForm({});
            fetchUsers();
        } catch (error: any) {
            console.error('Error updating user:', error);
            toast.error(`Lỗi khi cập nhật thông tin: ${error.message || error}`);
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

    // Handle batch operations
    const handleBatchActivate = async () => {
        if (selectedUsers.length === 0) return;

        try {
            // Thay vì cố gắng active, chúng ta sẽ xác thực người dùng 
            // vì trường is_active không tồn tại trong schema
            for (const userId of selectedUsers) {
                await supabase
                    .from('users')
                    .update({ verified: true })
                    .eq('id', userId);
            }

            toast.success(`Đã xác thực ${selectedUsers.length} người dùng`);
            setSelectedUsers([]);
            fetchUsers();
        } catch (error) {
            console.error('Error batch verifying users:', error);
            toast.error('Lỗi khi xác thực hàng loạt');
        }
    };

    const handleBatchDeactivate = async () => {
        if (selectedUsers.length === 0) return;

        try {
            // Thay vì cố gắng deactivate, chúng ta sẽ bỏ xác thực người dùng 
            // vì trường is_active không tồn tại trong schema
            for (const userId of selectedUsers) {
                await supabase
                    .from('users')
                    .update({ verified: false })
                    .eq('id', userId);
            }

            toast.success(`Đã bỏ xác thực ${selectedUsers.length} người dùng`);
            setSelectedUsers([]);
            fetchUsers();
        } catch (error) {
            console.error('Error batch unverifying users:', error);
            toast.error('Lỗi khi bỏ xác thực hàng loạt');
        }
    };

    const handleBatchBan = async () => {
        if (selectedUsers.length === 0) return;

        try {
            // Thay vì cố gắng ban, chúng ta sẽ bỏ xác thực người dùng 
            // vì trường is_banned không tồn tại trong schema
            for (const userId of selectedUsers) {
                await supabase
                    .from('users')
                    .update({ verified: false })
                    .eq('id', userId);
            }

            toast.success(`Đã bỏ xác thực ${selectedUsers.length} người dùng`);
            setSelectedUsers([]);
            fetchUsers();
        } catch (error) {
            console.error('Error batch unverifying users:', error);
            toast.error('Lỗi khi bỏ xác thực hàng loạt');
        }
    };

    const handleBatchNotification = () => {
        if (selectedUsers.length === 0) return;

        setNotification({
            userId: 'batch',
            title: '',
            message: ''
        });
        setNotificationModal(true);
    };

    const sendBatchNotification = async () => {
        if (!notification.title || !notification.message || selectedUsers.length === 0) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo');
            return;
        }

        try {
            const notificationsToInsert = selectedUsers.map(userId => ({
                user_id: userId,
                title: notification.title,
                message: notification.message,
                read: false,
                created_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('notifications')
                .insert(notificationsToInsert);

            if (error) throw error;
            toast.success(`Đã gửi thông báo thành công tới ${selectedUsers.length} người dùng`);
            setNotificationModal(false);
            setNotification({ userId: null, title: '', message: '' });
            setSelectedUsers([]);
        } catch (error) {
            console.error('Error sending batch notifications:', error);
            toast.error('Lỗi khi gửi thông báo hàng loạt');
        }
    };

    // Toggle selection of all users on current page
    const toggleSelectAll = () => {
        if (selectedUsers.length === paginatedUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(paginatedUsers.map(user => user.id));
        }
    };

    // Toggle selection of a single user
    const toggleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    // Filter users with the enhanced filter options
    const filteredUsers = users.filter(user => {
        // Search term filter
        const matchesSearch =
            (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

        // Role filter
        const matchesRole = filters.role.length === 0 || filters.role.includes(user.role || '');

        // Active status filter - sử dụng trường verified thay thế 
        // vì trường is_active không tồn tại trong schema
        const matchesActiveStatus =
            filters.activeStatus.length === 0 ||
            (filters.activeStatus.includes('active') && user.verified === true) ||
            (filters.activeStatus.includes('inactive') && user.verified !== true);

        // Verified status filter
        const matchesVerifiedStatus =
            filters.verifiedStatus.length === 0 ||
            (filters.verifiedStatus.includes('verified') && user.verified === true) ||
            (filters.verifiedStatus.includes('unverified') && user.verified !== true);

        // Banned status filter - sử dụng trường verified thay thế
        // vì trường is_banned không tồn tại trong schema
        const matchesBannedStatus =
            filters.bannedStatus.length === 0 ||
            (filters.bannedStatus.includes('banned') && user.verified !== true) ||
            (filters.bannedStatus.includes('not_banned') && user.verified === true);

        return matchesSearch && matchesRole && matchesActiveStatus && matchesVerifiedStatus && matchesBannedStatus;
    });

    // Get users for current page
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    // Handle filter reset
    const handleResetFilters = () => {
        setTempFilters({
            role: [],
            activeStatus: [],
            verifiedStatus: [],
            bannedStatus: []
        });

        if (!filterMenuOpen) {
            // Reset filters immediately if called from badge click
            setFilters({
                role: [],
                activeStatus: [],
                verifiedStatus: [],
                bannedStatus: []
            });
        }
    };

    // Handle filter apply
    const handleApplyFilters = () => {
        setFilters({ ...tempFilters });
        setFilterMenuOpen(false);
    };

    // Toggle filter checkbox
    const toggleFilter = (type: keyof FilterType, value: string) => {
        const currentFilters = [...tempFilters[type]];
        if (currentFilters.includes(value)) {
            setTempFilters({
                ...tempFilters,
                [type]: currentFilters.filter(item => item !== value)
            });
        } else {
            setTempFilters({
                ...tempFilters,
                [type]: [...currentFilters, value]
            });
        }
    };

    // Open filter menu
    const openFilterMenu = () => {
        setTempFilters({ ...filters });
        setFilterMenuOpen(true);
    };

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

                    {/* Batch actions */}
                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Đã chọn {selectedUsers.length} người dùng</span>
                            <button
                                onClick={handleBatchActivate}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                <span>Kích hoạt</span>
                            </button>
                            <button
                                onClick={handleBatchDeactivate}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center gap-1"
                            >
                                <Ban className="h-4 w-4" />
                                <span>Bỏ kích hoạt</span>
                            </button>
                            <button
                                onClick={handleBatchBan}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center gap-1"
                            >
                                <Ban className="h-4 w-4" />
                                <span>Bỏ xác thực</span>
                            </button>
                            <button
                                onClick={handleBatchNotification}
                                className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm flex items-center gap-1"
                            >
                                <Bell className="h-4 w-4" />
                                <span>Gửi thông báo</span>
                            </button>
                            <button
                                onClick={() => setSelectedUsers([])}
                                className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Enhanced search and filter bar */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
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

                        <div className="flex gap-2">
                            <button
                                onClick={openFilterMenu}
                                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                <SlidersHorizontal size={16} />
                                <span>Bộ lọc</span>
                                {(filters.role.length > 0 || filters.activeStatus.length > 0 ||
                                    filters.verifiedStatus.length > 0 || filters.bannedStatus.length > 0) && (
                                        <span className="flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 text-xs">
                                            {filters.role.length + filters.activeStatus.length +
                                                filters.verifiedStatus.length + filters.bannedStatus.length}
                                        </span>
                                    )}
                            </button>
                        </div>
                    </div>

                    {/* Active filter badges */}
                    {(filters.role.length > 0 || filters.activeStatus.length > 0 ||
                        filters.verifiedStatus.length > 0 || filters.bannedStatus.length > 0) && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {filters.role.map(role => (
                                    <span key={role} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        {role === 'admin' ? 'Quản trị viên' :
                                            role === 'owner' ? 'Người cho thuê' : 'Người thuê'}
                                        <X
                                            size={14}
                                            className="ml-1 cursor-pointer"
                                            onClick={() => setFilters({
                                                ...filters,
                                                role: filters.role.filter(r => r !== role)
                                            })}
                                        />
                                    </span>
                                ))}
                                {filters.activeStatus.map(status => (
                                    <span key={status} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                        {status === 'active' ? 'Đã xác thực' : 'Chưa xác thực'}
                                        <X
                                            size={14}
                                            className="ml-1 cursor-pointer"
                                            onClick={() => setFilters({
                                                ...filters,
                                                activeStatus: filters.activeStatus.filter(s => s !== status)
                                            })}
                                        />
                                    </span>
                                ))}
                                {filters.verifiedStatus.map(status => (
                                    <span key={status} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                        {status === 'verified' ? 'Đã xác thực' : 'Chưa xác thực'}
                                        <X
                                            size={14}
                                            className="ml-1 cursor-pointer"
                                            onClick={() => setFilters({
                                                ...filters,
                                                verifiedStatus: filters.verifiedStatus.filter(s => s !== status)
                                            })}
                                        />
                                    </span>
                                ))}
                                {filters.bannedStatus.map(status => (
                                    <span key={status} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                        {status === 'banned' ? 'Chưa xác thực' : 'Đã xác thực'}
                                        <X
                                            size={14}
                                            className="ml-1 cursor-pointer"
                                            onClick={() => setFilters({
                                                ...filters,
                                                bannedStatus: filters.bannedStatus.filter(s => s !== status)
                                            })}
                                        />
                                    </span>
                                ))}
                                {(filters.role.length > 0 || filters.activeStatus.length > 0 ||
                                    filters.verifiedStatus.length > 0 || filters.bannedStatus.length > 0) && (
                                        <button
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    )}
                            </div>
                        )}
                </div>

                {/* Filter Modal */}
                {filterMenuOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-20 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Lọc người dùng</h3>
                                <button
                                    onClick={() => setFilterMenuOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Role Filter */}
                                <div>
                                    <h4 className="font-medium mb-2">Vai trò</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.role.includes('admin')}
                                                onChange={() => toggleFilter('role', 'admin')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Quản trị viên</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.role.includes('owner')}
                                                onChange={() => toggleFilter('role', 'owner')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Người cho thuê</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.role.includes('renter')}
                                                onChange={() => toggleFilter('role', 'renter')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Người thuê</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Active Status Filter */}
                                <div>
                                    <h4 className="font-medium mb-2">Trạng thái xác thực</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.activeStatus.includes('active')}
                                                onChange={() => toggleFilter('activeStatus', 'active')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Đã xác thực</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.activeStatus.includes('inactive')}
                                                onChange={() => toggleFilter('activeStatus', 'inactive')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Chưa xác thực</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Verified Status Filter */}
                                <div>
                                    <h4 className="font-medium mb-2">Trạng thái tài khoản</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.verifiedStatus.includes('verified')}
                                                onChange={() => toggleFilter('verifiedStatus', 'verified')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Đã xác thực email</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.verifiedStatus.includes('unverified')}
                                                onChange={() => toggleFilter('verifiedStatus', 'unverified')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Chưa xác thực email</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Banned Status Filter */}
                                <div>
                                    <h4 className="font-medium mb-2">Trạng thái hoạt động</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.bannedStatus.includes('banned')}
                                                onChange={() => toggleFilter('bannedStatus', 'banned')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Không hoạt động</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempFilters.bannedStatus.includes('not_banned')}
                                                onChange={() => toggleFilter('bannedStatus', 'not_banned')}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                            <span>Đang hoạt động</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 border rounded hover:bg-gray-50"
                                >
                                    Đặt lại
                                </button>
                                <button
                                    onClick={handleApplyFilters}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                                        onChange={toggleSelectAll}
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin người dùng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className={`${!user.is_active ? 'bg-gray-50' : ''} group hover:bg-gray-50 transition-colors`}>
                                    <td className="px-3 py-4">
                                        {/* Don't allow selecting admin users if current user is not an admin */}
                                        {(user.role !== 'admin' || user.id === user.id) && (
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                        )}
                                    </td>
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
                                                <div className="flex items-center gap-2">
                                                    <label className="text-sm">Đã xác thực</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.verified}
                                                        onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                                                        className="form-checkbox h-4 w-4 text-green-600"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url}
                                                            alt={user.full_name || 'User avatar'}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.email}</div>
                                                    <div className="text-sm text-gray-500">{user.full_name || 'Chưa cập nhật'}</div>
                                                    {user.phone_number && (
                                                        <div className="text-sm text-gray-500">{user.phone_number}</div>
                                                    )}
                                                </div>
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
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium
                                                    ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : user.role === 'owner'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'}`}
                                                >
                                                    {user.role === 'admin' && <Shield className="h-3.5 w-3.5 mr-1.5" />}
                                                    {user.role === 'owner' && <User className="h-3.5 w-3.5 mr-1.5" />}
                                                    {user.role !== 'admin' && user.role !== 'owner' && <User className="h-3.5 w-3.5 mr-1.5" />}

                                                    {user.role === 'admin' ? 'Quản trị viên' :
                                                        user.role === 'owner' ? 'Người cho thuê' : 'Người thuê'}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingItem === user.id ? (
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm">Đã xác thực</label>
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.verified}
                                                    onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                                                    className="form-checkbox h-4 w-4 text-green-600"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <StatusBadge
                                                    active={user.verified === true}
                                                    icon={ShieldCheck}
                                                    activeColor="bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                    inactiveColor="bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    text={user.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                                                    onClick={() => handleToggleUserStatus(user.id, 'verified', !user.verified)}
                                                    tooltip={user.verified ? 'Click để hủy xác thực' : 'Click để xác thực'}
                                                />
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
                                            <div className="relative flex items-center">
                                                <div className="flex gap-2 items-center">
                                                    <Tooltip content="Chỉnh sửa thông tin người dùng">
                                                        <button
                                                            onClick={() => handleEditUser(user.id)}
                                                            className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                    </Tooltip>

                                                    <Tooltip content="Gửi thông báo hệ thống">
                                                        <button
                                                            onClick={() => openNotificationModal(user.id)}
                                                            className="text-orange-500 hover:text-orange-700 p-1.5 rounded-full hover:bg-orange-50"
                                                        >
                                                            <Bell className="h-4 w-4" />
                                                        </button>
                                                    </Tooltip>

                                                    {/* Don't show delete/ban options for admin users */}
                                                    {user.role !== 'admin' ? (
                                                        <>
                                                            <Tooltip content={user.verified ? "Bỏ xác thực người dùng" : "Xác thực người dùng"}>
                                                                <button
                                                                    onClick={() => handleToggleUserStatus(user.id, 'verified', user.verified === true)}
                                                                    className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50"
                                                                >
                                                                    <Ban className="h-4 w-4" />
                                                                </button>
                                                            </Tooltip>

                                                            <Tooltip content="Vô hiệu hóa tài khoản">
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="text-red-700 hover:text-red-900 p-1.5 rounded-full hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Tooltip content="Không thể chặn quản trị viên">
                                                                <button
                                                                    disabled
                                                                    className="text-gray-300 p-1.5 rounded-full cursor-not-allowed"
                                                                >
                                                                    <Ban className="h-4 w-4" />
                                                                </button>
                                                            </Tooltip>

                                                            <Tooltip content="Không thể xóa quản trị viên">
                                                                <button
                                                                    disabled
                                                                    className="text-gray-300 p-1.5 rounded-full cursor-not-allowed"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-500">
                            Hiển thị {(currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} trong số {filteredUsers.length} người dùng
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                disabled={currentPage === 1}
                            >
                                Trước
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <span className="px-2 py-1">...</span>
                            )}
                            {totalPages > 5 && (
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {totalPages}
                                </button>
                            )}
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                disabled={currentPage === totalPages}
                            >
                                Tiếp
                            </button>
                        </div>
                    </div>
                )}

                {/* Notification Modal */}
                {notificationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {notification.userId === 'batch'
                                    ? `Gửi thông báo cho ${selectedUsers.length} người dùng`
                                    : 'Gửi thông báo hệ thống'}
                            </h2>
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
                                    onClick={notification.userId === 'batch' ? sendBatchNotification : sendNotification}
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