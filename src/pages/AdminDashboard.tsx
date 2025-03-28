import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Trash,
  Users,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RENTAL_STATUS } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { formatDateTime, formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
  full_name: string | null;
  verified: boolean;
  is_banned?: boolean;
}

interface Rental {
  id: string;
  equipment: {
    title: string;
    price: number;
  };
  renter: {
    email: string;
  };
  start_date: string;
  end_date: string;
  status: keyof typeof RENTAL_STATUS;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  totalEquipment: number;
  totalRentals: number;
  revenue: number;
  activeUsers: number;
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string;
  target_id: string;
  details: any;
  created_at: string;
  admin: {
    email: string;
  };
}

interface Equipment {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
  owner_id: string;
  created_at: string;
  owner?: {
    email: string;
  };
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'rentals' | 'equipment' | 'audit'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEquipment: 0,
    totalRentals: 0,
    revenue: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '7days',
    category: 'all',
  });
  const [deleting, setDeleting] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [lastUpdatedRental, setLastUpdatedRental] = useState<string | null>(null);

  // Reset lastUpdatedRental after 2 seconds
  useEffect(() => {
    if (lastUpdatedRental) {
      const timer = setTimeout(() => {
        setLastUpdatedRental(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdatedRental]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const closeDropdowns = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-wrapper')) {
        document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => {
          el.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [isAdmin, navigate, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch rentals with equipment and renter details
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select(`
          *,
          equipment:equipment_id (
            title,
            price
          ),
          renter:renter_id (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (rentalsError) throw rentalsError;

      // Fetch equipment with owner details
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

      // Fetch audit logs
      const { data: logsData, error: logsError } = await supabase
        .from('admin_audit_logs')
        .select(`
          *,
          admin:admin_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Calculate statistics
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeUsers = usersData?.filter(user =>
        user.last_login && new Date(user.last_login) > sevenDaysAgo
      ).length || 0;

      const revenue = rentalsData
        ?.filter(rental => rental.status === 'completed')
        .reduce((acc, rental) => acc + (rental.equipment?.price || 0), 0) || 0;

      setUsers(usersData || []);
      setRentals(rentalsData || []);
      setEquipment(equipmentData || []);
      setAuditLogs(logsData || []);
      setStats({
        totalUsers: usersData?.length || 0,
        totalEquipment: equipmentData?.length || 0,
        totalRentals: rentalsData?.filter(r => r.status === 'completed').length || 0,
        revenue,
        activeUsers,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating user admin status:', error);
      setError('Không thể cập nhật quyền admin cho người dùng.');
    }
  };

  const toggleUserBan = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_banned: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      fetchDashboardData();
      toast.success(currentStatus ? 'Người dùng đã được mở khóa' : 'Người dùng đã bị khóa');
    } catch (error) {
      console.error('Error updating user ban status:', error);
      setError('Không thể cập nhật trạng thái khóa người dùng.');
      toast.error('Đã xảy ra lỗi khi cập nhật');
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!editingUser) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', editingUser.id);

      if (error) throw error;

      // Refresh the data
      fetchDashboardData();
      setEditingUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ).sort((a: any, b: any) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const filteredRentals = rentals
    .filter(rental => {
      if (filters.status !== 'all' && rental.status !== filters.status) {
        return false;
      }

      const rentalDate = new Date(rental.created_at);
      const now = new Date();
      const daysAgo = (now.getTime() - rentalDate.getTime()) / (1000 * 60 * 60 * 24);

      if (filters.dateRange === '7days' && daysAgo > 7) {
        return false;
      } else if (filters.dateRange === '30days' && daysAgo > 30) {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredEquipment = equipment
    .filter(item => {
      // Filter by search term
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'price') {
        return sortConfig.direction === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      }

      if (sortConfig.direction === 'asc') {
        return a[sortConfig.key as keyof Equipment] > b[sortConfig.key as keyof Equipment] ? 1 : -1;
      }
      return a[sortConfig.key as keyof Equipment] < b[sortConfig.key as keyof Equipment] ? 1 : -1;
    });

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="h-4 w-4" /> :
      <ChevronDown className="h-4 w-4" />;
  };

  const deleteEquipment = async (equipmentId: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;

      // Update the UI by removing the deleted item
      setEquipment((prev) => prev.filter((item) => item.id !== equipmentId));
      toast.success('Equipment deleted successfully');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Failed to delete equipment');
    } finally {
      setDeleting(false);
    }
  };

  const updateEquipment = async (updatedData: Partial<Equipment>) => {
    if (!editingEquipment) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('equipment')
        .update(updatedData)
        .eq('id', editingEquipment.id);

      if (error) throw error;

      // Refresh the data
      fetchDashboardData();
      setEditingEquipment(null);
      toast.success('Equipment updated successfully');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    } finally {
      setLoading(false);
    }
  };

  const updateRentalStatus = async (rentalId: string, newStatus: string) => {
    try {
      setLoading(true);

      // Cập nhật UI ngay lập tức
      setRentals(current =>
        current.map(rental =>
          rental.id === rentalId
            ? { ...rental, status: newStatus as keyof typeof RENTAL_STATUS }
            : rental
        )
      );

      // Đánh dấu đơn hàng vừa cập nhật
      setLastUpdatedRental(rentalId);

      // Gửi cập nhật lên server
      const { error } = await supabase
        .from('rentals')
        .update({ status: newStatus })
        .eq('id', rentalId);

      if (error) {
        // Nếu lỗi, quay lại trạng thái cũ
        throw error;
      }

      toast.success(`Cập nhật trạng thái thành ${RENTAL_STATUS[newStatus as keyof typeof RENTAL_STATUS].label}`);

      // Làm mới dữ liệu sau khi cập nhật
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating rental status:', error);
      toast.error('Không thể cập nhật trạng thái đơn hàng');
      setError('Không thể cập nhật trạng thái cho đơn thuê.');

      // Làm mới dữ liệu để quay lại trạng thái ban đầu nếu có lỗi
      fetchDashboardData();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Quản trị hệ thống</h1>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:text-destructive/80"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Tổng người dùng</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Người dùng hoạt động</p>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Tổng thiết bị</p>
              <p className="text-2xl font-bold">{stats.totalEquipment}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Tổng đơn thuê</p>
              <p className="text-2xl font-bold">{stats.totalRentals}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Doanh thu</p>
              <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'users'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground hover:bg-secondary'
            }`}
        >
          Quản lý người dùng
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'equipment'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground hover:bg-secondary'
            }`}
        >
          Quản lý thiết bị
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'rentals'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground hover:bg-secondary'
            }`}
        >
          Quản lý đơn thuê
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'audit'
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground hover:bg-secondary'
            }`}
        >
          Nhật ký hoạt động
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {activeTab === 'rentals' && (
          <div className="flex gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="approved">Đã xác nhận</option>
              <option value="delivering">Đang giao hàng</option>
              <option value="in_use">Đang sử dụng</option>
              <option value="completed">Hoàn tất</option>
              <option value="cancelled">Đã hủy</option>
              <option value="returning">Đang đổi/trả</option>
              <option value="refunded">Hoàn tiền thành công</option>
              <option value="rejected">Từ chối</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="all">Tất cả thời gian</option>
            </select>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="flex gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Photography">Thiết bị chụp ảnh</option>
              <option value="Audio Equipment">Thiết bị âm thanh</option>
              <option value="Camping Gear">Dụng cụ cắm trại</option>
              <option value="SUP Equipment">SUP</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <>
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        <SortIcon columnKey="email" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Ngày tạo
                        <SortIcon columnKey="created_at" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('last_login')}
                    >
                      <div className="flex items-center gap-2">
                        Lần đăng nhập cuối
                        <SortIcon columnKey="last_login" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('is_admin')}
                    >
                      <div className="flex items-center gap-2">
                        Quyền Admin
                        <SortIcon columnKey="is_admin" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('is_banned')}
                    >
                      <div className="flex items-center gap-2">
                        Trạng thái
                        <SortIcon columnKey="is_banned" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-muted">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {user.last_login
                            ? formatDateTime(user.last_login)
                            : 'Chưa đăng nhập'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_banned
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {user.is_banned ? 'Bị khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {user.is_admin ? 'Hủy quyền admin' : 'Cấp quyền admin'}
                          </button>
                          <button
                            onClick={() => toggleUserBan(user.id, user.is_banned || false)}
                            className={`${user.is_banned ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'} transition-colors`}
                          >
                            {user.is_banned ? 'Mở khóa' : 'Khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                  onClick={() => setEditingUser(null)}
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6">Chỉnh sửa người dùng</h2>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const full_name = (form.elements.namedItem('full_name') as HTMLInputElement).value;
                  const is_admin = (form.elements.namedItem('is_admin') as HTMLInputElement).checked;
                  const is_banned = (form.elements.namedItem('is_banned') as HTMLInputElement).checked;

                  updateUser({
                    full_name,
                    is_admin,
                    is_banned
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      name="full_name"
                      type="text"
                      defaultValue={editingUser.full_name || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_admin"
                      name="is_admin"
                      type="checkbox"
                      defaultChecked={editingUser.is_admin}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-700">
                      Quyền Admin
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_banned"
                      name="is_banned"
                      type="checkbox"
                      defaultChecked={editingUser.is_banned}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_banned" className="ml-2 block text-sm text-gray-700">
                      Khóa tài khoản
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'rentals' && (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Người thuê
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Thời gian thuê
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Giá thuê
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-muted">
                {filteredRentals.map((rental) => (
                  <tr
                    key={rental.id}
                    data-id={rental.id}
                    className={`hover:bg-muted/50 ${lastUpdatedRental === rental.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 shadow-lg transition-all duration-300 transform scale-[1.02]'
                      : 'transition-all duration-300'
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {rental.equipment.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {rental.renter.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(rental.start_date)} -{' '}
                        {formatDateTime(rental.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="dropdown-wrapper relative">
                        <button
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-300 ease-in-out ${rental.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            rental.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              rental.status === 'completed' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' :
                                rental.status === 'delivering' ? 'bg-violet-100 text-violet-800 border border-violet-300' :
                                  rental.status === 'in_use' ? 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300' :
                                    rental.status === 'cancelled' ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                                      rental.status === 'returning' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                        rental.status === 'refunded' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                                          'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            } ${lastUpdatedRental === rental.id ? 'shadow-md transform scale-110' : ''} hover:opacity-80 w-full cursor-pointer flex items-center justify-between`}
                          onClick={(e) => {
                            e.currentTarget.nextElementSibling?.classList.toggle('hidden');
                            e.stopPropagation();
                          }}
                        >
                          <span className="relative">
                            {RENTAL_STATUS[rental.status].label}
                            {lastUpdatedRental === rental.id && (
                              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-current opacity-70 animate-pulse"></span>
                            )}
                          </span>
                          <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                        </button>

                        <div className="absolute z-10 mt-1 hidden bg-white shadow-lg rounded-md border border-gray-200 py-1 w-48">
                          {rental.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  updateRentalStatus(rental.id, 'approved');
                                  document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 text-emerald-800 flex items-center"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Xác nhận
                              </button>
                              <button
                                onClick={() => {
                                  updateRentalStatus(rental.id, 'rejected');
                                  document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-rose-50 text-rose-800 flex items-center"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Từ chối
                              </button>
                            </>
                          )}

                          {rental.status === 'approved' && (
                            <button
                              onClick={() => {
                                updateRentalStatus(rental.id, 'delivering');
                                document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-violet-50 text-violet-800 flex items-center"
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Giao hàng
                            </button>
                          )}

                          {rental.status === 'delivering' && (
                            <button
                              onClick={() => {
                                updateRentalStatus(rental.id, 'in_use');
                                document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-fuchsia-50 text-fuchsia-800 flex items-center"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Đã nhận
                            </button>
                          )}

                          {rental.status === 'in_use' && (
                            <>
                              <button
                                onClick={() => {
                                  updateRentalStatus(rental.id, 'returning');
                                  document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 text-amber-800 flex items-center"
                              >
                                <span className="ml-1 mr-2 text-xs">↩️</span>
                                Đổi/Trả
                              </button>
                              <button
                                onClick={() => {
                                  updateRentalStatus(rental.id, 'completed');
                                  document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-cyan-50 text-cyan-800 flex items-center"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Hoàn tất
                              </button>
                            </>
                          )}

                          {rental.status === 'returning' && (
                            <>
                              <button
                                onClick={() => {
                                  updateRentalStatus(rental.id, 'completed');
                                  document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-cyan-50 text-cyan-800 flex items-center"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Hoàn tất
                              </button>
                              <button
                                onClick={() => {
                                  updateRentalStatus(rental.id, 'refunded');
                                  document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 text-teal-800 flex items-center"
                              >
                                <span className="ml-1 mr-2 text-xs">💰</span>
                                Hoàn tiền
                              </button>
                            </>
                          )}

                          {(rental.status === 'rejected' || rental.status === 'cancelled') && (
                            <button
                              onClick={() => {
                                updateRentalStatus(rental.id, 'pending');
                                document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-50 text-yellow-800 flex items-center"
                            >
                              <span className="ml-1 mr-2 text-xs">🔄</span>
                              Xem xét lại
                            </button>
                          )}

                          {['pending', 'approved', 'delivering', 'in_use'].includes(rental.status) && (
                            <button
                              onClick={() => {
                                updateRentalStatus(rental.id, 'cancelled');
                                document.querySelectorAll('.dropdown-wrapper .absolute').forEach(el => el.classList.add('hidden'));
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-800 flex items-center"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Hủy
                            </button>
                          )}

                          {(rental.status === 'completed' || rental.status === 'refunded') && (
                            <div className="w-full text-left px-4 py-2 text-sm text-gray-400 italic">
                              Không có thao tác
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">
                        {formatPrice(rental.equipment.price)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <>
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Tên thiết bị
                        <SortIcon columnKey="title" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-2">
                        Mô tả
                        <SortIcon columnKey="description" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-2">
                        Danh mục
                        <SortIcon columnKey="category" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-2">
                        Giá thuê (VND/ngày)
                        <SortIcon columnKey="price" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-muted">
                  {filteredEquipment.map((equipment) => (
                    <tr key={equipment.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{equipment.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {equipment.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">
                          {equipment.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {formatPrice(equipment.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setEditingEquipment(equipment)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteEquipment(equipment.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Equipment Modal */}
          {editingEquipment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                  onClick={() => setEditingEquipment(null)}
                  className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6">Chỉnh sửa thiết bị</h2>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                  const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
                  const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
                  const price = parseInt((form.elements.namedItem('price') as HTMLInputElement).value);

                  updateEquipment({
                    title,
                    description,
                    category,
                    price
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên thiết bị
                    </label>
                    <input
                      name="title"
                      type="text"
                      defaultValue={editingEquipment.title}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingEquipment.description}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      name="category"
                      defaultValue={editingEquipment.category}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="Photography">Thiết bị chụp ảnh</option>
                      <option value="Audio Equipment">Thiết bị âm thanh</option>
                      <option value="Camping Gear">Dụng cụ cắm trại</option>
                      <option value="SUP Equipment">SUP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá thuê (VND/ngày)
                    </label>
                    <input
                      name="price"
                      type="number"
                      defaultValue={editingEquipment.price}
                      min="1000"
                      step="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingEquipment(null)}
                      className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}