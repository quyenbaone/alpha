import { Calendar, Clock, Heart, MapPin, Shield, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Equipment } from '../store/equipmentStore';

export function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);

  const fetchEquipmentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRentNow = async () => {
    if (!user) {
      // Redirect to sign in if not authenticated
      navigate('/signin');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select rental dates');
      return;
    }

    try {
      const { error } = await supabase.from('rentals').insert({
        equipment_id: id,
        renter_id: user.id,
        start_date: startDate,
        end_date: endDate,
        status: 'pending'
      });

      if (error) throw error;
      alert('Rental request submitted successfully!');
      navigate('/my-rentals');
    } catch (error) {
      console.error('Error creating rental:', error);
      alert('Failed to submit rental request');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!equipment) {
    return <div className="container mx-auto px-4 py-8">Equipment not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative">
          <img
            src={equipment.image}
            alt={equipment.title}
            className="w-full h-[500px] object-cover rounded-lg"
          />
          <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
            <Heart className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{equipment.title}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1">{equipment.rating}</span>
              <span className="text-gray-500 ml-1">({equipment.reviews} reviews)</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5" />
              <span className="ml-1">{equipment.location}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Chi tiết thuê</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Ngày kết thúc</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span>Giá mỗi ngày
                </span>
                <span className="font-semibold">{equipment.price.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Phí bảo hiểm
                </span>
                <span className="font-semibold">50,000 VND</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Phí dịch vụ
                </span>
                <span className="font-semibold">100,000 VND</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Tổng chi phí  </span>
                  <span className="font-bold text-xl">
                    {(equipment.price + 50000 + 100000).toLocaleString()} VND/day
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRentNow}
              className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600"
            >
              Rent Now
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Sự miêu tả</h2>
              <p className="text-gray-600">{equipment.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Bao gồm những gì
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span>Bao gồm bảo hiểm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span>Thời gian linh hoạt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}