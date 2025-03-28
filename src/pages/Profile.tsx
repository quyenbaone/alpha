import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Package, Calendar, Settings, User, Check, X } from 'lucide-react';
import { AddEquipmentModal } from '../components/AddEquipmentModal';

export function Profile() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('rentals');
  const [myRentals, setMyRentals] = useState([]);
  const [myEquipment, setMyEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyRentals();
      fetchMyEquipment();
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
              email
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
    } catch (error) {
      console.error('Error updating rental status:', error);
      alert('Failed to update rental status');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
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
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'rentals'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-5 h-5" />
          My Rentals
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'equipment'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Package className="w-5 h-5" />
          My Equipment
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'rentals' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Rentals</h2>
            <div className="space-y-4">
              {myRentals.map((rental: any) => (
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
                        Status: <span className="font-medium">{rental.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${rental.equipment.price}
                        <span className="text-sm text-gray-500">/day</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Equipment</h2>
              <button
                onClick={() => setShowAddEquipmentModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Add New Equipment
              </button>
            </div>
            <div className="space-y-6">
              {myEquipment.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-sm text-gray-500">
                        Category: <span className="font-medium">{item.category}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${item.price}
                        <span className="text-sm text-gray-500">/day</span>
                      </p>
                      <button className="text-orange-500 hover:text-orange-600 text-sm">
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Rental Requests */}
                  {item.rentals && item.rentals.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-2">Rental Requests</h4>
                      <div className="space-y-3">
                        {item.rentals.map((rental: any) => (
                          <div key={rental.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium">{rental.renter.email}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(rental.start_date).toLocaleDateString()} -{' '}
                                {new Date(rental.end_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {rental.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(rental.id, 'approved')}
                                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(rental.id, 'rejected')}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                rental.status === 'approved' ? 'bg-green-100 text-green-800' :
                                rental.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {rental.status}
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
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
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
                <button className="text-orange-500 hover:text-orange-600">
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

      <AddEquipmentModal
        isOpen={showAddEquipmentModal}
        onClose={() => setShowAddEquipmentModal(false)}
        onSuccess={() => {
          fetchMyEquipment();
        }}
      />
    </div>
  );
}