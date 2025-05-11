import { Calendar, Calendar as CalendarIcon, Check, Edit, Heart, Mail, MapPin, Package, Phone, Save, Settings, Upload, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AddEquipmentModal } from '../components/AddEquipmentModal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function Profile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [myRentals, setMyRentals] = useState([]);
  const [myEquipment, setMyEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    bio: user?.bio || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    avatar_url: user?.avatar_url || ''
  });

  useEffect(() => {
    if (user) {
      fetchMyRentals();
      fetchMyEquipment();
      setUserProfile({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        bio: user.bio || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const fetchMyRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          equipment:equipment_id (
            title,
            image,
            price
          )
        `)
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRentals(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  const fetchMyEquipment = async () => {
    try {
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select(`
          *,
          rentals (
            id,
            start_date,
            end_date,
            status,
            renter:renter_id (
              email,
              full_name
            )
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (equipmentError) throw equipmentError;
      setMyEquipment(equipmentData);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (rentalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ status: newStatus })
        .eq('id', rentalId);

      if (error) throw error;
      fetchMyEquipment();

      const statusText = newStatus === 'approved' ? 'đã chấp nhận' : 'đã từ chối';
      toast.success(`Đã ${statusText} yêu cầu thuê thiết bị`);
    } catch (error) {
      console.error('Error updating rental status:', error);
      toast.error('Không thể cập nhật trạng thái thuê');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: userProfile.full_name,
          phone_number: userProfile.phone_number,
          address: userProfile.address,
          bio: userProfile.bio,
          date_of_birth: userProfile.date_of_birth,
          gender: userProfile.gender
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);

      // Cập nhật thông tin user trong store
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!fetchError && data) {
        // Giả lập cập nhật user data
        useAuthStore.setState(state => ({
          ...state,
          user: {
            ...state.user,
            ...data
          }
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật thông tin');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Bạn cần chọn một ảnh để tải lên');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`;

      // Tải tệp lên storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Lấy URL public
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatar_url = data.publicUrl;

      // Cập nhật thông tin người dùng
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Cập nhật state
      setUserProfile(prev => ({ ...prev, avatar_url }));

      // Cập nhật user trong store
      useAuthStore.setState(state => ({
        ...state,
        user: {
          ...state.user,
          avatar_url
        }
      }));

      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên:', error);
      toast.error('Không thể tải ảnh lên: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Đang tải...</div>;
  }

  const getRentalStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'approved': return 'Đã chấp nhận';
      case 'rejected': return 'Đã từ chối';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const renderProfileContent = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        <button
          onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
            } text-white`}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              Lưu thông tin
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </>
          )}
        </button>
      </div>

                                {/* <div className="mb-8 flex flex-col items-center">
                                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-3 relative overflow-hidden group">
                                    {userProfile.avatar_url ? (
                                      <>
                                        <img
                                          src={userProfile.avatar_url}
                                          alt={userProfile.full_name || user.email}
                                          className="w-full h-full object-cover rounded-full"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <label className="cursor-pointer p-2 bg-white bg-opacity-80 rounded-full">
                                            <Upload className="w-5 h-5 text-gray-800" />
                                            <input
                                              type="file"
                                              className="hidden"
                                              accept="image/*"
                                              onChange={uploadAvatar}
                                              disabled={uploading}
                                            />
                                          </label>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <User className="w-16 h-16 text-gray-400" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          <label className="cursor-pointer p-2 bg-white bg-opacity-80 rounded-full">
                                            <Upload className="w-5 h-5 text-gray-800" />
                                            <input
                                              type="file"
                                              className="hidden"
                                              accept="image/*"
                                              onChange={uploadAvatar}
                                              disabled={uploading}
                                            />
                                          </label>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <label className="flex items-center cursor-pointer text-orange-500 hover:text-orange-600">
                                    <Upload className="w-4 h-4 mr-1" />
                                    Tải ảnh đại diện lên
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={uploadAvatar}
                                      disabled={uploading}
                                    />
                                  </label>
                                  {uploading && (
                                    <p className="text-sm text-gray-500 mt-1">Đang tải lên...</p>
                                  )}
                                </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="flex items-start gap-2">
          <User className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Họ và tên</p>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={userProfile.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Nhập họ và tên"
              />
            ) : (
              <p className="text-gray-800">{userProfile.full_name || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
            <p className="text-gray-800">{user.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Số điện thoại</p>
            {isEditing ? (
              <input
                type="tel"
                name="phone_number"
                value={userProfile.phone_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Nhập số điện thoại"
              />
            ) : (
              <p className="text-gray-800">{userProfile.phone_number || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Ngày sinh</p>
            {isEditing ? (
              <input
                type="date"
                name="date_of_birth"
                value={userProfile.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            ) : (
              <p className="text-gray-800">
                {userProfile.date_of_birth ? new Date(userProfile.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Địa chỉ</p>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={userProfile.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Nhập địa chỉ"
              />
            ) : (
              <p className="text-gray-800">{userProfile.address || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Giới tính</p>
            {isEditing ? (
              <select
                name="gender"
                value={userProfile.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            ) : (
              <p className="text-gray-800">
                {userProfile.gender === 'male' ? 'Nam' :
                  userProfile.gender === 'female' ? 'Nữ' :
                    userProfile.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
              </p>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-600 mb-1">Giới thiệu</p>
          <textarea
            name="bio"
            value={userProfile.bio}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
            placeholder="Viết đôi điều về bạn"
          />
        </div>
      )}

      {!isEditing && userProfile.bio && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-600 mb-1">Giới thiệu</p>
          <p className="text-gray-800">{userProfile.bio}</p>
        </div>
      )}

      <div className="mt-8 pt-4 border-t">
        <p className="text-gray-500 text-sm">
          Thành viên từ {new Date(user.created_at).toLocaleDateString('vi-VN')}
        </p>
        <p className="text-gray-500 text-sm">
          Vai trò: {user.is_admin ? 'Quản trị viên' : user.role === 'owner' ? 'Người cho thuê' : 'Người thuê'}
        </p>
      </div>
    </div>
  );

  // Xác định nếu người dùng là người thuê
  const isRenter = !user.is_admin && user.role !== 'owner';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center relative overflow-hidden group">
            {user.avatar_url ? (
              <>
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <label className="cursor-pointer p-2 bg-white bg-opacity-80 rounded-full">
                    <Upload className="w-4 h-4 text-gray-800" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <User className="w-12 h-12 text-gray-400" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <label className="cursor-pointer p-2 bg-white bg-opacity-80 rounded-full">
                    <Upload className="w-4 h-4 text-gray-800" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">{user.full_name || 'Người thuê'}</h1>
            <p className="text-gray-600 text-sm">Thành viên từ {new Date(user.created_at).toLocaleDateString('vi-VN')}</p>
            <p className="text-gray-600 text-sm">{user.is_admin ? 'Quản trị viên' : user.role === 'owner' ? 'Người cho thuê' : 'Người thuê'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-lg shadow-sm p-1.5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'profile'
            ? 'bg-orange-500 text-white'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <User className="w-5 h-5" />
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'rentals'
            ? 'bg-orange-500 text-white'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Calendar className="w-5 h-5" />
          Thiết bị đã thuê
        </button>
        {!isRenter && (
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'equipment'
              ? 'bg-orange-500 text-white'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Package className="w-5 h-5" />
            Thiết bị cho thuê
          </button>
        )}
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'favorites'
            ? 'bg-orange-500 text-white'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Heart className="w-5 h-5" />
          Yêu thích
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'settings'
            ? 'bg-orange-500 text-white'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Settings className="w-5 h-5" />
          Cài đặt
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'profile' && renderProfileContent()}

        {activeTab === 'rentals' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Thiết bị đã thuê</h2>
            {myRentals.length === 0 ? (
              <p className="text-gray-500">Bạn chưa thuê thiết bị nào.</p>
            ) : (
              <div className="space-y-4">
                {myRentals.map((rental: any) => (
                  <div key={rental.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <img
                        src={rental.equipment.image}
                        alt={rental.equipment.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{rental.equipment.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {new Date(rental.start_date).toLocaleDateString('vi-VN')} -{' '}
                          {new Date(rental.end_date).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-sm mt-1">
                          Trạng thái: <span className={`font-medium ${rental.status === 'approved' ? 'text-green-600' :
                            rental.status === 'rejected' ? 'text-red-600' :
                              rental.status === 'completed' ? 'text-blue-600' :
                                rental.status === 'cancelled' ? 'text-gray-600' :
                                  'text-yellow-600'
                            }`}>{getRentalStatusText(rental.status)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-orange-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rental.equipment.price)}
                          <span className="text-sm text-gray-500">/ngày</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipment' && !isRenter && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Thiết bị cho thuê</h2>
              <button
                onClick={() => setShowAddEquipmentModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Thêm thiết bị mới
              </button>
            </div>
            {myEquipment.length === 0 ? (
              <p className="text-gray-500">Bạn chưa có thiết bị nào để cho thuê.</p>
            ) : (
              <div className="space-y-6">
                {myEquipment.map((item: any) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Danh mục: <span className="font-medium">{item.category}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-orange-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          <span className="text-sm text-gray-500">/ngày</span>
                        </p>
                        <button className="text-orange-500 hover:text-orange-600 text-sm mt-1">
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>

                    {/* Rental Requests */}
                    {item.rentals && item.rentals.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold mb-2">Yêu cầu thuê</h4>
                        <div className="space-y-3">
                          {item.rentals.map((rental: any) => (
                            <div key={rental.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div>
                                <p className="font-medium">{rental.renter.full_name || rental.renter.email}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(rental.start_date).toLocaleDateString('vi-VN')} -{' '}
                                  {new Date(rental.end_date).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {rental.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleStatusUpdate(rental.id, 'approved')}
                                      className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                                      title="Chấp nhận"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusUpdate(rental.id, 'rejected')}
                                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                      title="Từ chối"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <span className={`px-3 py-1 rounded-full text-sm ${rental.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  rental.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    rental.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                      rental.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                                        'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {getRentalStatusText(rental.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Thiết bị yêu thích</h2>
            <p className="text-gray-500">Chức năng đang được phát triển.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Cài đặt tài khoản</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mật khẩu
                </label>
                <button className="text-orange-500 hover:text-orange-600 flex items-center">
                  <Edit className="w-4 h-4 mr-1" />
                  Thay đổi mật khẩu
                </button>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Thông báo
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 accent-orange-500" />
                    Nhận email thông báo khi có yêu cầu thuê mới
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 accent-orange-500" />
                    Nhận email thông báo khi có cập nhật trạng thái thuê
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isRenter && (
        <AddEquipmentModal
          isOpen={showAddEquipmentModal}
          onClose={() => setShowAddEquipmentModal(false)}
          onSuccess={() => {
            fetchMyEquipment();
          }}
        />
      )}
    </div>
  );
}