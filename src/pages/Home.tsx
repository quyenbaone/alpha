import { ArrowRight, Calendar, Clock, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Thuê thiết bị chuyên nghiệp với giá tốt nhất
            </h1>
            <p className="text-lg md:text-xl mb-8 text-orange-100">
              Khám phá kho thiết bị đa dạng của chúng tôi. Từ máy ảnh, máy quay đến thiết bị âm thanh, ánh sáng - tất cả đều có sẵn cho bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/equipment"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
              >
                Xem thiết bị
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              {!user && (
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Đặt lịch linh hoạt</h3>
              <p className="text-gray-600">
                Chọn thời gian thuê phù hợp với lịch trình của bạn
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bảo hiểm toàn diện</h3>
              <p className="text-gray-600">
                Thiết bị được bảo hiểm trong suốt thời gian thuê
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng cao cấp</h3>
              <p className="text-gray-600">
                Tất cả thiết bị đều được kiểm tra và bảo trì định kỳ
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao nhận nhanh chóng</h3>
              <p className="text-gray-600">
                Dịch vụ giao nhận thiết bị tận nơi trong khu vực
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Cách thức hoạt động</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Chọn thiết bị</h3>
              <p className="text-gray-600">
                Tìm kiếm và chọn thiết bị phù hợp với nhu cầu của bạn
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Đặt lịch</h3>
              <p className="text-gray-600">
                Chọn thời gian thuê và thanh toán đơn giản
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Nhận thiết bị</h3>
              <p className="text-gray-600">
                Nhận thiết bị tại địa điểm đã chọn và bắt đầu sử dụng
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-lg mb-8 text-orange-100">
            Khám phá kho thiết bị của chúng tôi ngay hôm nay
          </p>
          <Link
            to="/equipment"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
          >
            Xem thiết bị
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}