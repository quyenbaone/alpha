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

  // Calculate rental days
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
  const total = perDay * days + insurance + service;

  // Add to cart handler
  const handleAddToCart = () => {
    if (!equipment) return;

    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn ngày thuê');
      return;
    }

    addToCart({
      id: equipment.id,
      title: equipment.title,
      price: perDay,
      image: equipment.images?.[0] || defaultImage,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  // Rent now handler (with validation & redirect)
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
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const today = new Date(vietnamTime.getFullYear(), vietnamTime.getMonth(), vietnamTime.getDate());

    const selectedStartDate = new Date(startDate);
    const selectedEndDate = new Date(endDate);

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

  // Today's date string for min date on inputs
  const today = new Date();
  const vietnamTime = new Date(today.getTime() + 7 * 60 * 60 * 1000);
  const todayString = vietnamTime.toISOString().split('T')[0];

  // Update rating from reviews component
  const handleRatingUpdate = (newRating: number, count: number) => {
    setAvgRating(newRating);
    setReviewCount(count);
  };

  // Skeleton loading UI
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
          <Button onClick={() => window.location.reload()} className="bg-orange-500 text-white">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = selectedImage || equipment.images?.[0] || defaultImage;

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div>
          <div className="relative rounded-2xl shadow-xl overflow-hidden mb-4">
            <img
              src={mainImage}
              alt={equipment.title}
              className="w-full h-[400px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = defaultImage; }}
            />
            <button
              onClick={() => setIsLiked(v => !v)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
              aria-label="Yêu thích"
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </button>
            {equipment.category && (
              <Badge
                variant="outline"
                className="absolute top-4 left-4 px-4 py-1 text-base bg-orange-500 text-white border-0 rounded-full shadow"
              >
                {equipment.category}
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {equipment.images && equipment.images.length > 1 && (
            <div className="flex gap-3 justify-center">
              {equipment.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2
                    ${selectedImage === img ? 'border-[#0F4D4D]' : 'border-gray-300'}
                    hover:border-[#0F4D4D] transition-colors`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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

          {/* Booking */}
          <div className="p-6 rounded-xl mb-6 bg-transparent">
  <h2 className="text-xl font-semibold mb-4 text-gray-900">Đặt thuê</h2>

  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block mb-1 font-medium text-gray-700">Ngày bắt đầu</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          if (endDate && new Date(e.target.value) > new Date(endDate)) setEndDate('');
        }}
        className="w-full p-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-[#0F4D4D] focus:border-[#0F4D4D]"
        min={todayString}
      />
    </div>
    <div>
      <label className="block mb-1 font-medium text-gray-700">Ngày kết thúc</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full p-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-[#0F4D4D] focus:border-[#0F4D4D]"
        min={startDate || todayString}
      />
    </div>
  </div>

  <button
    onClick={() => setShowCalendar(!showCalendar)}
    className="flex items-center gap-2 font-semibold mb-4 text-[#0F4D4D] hover:text-[#145757]"
  >
    <Calendar className="h-5 w-5" />
    {showCalendar ? 'Ẩn lịch' : 'Xem lịch khả dụng'}
  </button>

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

  <div className="mt-6 space-y-1 text-sm text-gray-700">
    <div className="flex justify-between">
      <span>Giá thuê mỗi ngày</span>
      <span>{formatPrice(perDay)}</span>
    </div>
    <div className="flex justify-between">
      <span>Phí bảo hiểm</span>
      <span>{formatPrice(insurance)}</span>
    </div>
    <div className="flex justify-between">
      <span>Phí dịch vụ</span>
      <span>{formatPrice(service)}</span>
    </div>
    <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2 text-gray-900">
  <span>Tổng cộng ({days} ngày)</span>
  <span>{formatPrice(total)}</span>
</div>

  </div>

  <div className="flex gap-4 mt-8">
    <Button
      variant="outline"
      onClick={handleAddToCart}
      className="flex-1 py-3 text-base text-[#0F4D4D] border border-[#0F4D4D] hover:bg-[#0F4D4D] hover:text-white"
    >
      <ShoppingCart className="h-5 w-5 mr-2" /> Thêm vào giỏ
    </Button>
    <Button
      variant="solid"
      onClick={handleRentNow}
      className="flex-1 py-3 text-base bg-[#0F4D4D] hover:bg-[#145757] text-white"
    >
      Thuê ngay
    </Button>
  </div>
</div>


          {/* Map & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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

      {/* Product Reviews Outside the Details Box */}
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
  <h2 className="text-2xl font-semibold mb-6 text-gray-900 border-0">Đánh giá sản phẩm</h2>
  <ProductReviews equipmentId={id} onRatingUpdate={handleRatingUpdate} />
</div>
</div>

  );
}
