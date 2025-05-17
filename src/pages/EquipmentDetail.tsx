import { Calendar, Heart, MapPin, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import EquipmentCalendar from '../components/EquipmentCalendar';
import LocationMap from '../components/LocationMap';
import { ProductReviews } from '../components/ProductReviews';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useEquipment } from '../lib/hooks';
import { formatPrice } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export function EquipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { equipment, loading, error } = useEquipment(id);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const defaultImage = '/placeholder.png';

  useEffect(() => {
    if (!id) navigate('/equipment');
  }, [id, navigate]);

  // Calculate total days and total price
  let days = 1;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    days = Math.max(Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)), 1);
  }

  // Fees
  const insurance = 50000;
  const service = 30000;
  const perDay = equipment?.price_per_day || 0;
  const total = (perDay * days) + insurance + service;

  const handleAddToCart = () => {
    if (!equipment) return;
    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn ngày thuê');
      return;
    }
    addToCart({
      id: equipment.id,
      title: equipment.title,
      price: equipment.price_per_day || 0,
      image: (equipment.images?.length ? equipment.images[0] : defaultImage),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
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
    const now = new Date();
    const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const today = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate());
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const selectedStartDate = new Date(startYear, startMonth - 1, startDay);
    const selectedEndDate = new Date(endYear, endMonth - 1, endDay);
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

  const today = new Date();
  const vietnamTime = new Date(today.getTime() + (7 * 60 * 60 * 1000));
  const todayString = vietnamTime.toISOString().split('T')[0];

  const handleRatingUpdate = (newRating: number, count: number) => {
    setAvgRating(newRating);
    setReviewCount(count);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-[400px] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="w-1/2 h-8" />
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy thông tin thiết bị'}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = selectedImage || (equipment.images?.[0] || defaultImage);

  return (
    <div className="container mx-auto px-2 md:px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
            <img
              src={mainImage}
              alt={equipment.title}
              className="w-full h-[400px] object-cover rounded-xl transition-all"
              onError={(e) => { (e.target as HTMLImageElement).src = defaultImage; }}
            />
            <button
              onClick={() => setIsLiked((like) => !like)}
              className="absolute top-6 right-8 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              aria-label="Yêu thích"
            >
              <Heart className={`h-6 w-6 transition ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            {equipment.category && (
              <Badge variant="outline" className="absolute top-6 left-8 px-4 py-1 text-base bg-orange-500 text-white border-0 rounded-full shadow">
                {equipment.category}
              </Badge>
            )}
          </div>
          {/* Gallery thumbnails */}
          {equipment.images && equipment.images.length > 1 && (
            <div className="flex gap-3 px-4">
              {equipment.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`border rounded-xl ${mainImage === img ? 'border-orange-500' : 'border-gray-200'} w-16 h-16 overflow-hidden`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{equipment.title}</h1>
          <div className="flex items-center gap-5 mb-6">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 font-semibold">{avgRating || equipment.rating || 0}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5" />
              <span className="ml-1">{equipment.location}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Đặt thuê</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && new Date(e.target.value) > new Date(endDate)) setEndDate('');
                  }}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  min={todayString}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1 font-medium">Ngày kết thúc</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  min={startDate || todayString}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowCalendar(!showCalendar)}
              className="mt-1 text-orange-500 hover:text-orange-600 flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              {showCalendar ? 'Ẩn lịch' : 'Xem lịch khả dụng'}
            </Button>
            {showCalendar && (
              <div className="mt-4">
                <EquipmentCalendar
                  equipmentId={id}
                  onDateSelect={(start, end) => {
                    setStartDate(start.toISOString().split('T')[0]);
                    setEndDate(end.toISOString().split('T')[0]);
                  }}
                />
              </div>
            )}
            {/* Fees and total */}
            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between"><span>Giá thuê mỗi ngày</span><span>{formatPrice(perDay)}</span></div>
              <div className="flex justify-between"><span>Phí bảo hiểm</span><span>{formatPrice(insurance)}</span></div>
              <div className="flex justify-between"><span>Phí dịch vụ</span><span>{formatPrice(service)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Tổng cộng ({days} ngày)</span>
                <span className="text-orange-500">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <Button
                variant="secondary"
                onClick={handleAddToCart}
                className="flex-1 py-3 text-base bg-white border border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <ShoppingCart className="h-5 w-5 mr-2" /> Thêm vào giỏ
              </Button>
              <Button
                variant="default"
                onClick={handleRentNow}
                className="flex-1 py-3 text-base bg-orange-600 hover:bg-orange-700"
              >
                Thuê ngay
              </Button>
            </div>
          </div>

          {/* Map & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-3">Vị trí nhận thiết bị</h2>
              <LocationMap
                location={{
                  lat: 10.762622,
                  lng: 106.660172,
                  address: equipment.location || 'Hồ Chí Minh',
                }}
                height="220px"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-3">Mô tả</h2>
              <p className="text-gray-600 whitespace-pre-line">{equipment.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <ProductReviews equipmentId={id} onRatingUpdate={handleRatingUpdate} />
      </div>
    </div>
  );
}
