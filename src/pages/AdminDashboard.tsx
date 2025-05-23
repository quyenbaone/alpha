import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { BarChart2, Check, DollarSign, Edit, Package, Plus, Save, Search, Shield, Trash2, User, Users, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define types for our data
interface UserType {
  id: string;
  email: string;
  business_name?: string;
  business_address?: string;
  business_tax_number?: string;
  business_bank_account?: string;
  role: 'admin' | 'owner' | 'renter';
}

interface EquipmentType {
  id: string;
  title: string;
  description?: string;
  price: number;
  price_per_day: number;
  category: string;
  image?: string;
  quantity: number;
  owner_id: string;
  owner?: {
    email: string;
  };
  rentals?: Array<{ id: string }>;
}

interface RentalType {
  id: string;
  equipment_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  total_price: number;
  equipment?: {
    title: string;
    price_per_day: number;
    image?: string;
  };
  renter?: {
    email: string;
  };
}

interface StatsType {
  totalUsers: number;
  totalEquipment: number;
  totalRentals: number;
  totalRevenue: number;
  recentRentals: RentalType[];
  popularEquipment: EquipmentType[];
}

interface NewEquipmentType {
  title: string;
  description: string;
  price_per_day: string;
  category: string;
  image: string;
  quantity: string;
  owner_id: string;
}

interface EditFormType {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
  quantity?: string;
  business_name?: string;
  business_address?: string;
  business_tax_number?: string;
  business_bank_account?: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [rentals, setRentals] = useState<RentalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormType>({});
  const [showNewEquipmentForm, setShowNewEquipmentForm] = useState(false);
  const [stats, setStats] = useState<StatsType>({
    totalUsers: 0,
    totalEquipment: 0,
    totalRentals: 0,
    totalRevenue: 0,
    recentRentals: [],
    popularEquipment: []
  });
  const [newEquipment, setNewEquipment] = useState<NewEquipmentType>({
    title: '',
    description: '',
    price_per_day: '',
    category: '',
    image: '',
    quantity: '',
    owner_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
      fetchStats();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
          if (usersError) throw usersError;
          setUsers(usersData || []);
          break;

        case 'equipment':
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
          setEquipment(equipmentData || []);
          break;

        case 'rentals':
          const { data: rentalsData, error: rentalsError } = await supabase
            .from('rentals')
            .select(`
              *,
              equipment:equipment_id (
                title,
                price_per_day,
                image
              ),
              renter:renter_id (
                email
              )
            `)
            .order('created_at', { ascending: false });
          if (rentalsError) throw rentalsError;
          setRentals(rentalsData || []);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch total equipment
      const { count: equipmentCount } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });

      // Fetch total rentals and revenue
      const { data: rentalData } = await supabase
        .from('rentals')
        .select('*');

      const totalRevenue = (rentalData || []).reduce((sum, rental) => sum + (rental.total_price || 0), 0);

      // Fetch recent rentals
      const { data: recentRentals } = await supabase
        .from('rentals')
        .select(`
          *,
          equipment:equipment_id (
            title,
            image,
            price_per_day
          ),
          renter:renter_id (
            email
          ),
          total_price
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch popular equipment
      const { data: popularEquipmentRaw } = await supabase
        .from('equipment')
        .select(`
          *,
          price_per_day,
          rentals:id (
            id
          )
        `)
        .limit(20); // lấy nhiều hơn để sort phía client

      // Sort phía client theo số lượt thuê giảm dần
      const typedPopularEquipment = popularEquipmentRaw as EquipmentType[] || [];
      const popularEquipment = typedPopularEquipment
        .sort((a, b) => (b.rentals?.length || 0) - (a.rentals?.length || 0))
        .slice(0, 5);

      setStats({
        totalUsers: userCount || 0,
        totalEquipment: equipmentCount || 0,
        totalRentals: rentalData?.length || 0,
        totalRevenue,
        recentRentals: recentRentals || [],
        popularEquipment: popularEquipment || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Lỗi khi tải thống kê');
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
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa người dùng');
    }
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
      fetchData();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Lỗi khi xóa thiết bị');
    }
  };

  const handleUpdateRentalStatus = async (rentalId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', rentalId);

      if (error) throw error;
      toast.success('Đã cập nhật trạng thái đơn thuê');
      fetchData();
    } catch (error) {
      console.error('Error updating rental status:', error);
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleEditUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setEditingItem(userId);
    setEditForm({
      business_name: user.business_name || '',
      business_address: user.business_address || '',
      business_tax_number: user.business_tax_number || '',
      business_bank_account: user.business_bank_account || ''
    });
  };

  const handleEditEquipment = async (equipmentId: string) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return;

    setEditingItem(equipmentId);
    setEditForm({
      title: item.title,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      quantity: item.quantity.toString()
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (activeTab === 'users') {
        const { error } = await supabase
          .from('users')
          .update({
            business_name: editForm.business_name,
            business_address: editForm.business_address,
            business_tax_number: editForm.business_tax_number,
            business_bank_account: editForm.business_bank_account
          })
          .eq('id', editingItem as string);

        if (error) throw error;
        toast.success('Đã cập nhật thông tin người dùng');
      } else if (activeTab === 'equipment') {
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
          .eq('id', editingItem as string);

        if (error) throw error;
        toast.success('Đã cập nhật thông tin thiết bị');
      }

      setEditingItem(null);
      setEditForm({});
      fetchData();
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Lỗi khi cập nhật thông tin');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Đã cập nhật quyền người dùng');
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Lỗi khi cập nhật quyền');
    }
  };

  const handleCreateEquipment = async () => {
    try {
      // Validate required fields
      if (!newEquipment.title || !newEquipment.price_per_day || !newEquipment.category) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (!user?.id) {
        toast.error('Không thể xác định người dùng');
        return;
      }

      const newEquipmentData = {
        ...newEquipment,
        price_per_day: parseFloat(newEquipment.price_per_day),
        quantity: parseInt(newEquipment.quantity || '1'),
        owner_id: user.id // Set the current admin as the owner
      };

      const { error } = await supabase
        .from('equipment')
        .insert([newEquipmentData]);

      if (error) throw error;

      toast.success('Đã thêm thiết bị mới');
      setShowNewEquipmentForm(false);
      setNewEquipment({
        title: '',
        description: '',
        price_per_day: '',
        category: '',
        image: '',
        quantity: '',
        owner_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error('Lỗi khi thêm thiết bị mới');
    }
  };

  const filteredData = {
    users: users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.business_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ),
    equipment: equipment.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.owner?.email.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ),
    rentals: rentals.filter(rental =>
      (rental.equipment?.title.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (rental.renter?.email.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

          {/* Cải tiến tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 hidden">
            <nav className="flex -mb-px space-x-8">
              {/* Tabs đã bị ẩn theo yêu cầu, nhưng vẫn giữ lại logic */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`hidden py-2 px-1 font-medium text-sm border-b-2 ${activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`hidden py-2 px-1 font-medium text-sm border-b-2 ${activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('equipment')}
                className={`hidden py-2 px-1 font-medium text-sm border-b-2 ${activeTab === 'equipment'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                Equipment
              </button>
              <button
                onClick={() => setActiveTab('rentals')}
                className={`hidden py-2 px-1 font-medium text-sm border-b-2 ${activeTab === 'rentals'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                Rentals
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Cải tiến stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Users className="w-6 h-6 text-blue-600" />}
                title="Tổng người dùng"
                value={stats.totalUsers.toString()}
              />
              <StatCard
                icon={<Package className="w-6 h-6 text-indigo-600" />}
                title="Tổng thiết bị"
                value={stats.totalEquipment.toString()}
              />
              <StatCard
                icon={<BarChart2 className="w-6 h-6 text-green-600" />}
                title="Tổng đơn thuê"
                value={stats.totalRentals.toString()}
              />
              <StatCard
                icon={<DollarSign className="w-6 h-6 text-yellow-600" />}
                title="Tổng doanh thu"
                value={formatPrice(stats.totalRevenue)}
              />
            </div>

            {/* Recent Rentals và Popular Equipment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">Đơn thuê gần đây</h2>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {stats.recentRentals.map((rental) => (
                    <div key={rental.id} className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
                      <img
                        src={rental.equipment?.image || '/placeholder.png'}
                        alt={rental.equipment?.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{rental.equipment?.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {rental.renter?.email}
                        </p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {formatPrice(rental.total_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {stats.recentRentals.length === 0 && (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">Chưa có đơn thuê nào</div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">Thiết bị phổ biến</h2>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {stats.popularEquipment.map((item) => (
                    <div key={item.id} className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Đã thuê: <span className="font-medium">{item.rentals?.length || 0}</span>
                          </p>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {formatPrice(item.price_per_day)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.popularEquipment.length === 0 && (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">Chưa có thiết bị nào</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cải tiến phần tabs nhỏ gọn trong các tabs khác */}
        {activeTab !== 'dashboard' && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-300"
              />
              <Search className="absolute left-3 top-3 text-gray-400 dark:text-gray-300" />
            </div>
          </div>
        )}

        {/* Navigation Tabs - Cải tiến phần thứ 2 */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white dark:bg-gray-800 p-3 mb-6 shadow-sm rounded-lg">
            <div className="flex space-x-1">
              {/* Đã xóa các buttons theo yêu cầu */}
            </div>
          </div>
        )}

        {/* Giữ nguyên code phần content của các tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          {activeTab === 'users' && (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên doanh nghiệp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quyền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {editingItem === user.id ? (
                        <input
                          type="text"
                          value={editForm.business_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                          className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        user.business_name || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {editingItem === user.id ? (
                        <input
                          type="text"
                          value={editForm.business_address || ''}
                          onChange={(e) => setEditForm({ ...editForm, business_address: e.target.value })}
                          className="border dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-2 py-1 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        user.business_address || '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          user.role === 'owner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {user.role === 'admin' ? 'Quản trị viên' :
                            user.role === 'owner' ? 'Chủ thiết bị' :
                              'Người thuê'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateUserRole(user.id, 'admin')}
                            className={`p-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                              }`}
                            title="Cấp quyền quản trị viên"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateUserRole(user.id, 'owner')}
                            className={`p-1 rounded-full ${user.role === 'owner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                              }`}
                            title="Cấp quyền chủ thiết bị"
                          >
                            <User className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateUserRole(user.id, 'renter')}
                            className={`p-1 rounded-full ${user.role === 'renter' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                              }`}
                            title="Cấp quyền người thuê"
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
                            className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
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
          )}

          {activeTab === 'equipment' && (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowNewEquipmentForm(!showNewEquipmentForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Thêm thiết bị mới
                </button>
              </div>

              {showNewEquipmentForm && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tên thiết bị <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newEquipment.title}
                        onChange={(e) => setNewEquipment({ ...newEquipment, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập tên thiết bị"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Thể loại <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newEquipment.category}
                        onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Chọn thể loại</option>
                        <option value="camera">Camera</option>
                        <option value="lighting">Đèn chiếu sáng</option>
                        <option value="audio">Thiết bị âm thanh</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Giá thuê/ngày <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newEquipment.price_per_day}
                        onChange={(e) => setNewEquipment({ ...newEquipment, price_per_day: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập giá thuê"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Số lượng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newEquipment.quantity}
                        onChange={(e) => setNewEquipment({ ...newEquipment, quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập số lượng"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Link hình ảnh
                      </label>
                      <input
                        type="text"
                        value={newEquipment.image}
                        onChange={(e) => setNewEquipment({ ...newEquipment, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập link hình ảnh"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        value={newEquipment.description}
                        onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nhập mô tả thiết bị"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowNewEquipmentForm(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleCreateEquipment}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Thêm thiết bị
                    </button>
                  </div>
                </div>
              )}

              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thiết bị</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Chủ sở hữu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lượng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.equipment.map((item) => (
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
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {editingItem === item.id ? (
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="Tên thiết bị"
                                />
                              ) : (
                                item.title
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {editingItem === item.id ? (
                                <select
                                  value={editForm.category}
                                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                            {editingItem === item.id && (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  value={editForm.image}
                                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="Link hình ảnh"
                                />
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="Mô tả thiết bị"
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.owner?.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Giá thuê"
                          />
                        ) : (
                          formatPrice(item.price)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                              className="p-2 text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="Lưu thay đổi"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Hủy thay đổi"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditEquipment(item.id)}
                              className="p-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Chỉnh sửa thiết bị"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
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
            </>
          )}

          {activeTab === 'rentals' && (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thiết bị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Người thuê</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.rentals.map((rental) => (
                  <tr key={rental.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {rental.equipment?.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(rental.equipment?.price_per_day)}/ngày
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {rental.renter?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(rental.start_date).toLocaleDateString()} -{' '}
                      {new Date(rental.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        rental.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          rental.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rental.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRentalStatus(rental.id, 'approved')}
                            className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateRentalStatus(rental.id, 'rejected')}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-full flex items-center">
      <div className="p-3 rounded-lg mr-4 flex-shrink-0 bg-blue-50 dark:bg-blue-900/40">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export { AdminDashboard };

