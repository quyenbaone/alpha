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

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showNewEquipmentForm, setShowNewEquipmentForm] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    totalRentals: 0,
    totalRevenue: 0,
    recentRentals: [],
    popularEquipment: []
  });
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
          setUsers(usersData);
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
          setEquipment(equipmentData);
          break;

        case 'rentals':
          const { data: rentalsData, error: rentalsError } = await supabase
            .from('rentals')
            .select(`
              *,
              equipment:equipment_id (
                title,
                price,
                image
              ),
              renter:renter_id (
                email
              )
            `)
            .order('created_at', { ascending: false });
          if (rentalsError) throw rentalsError;
          setRentals(rentalsData);
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

      const totalRevenue = rentalData?.reduce((sum, rental) => sum + (rental.total_amount || 0), 0) || 0;

      // Fetch recent rentals
      const { data: recentRentals } = await supabase
        .from('rentals')
        .select(`
          *,
          equipment:equipment_id (
            title,
            image
          ),
          renter:renter_id (
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch popular equipment
      const { data: popularEquipment } = await supabase
        .from('equipment')
        .select(`
          *,
          rentals:rentals (
            id
          )
        `)
        .order('rentals.count', { ascending: false })
        .limit(5);

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
    setEditingItem(userId);
    setEditForm({
      business_name: user.business_name,
      business_address: user.business_address,
      business_tax_number: user.business_tax_number,
      business_bank_account: user.business_bank_account
    });
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
      if (activeTab === 'users') {
        const { error } = await supabase
          .from('users')
          .update(editForm)
          .eq('id', editingItem);

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
          .eq('id', editingItem);

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
      if (!newEquipment.title || !newEquipment.price || !newEquipment.category) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const { error } = await supabase
        .from('equipment')
        .insert([{
          ...newEquipment,
          price: parseFloat(newEquipment.price),
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
      fetchData();
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error('Lỗi khi thêm thiết bị mới');
    }
  };

  const filteredData = {
    users: users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    equipment: equipment.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    rentals: rentals.filter(rental =>
      rental.equipment?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.renter?.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'equipment' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'rentals' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
          >
            Rentals
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Total Users"
              value={stats.totalUsers.toString()}
            />
            <StatCard
              icon={<Package className="w-6 h-6" />}
              title="Total Equipment"
              value={stats.totalEquipment.toString()}
            />
            <StatCard
              icon={<BarChart2 className="w-6 h-6" />}
              title="Total Rentals"
              value={stats.totalRentals.toString()}
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Total Revenue"
              value={formatPrice(stats.totalRevenue)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Rentals</h2>
              <div className="space-y-4">
                {stats.recentRentals.map((rental) => (
                  <div key={rental.id} className="flex items-center space-x-4">
                    <img
                      src={rental.equipment?.image}
                      alt={rental.equipment?.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{rental.equipment?.title}</p>
                      <p className="text-sm text-gray-600">
                        Rented by: {rental.renter?.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: {formatPrice(rental.total_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Popular Equipment</h2>
              <div className="space-y-4">
                {stats.popularEquipment.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        Rentals: {item.rentals?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Price: {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg pl-10"
          />
          <Search className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'users' ? 'bg-orange-500 text-white' : 'bg-gray-100'
            }`}
        >
          Người dùng
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'equipment' ? 'bg-orange-500 text-white' : 'bg-gray-100'
            }`}
        >
          Thiết bị
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'rentals' ? 'bg-orange-500 text-white' : 'bg-gray-100'
            }`}
        >
          Đơn thuê
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'users' && (
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
              {filteredData.users.map((user) => (
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
                          className={`p-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'text-gray-400 hover:text-purple-600'
                            }`}
                          title="Cấp quyền quản trị viên"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateUserRole(user.id, 'owner')}
                          className={`p-1 rounded-full ${user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'text-gray-400 hover:text-blue-600'
                            }`}
                          title="Cấp quyền chủ thiết bị"
                        >
                          <User className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateUserRole(user.id, 'renter')}
                          className={`p-1 rounded-full ${user.role === 'renter' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'
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
                          className="text-green-500 hover:text-green-700"
                        >
                          <Save className="h-5 w-5" />
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
        )}

        {activeTab === 'equipment' && (
          <>
            <div className="p-4 border-b">
              <button
                onClick={() => setShowNewEquipmentForm(!showNewEquipmentForm)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Plus className="h-5 w-5" />
                Thêm thiết bị mới
              </button>
            </div>

            {showNewEquipmentForm && (
              <div className="p-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên thiết bị <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newEquipment.title}
                      onChange={(e) => setNewEquipment({ ...newEquipment, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nhập giá thuê"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={newEquipment.quantity}
                      onChange={(e) => setNewEquipment({ ...newEquipment, quantity: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Thêm thiết bị
                  </button>
                </div>
              </div>
            )}

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
                          <div className="text-sm font-medium text-gray-900">
                            {editingItem === item.id ? (
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Link hình ảnh"
                              />
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="w-full mt-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Mô tả thiết bị"
                                rows={2}
                              />
                            </div>
                          )}
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
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
          </>
        )}

        {activeTab === 'rentals' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người thuê</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.rentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rental.equipment?.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(rental.equipment?.price)}/ngày
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rental.renter?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(rental.start_date).toLocaleDateString()} -{' '}
                    {new Date(rental.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      rental.status === 'approved' ? 'bg-green-100 text-green-800' :
                        rental.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rental.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateRentalStatus(rental.id, 'approved')}
                          className="text-green-500 hover:text-green-700"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateRentalStatus(rental.id, 'rejected')}
                          className="text-red-500 hover:text-red-700"
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
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-orange-50 rounded-lg">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export { AdminDashboard };
