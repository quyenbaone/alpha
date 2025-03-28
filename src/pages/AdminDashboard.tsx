import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { formatPrice, formatDateTime } from '../lib/utils';
import { RENTAL_STATUS } from '../lib/constants';
import {
  Users,
  Package,
  ShoppingBag,
  Settings,
  AlertCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Edit,
  Trash,
  Shield,
  UserPlus,
  Filter,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
  full_name: string | null;
  verified: boolean;
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

export function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'rentals' | 'audit'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
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
  });

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
      setAuditLogs(logsData || []);
      setStats({
        totalUsers: usersData?.length || 0,
        totalEquipment: rentalsData?.length || 0,
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

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
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
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-secondary'
          }`}
        >
          Quản lý người dùng
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'rentals'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-secondary'
          }`}
        >
          Quản lý đơn thuê
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'audit'
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
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="completed">Hoàn thành</option>
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
      </div>

      {/* Content */}
      {activeTab === 'users' && (
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_admin
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        {user.is_admin ? 'Hủy quyền admin' : 'Cấp quyền admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                  <tr key={rental.id} className="hover:bg-muted/50">
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
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rental.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : rental.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : rental.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {RENTAL_STATUS[rental.status].label}
                      </span>
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

      {activeTab === 'audit' && (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Hành động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Bảng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-muted">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(log.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {log.admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                        log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.action === 'INSERT' ? 'Thêm mới' :
                         log.action === 'UPDATE' ? 'Cập nhật' :
                         'Xóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {log.target_table}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}