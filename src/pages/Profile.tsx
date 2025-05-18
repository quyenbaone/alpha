// @ts-nocheck
import { Calendar, Calendar as CalendarIcon, Check, Edit, Heart, Mail, MapPin, Package, Phone, Plus, Save, Settings, Upload, User, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AddEquipmentModal } from '../components/AddEquipmentModal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// Type definition for preferences
interface UserPreferences {
  notify_new_rentals: boolean;
  notify_rental_updates: boolean;
  theme: string;
}

// Type definition for user profile data
interface UserProfile {
  full_name: string;
  phone_number: string;
  address: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  avatar_url: string;
}

// Type definition for rental with equipment details
interface Rental {
  id: string;
  created_at: string;
  equipment_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  equipment?: {
    id: string;
    title: string;
    description: string;
    price_per_day: number;
    status: string;
    owner_id: string;
    category_id: string;
    images: string[];
    image?: string;
  } | null;
}

export function Profile() {
  const { user, setUser } = useAuthStore();

  // Move isRenter declaration to the top of the component
  const isRenter = user ? (!user.is_admin && user.role !== 'owner') : false;

  const [activeTab, setActiveTab] = useState('profile');
  const [myRentals, setMyRentals] = useState<Rental[]>([]);
  const [myEquipment, setMyEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    notify_new_rentals: false,
    notify_rental_updates: false,
    theme: 'light'
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    bio: user?.bio || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    avatar_url: user?.avatar_url || ''
  });

  // Use a ref to track when we need to show toasts
  const showMissingTableToastRef = useRef(false);

  // Ref to track toast notifications
  const toastMessagesRef = useRef<{ type: 'error' | 'success' | 'info' | 'warning', message: string, id?: string, duration?: number }[]>([]);

  // Add a location-aware effect to refresh rentals when coming from cart checkout
  const location = window.location;

  // Debug effect - moved up from after renderProfileContent
  useEffect(() => {
    if (user) {
      console.log('User role:', user.role);
      console.log('Is admin:', user.is_admin);
      console.log('IsRenter:', isRenter);
    }
  }, [user, isRenter]);

  // Create a separate useEffect for rentals refresh
  useEffect(() => {
    // Always refresh rentals when on the rentals tab
    if (user && activeTab === 'rentals') {
      console.log('Refreshing rentals data for tab view');
      fetchMyRentals();
    }
  }, [user, activeTab]);

  // Create a separate function to handle navigation from checkout
  const refreshRentalsAfterCheckout = useCallback(() => {
    if (user) {
      console.log('Force refreshing rentals after checkout');
      fetchMyRentals().then(data => {
        if (data?.length) {
          // Display success message
          toastMessagesRef.current.push({
            type: 'success',
            message: 'Đơn hàng của bạn đã được cập nhật thành công',
            id: 'rentals-updated'
          });
        }
      });
    }
  }, [user]);

  // Add effect to check for navigation from cart
  useEffect(() => {
    // Check if we're coming from the cart page
    const urlParams = new URLSearchParams(window.location.search);
    const fromCheckout = urlParams.get('fromCheckout') === 'true';

    if (fromCheckout) {
      refreshRentalsAfterCheckout();
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshRentalsAfterCheckout, window.location.search]);

  // Declare fetchUserPreferences before it's used in useEffect
  const fetchUserPreferences = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available, cannot fetch preferences');
      return;
    }

    // Always set default preferences first (fallback)
    const defaultPrefs: UserPreferences = {
      notify_new_rentals: false,
      notify_rental_updates: false,
      theme: 'light'
    };
    setUserPreferences(defaultPrefs);

    try {
      // Check if user_preferences table exists by trying a simple fetch
      const { error: checkError } = await supabase
        .from('user_preferences')
        .select('count')
        .limit(1)
        .single();

      // If error checking table existence, user preferences will use default values
      if (checkError) {
        if (checkError.code === '42P01') {
          console.log('user_preferences table missing - you may need to run the SQL migration script');
          // Mark that we need to show the toast in useEffect
          showMissingTableToastRef.current = true;
          return; // Just use the defaults we already set
        }
        console.error('Error checking user_preferences table:', checkError);
        return;
      }

      // Table exists, try to fetch this user's preferences
      const { data: userPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id as any)
        .maybeSingle();

      if (prefsError) {
        console.error('Error fetching user preferences:', prefsError);
        return;
      }

      // If we found preferences, use them
      if (userPrefs) {
        const prefs = userPrefs as any;
        setUserPreferences({
          notify_new_rentals: Boolean(prefs.notify_new_rentals),
          notify_rental_updates: Boolean(prefs.notify_rental_updates),
          theme: prefs.theme || 'light'
        });
      } else {
        // No preferences found, try to create default ones
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            notify_new_rentals: defaultPrefs.notify_new_rentals,
            notify_rental_updates: defaultPrefs.notify_rental_updates,
            theme: defaultPrefs.theme
          } as any);

        if (insertError) {
          console.error('Error creating default preferences:', insertError);
        }
      }
    } catch (err) {
      console.error('Exception in fetchUserPreferences:', err);
      // Default preferences are already set
    }
  }, [user]);

  // Show toast for missing table in a useEffect to avoid setState during render
  useEffect(() => {
    if (showMissingTableToastRef.current) {
      const timeoutId = setTimeout(() => {
        // Add toast message to ref instead of calling directly
        toastMessagesRef.current.push({
          type: 'info',
          message: 'Tùy chọn người dùng chỉ được lưu trong phiên này',
          id: 'no-prefs-table',
          duration: 4000
        });
        showMissingTableToastRef.current = false;
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [loading]); // Run when loading changes

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchMyRentals(),
        fetchMyEquipment(),
        fetchUserPreferences()
      ]).finally(() => {
        setLoading(false);
      });

      setUserProfile({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        bio: user.bio || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        avatar_url: user.avatar_url || ''
      });
    } else {
      // If no user, still set loading to false to avoid infinite loading
      setLoading(false);
    }
  }, [user, fetchUserPreferences]);

  // Check if user is logged in
  useEffect(() => {
    // If no user after a short delay, show login required message
    const timer = setTimeout(() => {
      if (!user && !loading) {
        // Add toast message to ref instead of calling directly
        toastMessagesRef.current.push({
          type: 'error',
          message: 'Vui lòng đăng nhập để xem trang này',
          duration: 3000
        });
        // Redirect to login page after showing toast
        window.location.href = '/signin';
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, loading]);

  // Show toast messages from ref in a useEffect to avoid setState during render
  useEffect(() => {
    if (toastMessagesRef.current.length > 0) {
      const timeoutId = setTimeout(() => {
        toastMessagesRef.current.forEach(({ type, message, id, duration }) => {
          const options = id || duration ? { id, duration } : undefined;
          if (type === 'error') toast.error(message, options);
          else if (type === 'success') toast.success(message, options);
          else if (type === 'info') toast.info(message, options);
          else if (type === 'warning') toast.warning(message, options);
        });
        toastMessagesRef.current = []; // Clear processed messages
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [userProfile, myRentals, myEquipment, isEditing, loading]); // Add dependencies that might trigger toast messages

  const fetchMyRentals = async () => {
    try {
      if (!user) {
        console.error('No user found');
        return [];
      }

      // Thêm logging chi tiết
      console.log('Fetching rentals for user ID:', user.id);

      // Thử đơn giản hóa truy vấn để tránh các lỗi phức tạp
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .eq('renter_id', user.id as any)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rentals:', error);
        toastMessagesRef.current.push({
          type: 'error',
          message: 'Không thể tải danh sách thiết bị đã thuê'
        });
        return [];
      }

      console.log('Fetched basic rentals:', data?.length || 0, 'items');

      // Nếu lấy được danh sách cơ bản, tiếp tục lấy thông tin chi tiết
      if (data && data.length > 0) {
        // Tạo mảng các ID thiết bị để truy vấn riêng
        const typedData = data as any[];
        const equipmentIds = typedData.map(rental => rental.equipment_id);

        // Lấy thông tin thiết bị
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, title, images, price_per_day, category_id, status')
          .in('id', equipmentIds);

        if (equipmentError) {
          console.error('Error fetching equipment details:', equipmentError);
        }

        // Tạo lookup map cho thiết bị
        const equipmentMap: Record<string, any> = {};
        if (equipmentData) {
          const typedEquipment = equipmentData as any[];
          typedEquipment.forEach(item => {
            equipmentMap[item.id] = item;
          });
        }

        // Kết hợp dữ liệu
        const combinedData = typedData.map(rental => ({
          id: rental.id,
          created_at: rental.created_at,
          equipment_id: rental.equipment_id,
          renter_id: rental.renter_id,
          start_date: rental.start_date,
          end_date: rental.end_date,
          status: rental.status,
          total_amount: rental.total_amount,
          equipment: equipmentMap[rental.equipment_id] || null
        })) as Rental[];

        console.log('Combined rental data with equipment details');
        setMyRentals(combinedData);
        return combinedData;
      }

      setMyRentals(data ? (data as any[]).map(item => ({ ...item, equipment: null })) as Rental[] : []);
      return data;
    } catch (error) {
      console.error('Error in fetchMyRentals:', error);
      toastMessagesRef.current.push({
        type: 'error',
        message: 'Đã xảy ra lỗi khi tải danh sách thiết bị đã thuê'
      });
      return [];
    }
  };

  const fetchMyEquipment = async () => {
    try {
      if (!user) {
        console.error('No user found');
        return [];
      }

      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select(`
          *,
          category:category_id (*),
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

      if (equipmentError) {
        console.error('Error fetching equipment:', equipmentError);
        return [];
      }

      setMyEquipment(equipmentData || []);
      return equipmentData;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
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
      // Add toast message to ref instead of calling directly
      toastMessagesRef.current.push({
        type: 'success',
        message: `Đã ${statusText} yêu cầu thuê thiết bị`
      });
    } catch (error) {
      console.error('Error updating rental status:', error);
      // Add toast message to ref instead of calling directly
      toastMessagesRef.current.push({
        type: 'error',
        message: 'Không thể cập nhật trạng thái thuê'
      });
    }
  };

  const handleProfileUpdate = async () => {
    try {
      if (!user) {
        // Add toast message to ref instead of calling directly
        toastMessagesRef.current.push({
          type: 'error',
          message: 'Không thể cập nhật khi chưa đăng nhập'
        });
        return;
      }

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

      // Add toast message to ref instead of calling directly
      toastMessagesRef.current.push({
        type: 'success',
        message: 'Cập nhật thông tin thành công'
      });
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
      // Add toast message to ref instead of calling directly
      toastMessagesRef.current.push({
        type: 'error',
        message: 'Không thể cập nhật thông tin'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!user) {
        // Add toast message to ref instead of calling directly
        toastMessagesRef.current.push({
          type: 'error',
          message: 'Người dùng chưa đăng nhập'
        });
        return;
      }

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
      useAuthStore.setState((state) => {
        if (state.user) {
          return {
            ...state,
            user: {
              ...state.user,
              avatar_url
            }
          };
        }
        return state;
      });

      // Add toast message to ref instead of calling directly
      toastMessagesRef.current.push({
        type: 'success',
        message: 'Cập nhật ảnh đại diện thành công'
      });
    } catch (error: any) {
      console.error('Lỗi khi tải ảnh lên:', error);
      // Add toast message to ref instead of calling directly
      toastMessagesRef.current.push({
        type: 'error',
        message: 'Không thể tải ảnh lên: ' + (error.message || 'Lỗi không xác định')
      });
    } finally {
      setUploading(false);
    }
  };

  // Update user preference directly with full notification object to avoid type errors
  const saveUserPreferences = async (updatedPrefs: Partial<UserPreferences>) => {
    if (!user?.id) {
      console.log('No user ID available, cannot save preferences');
      return true; // Return true to avoid UI state reverting
    }

    try {
      // Apply updates to local state first
      const mergedPrefs = { ...userPreferences, ...updatedPrefs };
      setUserPreferences(mergedPrefs);

      // First check if the table exists
      const { error: tableError } = await supabase
        .from('user_preferences')
        .select('count')
        .limit(1)
        .single();

      // If table doesn't exist, just use local state
      if (tableError && tableError.code === '42P01') {
        console.log('user_preferences table does not exist - settings saved only locally');
        return true;
      }

      // Kiểm tra xem bản ghi đã tồn tại hay chưa
      const { data: existingPref, error: checkError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing preferences:', checkError);
        return true; // Vẫn trả về true để giữ trạng thái UI
      }

      let error;

      if (existingPref) {
        // Nếu đã tồn tại, dùng update thay vì upsert
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(mergedPrefs)
          .eq('user_id', user.id);

        error = updateError;
      } else {
        // Nếu chưa tồn tại, thêm mới
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            ...mergedPrefs
          });

        error = insertError;
      }

      if (error) {
        console.error('Error saving preferences:', error);
      }

      return true;
    } catch (err) {
      console.error('Exception in saveUserPreferences:', err);
      return true; // Still return true to maintain UI state
    }
  };

  // Toggle handler for notification preferences
  const handleToggleNotification = (type: 'notify_new_rentals' | 'notify_rental_updates') => {
    // Update UI immediately
    const newValue = !userPreferences[type];
    setUserPreferences({
      ...userPreferences,
      [type]: newValue
    });

    // Save to database
    saveUserPreferences({ [type]: newValue }).catch(err => {
      console.error(`Error saving ${type}:`, err);
      // Revert UI state on failure
      setUserPreferences({
        ...userPreferences,
        [type]: !newValue
      });
    });
  };

  // Modify the rental card display
  const renderRentalImage = (rental: Rental) => {
    // Try to get image from equipment
    let imageSrc = '/placeholder.png';

    if (rental.equipment) {
      if (rental.equipment.images && rental.equipment.images.length > 0) {
        imageSrc = rental.equipment.images[0];
      }
      // Fallback for backward compatibility
      else if (rental.equipment.image) {
        imageSrc = rental.equipment.image;
      }
    }

    return (
      <img
        src={imageSrc}
        alt={rental.equipment?.title || 'Rental equipment'}
        className="w-24 h-24 object-cover rounded-lg"
        onError={(e) => e.currentTarget.src = '/placeholder.png'}
      />
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  // If user is still not available after loading completes, show login required
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <h2 className="text-xl font-semibold mb-2 text-yellow-700 dark:text-yellow-400">Yêu cầu đăng nhập</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Vui lòng đăng nhập để xem trang này</p>
            <a href="/signin" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Đăng nhập
            </a>
          </div>
        </div>
      </div>
    );
  }

  const getRentalStatusText = (status: string) => {
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
        <h2 className="text-xl font-semibold dark:text-white">Thông tin cá nhân</h2>
        <button
          onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="flex items-start gap-2">
          <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Họ và tên</p>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={userProfile.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Nhập họ và tên"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200">{userProfile.full_name || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Email</p>
            <p className="text-gray-800 dark:text-gray-200">{user?.email || 'Chưa cập nhật'}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Số điện thoại</p>
            {isEditing ? (
              <input
                type="tel"
                name="phone_number"
                value={userProfile.phone_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Nhập số điện thoại"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200">{userProfile.phone_number || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Ngày sinh</p>
            {isEditing ? (
              <input
                type="date"
                name="date_of_birth"
                value={userProfile.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200">
                {userProfile.date_of_birth ? new Date(userProfile.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Địa chỉ</p>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={userProfile.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                placeholder="Nhập địa chỉ"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200">{userProfile.address || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Giới tính</p>
            {isEditing ? (
              <select
                name="gender"
                value={userProfile.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            ) : (
              <p className="text-gray-800 dark:text-gray-200">
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
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Giới thiệu</p>
          <textarea
            name="bio"
            value={userProfile.bio}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
            rows={4}
            placeholder="Viết đôi điều về bạn"
          />
        </div>
      )}

      {!isEditing && userProfile.bio && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Giới thiệu</p>
          <p className="text-gray-800 dark:text-gray-200">{userProfile.bio}</p>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Thành viên từ {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Vai trò: {user?.is_admin ? 'Quản trị viên' : user?.role === 'owner' ? 'Người cho thuê' : 'Người thuê'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center relative overflow-hidden group">
            {user?.avatar_url ? (
              <>
                <img
                  src={user.avatar_url}
                  alt={user.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <label className="cursor-pointer p-2 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-70 rounded-full hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 text-blue-700" />
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
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <label className="cursor-pointer p-2 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-70 rounded-full hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 text-blue-700" />
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
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1 dark:text-white">{user?.full_name || 'Người thuê'}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Thành viên từ {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {user?.is_admin ? 'Quản trị viên' : user?.role === 'owner' ? 'Người cho thuê' : 'Người thuê'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-1.5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${activeTab === 'profile'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <User className="w-5 h-5" />
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${activeTab === 'rentals'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <Calendar className="w-5 h-5" />
          Thiết bị đã thuê
        </button>
        {!isRenter && (
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${activeTab === 'equipment'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <Package className="w-5 h-5" />
            Thiết bị cho thuê
          </button>
        )}
        {isRenter && (
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${activeTab === 'favorites'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <Heart className="w-5 h-5" />
            Yêu thích
          </button>
        )}
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${activeTab === 'settings'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
          <Settings className="w-5 h-5" />
          Cài đặt
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
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
                      {renderRentalImage(rental)}
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
                        <p className="font-bold text-lg text-blue-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rental.equipment.price_per_day)}
                          <span className="text-sm text-gray-500">/ngày</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Tổng tiền: <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rental.total_amount)}</span>
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
              <h2 className="text-xl font-semibold dark:text-white">Thiết bị cho thuê</h2>
              <button
                onClick={() => {
                  setEditingEquipment(null);
                  setShowAddEquipmentModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-md flex items-center gap-2"
              >
                <Plus size={16} />
                Thêm thiết bị mới
              </button>
            </div>
            {myEquipment.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Bạn chưa có thiết bị nào để cho thuê.</p>
            ) : (
              <div className="space-y-6">
                {myEquipment.map((item: any) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 group bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => e.currentTarget.src = '/placeholder.png'}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-white">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Danh mục: <span className="font-medium">{item.category?.name || 'Không xác định'}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Trạng thái: <span className={`font-medium ${item.status === 'available' ? 'text-green-600 dark:text-green-400' :
                            item.status === 'rented' ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'
                            }`}>
                            {item.status === 'available' ? 'Có sẵn' :
                              item.status === 'rented' ? 'Đang cho thuê' : 'Không khả dụng'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_per_day)}
                          <span className="text-sm text-gray-500 dark:text-gray-400">/ngày</span>
                        </p>
                        <button
                          onClick={() => {
                            setEditingEquipment(item);
                            setShowAddEquipmentModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline text-sm mt-1 flex items-center justify-end gap-1 transition-all"
                        >
                          <Edit size={14} className="group-hover:animate-pulse" />
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>

                    {/* Rental Requests */}
                    {item.rentals && item.rentals.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="font-semibold mb-2 dark:text-white">Yêu cầu thuê</h4>
                        <div className="space-y-3">
                          {item.rentals.map((rental: any) => (
                            <div key={rental.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <div>
                                <p className="font-medium dark:text-white">{rental.renter.full_name || rental.renter.email}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
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
                                <span className={`px-3 py-1 rounded-full text-sm ${rental.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                  rental.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                    rental.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                      rental.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
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

        {activeTab === 'favorites' && isRenter && (
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Thiết bị yêu thích</h2>
            <p className="text-gray-500 dark:text-gray-400">Chức năng đang được phát triển.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Cài đặt tài khoản</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Bảo mật tài khoản</h3>
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Mật khẩu
                  </label>
                  <button
                    onClick={() => {
                      // Send password reset email
                      const email = user?.email;
                      if (email) {
                        supabase.auth.resetPasswordForEmail(email)
                          .then(({ data, error: resetError }) => {
                            if (resetError) {
                              // Add toast message to ref instead of calling directly
                              toastMessagesRef.current.push({
                                type: 'error',
                                message: 'Không thể gửi email đặt lại mật khẩu'
                              });
                              console.error('Error sending reset password email:', resetError);
                            } else {
                              // Add toast message to ref instead of calling directly
                              toastMessagesRef.current.push({
                                type: 'success',
                                message: 'Email đặt lại mật khẩu đã được gửi!'
                              });
                            }
                          });
                      } else {
                        // Add toast message to ref instead of calling directly
                        toastMessagesRef.current.push({
                          type: 'error',
                          message: 'Không thể tìm thấy email của tài khoản'
                        });
                      }
                    }}
                    className="px-4 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Thay đổi mật khẩu
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Yêu cầu thay đổi mật khẩu sẽ được gửi đến email của bạn
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Thông báo</h3>
                <div className="space-y-4 pl-1">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="mr-3 w-4 h-4 accent-blue-600"
                      checked={userPreferences.notify_new_rentals}
                      onChange={() => handleToggleNotification('notify_new_rentals')}
                    />
                    <span className="select-none group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400 transition-colors">
                      Nhận email thông báo khi có yêu cầu thuê mới
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="mr-3 w-4 h-4 accent-blue-600"
                      checked={userPreferences.notify_rental_updates}
                      onChange={() => handleToggleNotification('notify_rental_updates')}
                    />
                    <span className="select-none group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400 transition-colors">
                      Nhận email thông báo khi có cập nhật trạng thái thuê
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                  onClick={() => {
                    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
                      supabase.auth.signOut().then(() => {
                        // Add toast message to ref instead of calling directly
                        toastMessagesRef.current.push({
                          type: 'success',
                          message: 'Đã đăng xuất thành công'
                        });
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 1000);
                      });
                    }
                  }}
                  className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isRenter && (
        <AddEquipmentModal
          isOpen={showAddEquipmentModal}
          onClose={() => {
            setShowAddEquipmentModal(false);
            setEditingEquipment(null);
          }}
          onSuccess={() => {
            fetchMyEquipment();
            setEditingEquipment(null);
          }}
          equipmentToEdit={editingEquipment}
        />
      )}
    </div>
  );
}