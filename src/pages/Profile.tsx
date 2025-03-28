import { Calendar, Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

// Define rental interface
interface Rental {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  equipment: {
    title: string;
    image: string;
    price: number;
  };
}

export function Profile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('rentals');
  const [myRentals, setMyRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyRentals();
    }
  }, [user]);

  const fetchMyRentals = async () => {
    try {
      if (!user) return;

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{user.email}</h1>
            <p className="text-gray-600">Member since {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'rentals'
            ? 'bg-orange-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Calendar className="w-5 h-5" />
          Lịch sử thuê
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'settings'
            ? 'bg-orange-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
        >
          <Settings className="w-5 h-5" />
          Cài đặt
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'rentals' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Lịch sử thuê</h2>
            <div className="space-y-4">
              {myRentals.length === 0 ? (
                <p className="text-gray-500">Bạn chưa có lịch sử thuê thiết bị nào.</p>
              ) : (
                myRentals.map((rental) => (
                  <div key={rental.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={rental.equipment.image}
                        alt={rental.equipment.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{rental.equipment.title}</h3>
                        <p className="text-gray-600">
                          {new Date(rental.start_date).toLocaleDateString()} -{' '}
                          {new Date(rental.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Trạng thái: <span className="font-medium">{rental.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {rental.equipment.price.toLocaleString()} VND
                          <span className="text-sm text-gray-500">/day</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Cài đặt tài khoản</h2>
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
                  Password
                </label>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="text-orange-500 hover:text-orange-600"
                >
                  Change Password
                </button>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Notifications
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Email notifications for new rental requests
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Email notifications for rental status updates
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}