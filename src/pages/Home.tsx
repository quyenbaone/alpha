import { ArrowRight, Calendar, Camera, Clock, Lightbulb, Music, Shield, Star, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fade-in-up">Thuê thiết bị chuyên nghiệp với giá tốt nhất</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 animate-fade-in-up animation-delay-200 max-w-2xl mx-auto">
            Khám phá kho thiết bị đa dạng của chúng tôi. Từ máy ảnh, máy quay đến thiết bị âm thanh, ánh sáng - tất cả đều có sẵn cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400 justify-center">
            <Link to="/equipment" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all text-lg">
              Xem thiết bị <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {!user && (
              <Link to="/signin" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all text-lg">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Danh mục thiết bị */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">Danh mục thiết bị</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <CategoryCard icon={<Camera className="h-12 w-12 text-blue-400" />} title="Máy ảnh" desc="Máy ảnh chuyên nghiệp cho mọi nhu cầu" bg="from-blue-600 to-blue-900" />
            <CategoryCard icon={<Video className="h-12 w-12 text-blue-400" />} title="Máy quay" desc="Thiết bị quay phim chất lượng cao" bg="from-blue-500 to-blue-800" />
            <CategoryCard icon={<Music className="h-12 w-12 text-blue-400" />} title="Âm thanh" desc="Hệ thống âm thanh chuyên nghiệp" bg="from-blue-400 to-blue-700" />
            <CategoryCard icon={<Lightbulb className="h-12 w-12 text-blue-400" />} title="Ánh sáng" desc="Thiết bị chiếu sáng chuyên dụng" bg="from-blue-300 to-blue-600" />
          </div>
        </div>
      </section>

      {/* Tại sao chọn chúng tôi */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Calendar className="h-8 w-8 text-blue-500" />} title="Đặt lịch linh hoạt" desc="Chọn thời gian thuê phù hợp với lịch trình của bạn" />
            <FeatureCard icon={<Shield className="h-8 w-8 text-blue-500" />} title="Bảo hiểm toàn diện" desc="Thiết bị được bảo hiểm trong suốt thời gian thuê" />
            <FeatureCard icon={<Star className="h-8 w-8 text-blue-500" />} title="Chất lượng cao cấp" desc="Tất cả thiết bị đều được kiểm tra và bảo trì định kỳ" />
            <FeatureCard icon={<Clock className="h-8 w-8 text-blue-500" />} title="Giao nhận nhanh chóng" desc="Dịch vụ giao nhận thiết bị tận nơi trong khu vực" />
          </div>
        </div>
      </section>

      {/* Cách thức hoạt động */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">Cách thức hoạt động</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <StepCard step={1} title="Chọn thiết bị" desc="Tìm kiếm và chọn thiết bị phù hợp với nhu cầu của bạn" />
            <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-700 rounded-full" />
            <StepCard step={2} title="Đặt lịch" desc="Chọn thời gian thuê và thanh toán đơn giản" />
            <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-700 rounded-full" />
            <StepCard step={3} title="Nhận thiết bị" desc="Nhận thiết bị tại địa điểm đã chọn và bắt đầu sử dụng" />
          </div>
        </div>
      </section>

      {/* CTA cuối trang */}
      <section className="relative py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
            Khám phá kho thiết bị của chúng tôi ngay hôm nay và tìm thấy những thiết bị phù hợp nhất cho dự án của bạn
          </p>
          <Link to="/equipment" className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-700 font-semibold rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg">
            Xem thiết bị <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ icon, title, desc, bg }: { icon: React.ReactNode; title: string; desc: string; bg: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br ${bg} text-white p-8 flex flex-col items-start`}>
      <div className="mb-4 bg-white/20 rounded-full p-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{title}</h3>
      <p className="text-blue-100 text-base">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold mb-4 text-blue-700">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
        {step}
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-blue-700">{title}</h3>
      <p className="text-gray-600 max-w-xs">{desc}</p>
    </div>
  );
}