import { Calendar, Clock, Heart, MapPin, Shield, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useEquipment } from '../lib/hooks';
import { formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { equipment, loading, error } = useEquipment(id);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!equipment) return;
    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn ngày thuê');
      return;
    }

    addToCart({
      equipment,
      quantity: 1,
      startDate,
      endDate,
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleRentNow = () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn ngày thuê');
      return;
    }

    // Get current date in Vietnam timezone
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
    const today = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate());

    // Parse selected dates
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const selectedStartDate = new Date(startYear, startMonth - 1, startDay);
    const selectedEndDate = new Date(endYear, endMonth - 1, endDay);

    // Compare dates
    if (selectedStartDate < today) {
      toast.error('Ngày bắt đầu không thể là ngày trong quá khứ');
      return;
    }

    if (selectedEndDate <= selectedStartDate) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    handleAddToCart();
    navigate('/cart');
  };

  // Update the date input fields with proper min/max values
  const today = new Date();
  const vietnamTime = new Date(today.getTime() + (7 * 60 * 60 * 1000));
  const todayString = vietnamTime.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-[500px] bg-gray-200 rounded-lg mb-8" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Không thể tải thông tin thiết bị. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative">
          <img
            src={equipment.image}
            alt={equipment.title}
            className="w-full h-[500px] object-cover rounded-lg shadow-lg"
          />
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transform hover:scale-110 transition-all duration-300"
          >
            <Heart className={`h-6 w-6 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
          <div className="absolute top-4 left-4 px-4 py-2 bg-orange-500 text-white rounded-full shadow-md">
            {equipment.category}
          </div>
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{equipment.title}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1">{equipment.rating}</span>
              <span className="text-gray-500 ml-1">({equipment.reviews} đánh giá)</span>
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
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    // Reset end date if it's before the new start date
                    if (endDate && new Date(e.target.value) > new Date(endDate)) {
                      setEndDate('');
                    }
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  min={todayString}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-2">Ngày kết thúc</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  min={startDate || todayString}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span>Giá thuê mỗi ngày</span>
                <span className="font-semibold">{formatPrice(equipment.price)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Phí bảo hiểm</span>
                <span className="font-semibold">{formatPrice(50000)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Phí dịch vụ</span>
                <span className="font-semibold">{formatPrice(30000)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="font-bold text-xl text-orange-500">
                    {formatPrice(equipment.price + 80000)}/ngày
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-orange-500 text-orange-500 py-3 rounded-lg hover:bg-orange-50 transition-colors duration-300"
              >
                <ShoppingCart className="h-5 w-5" />
                Thêm vào giỏ
              </button>
              <button
                onClick={handleRentNow}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300"
              >
                Thuê ngay
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
              <p className="text-gray-600">{equipment.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Bao gồm</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span>Bảo hiểm thiết bị</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span>Linh hoạt ngày thuê</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}