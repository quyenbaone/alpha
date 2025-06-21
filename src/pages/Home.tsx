import { ArrowRight, Calendar, Camera, Clock, MapPin, Music, Shield, Star, Umbrella } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    console.log(`Navigating to category: ${categoryName}`);
    navigate(`/equipment?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section - Updated with softer colors */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 drop-shadow-lg animate-fade-in-up">
            Thuê thiết bị chuyên nghiệp với giá tốt nhất
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 animate-fade-in-up animation-delay-200 max-w-2xl mx-auto">
            Khám phá kho thiết bị đa dạng của chúng tôi. Từ máy ảnh, máy quay đến thiết bị âm thanh, cắm trại, SUP, chèo - tất cả đều có sẵn cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400 justify-center">
            <Link to="/equipment" className="inline-flex items-center justify-center px-8 py-4 bg-orange-200 text-orange-900 font-bold rounded-full shadow hover:bg-orange-300 transition-all text-lg">
              Xem thiết bị <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {!user && (
              <Link to="/signin" className="inline-flex items-center justify-center px-8 py-4 bg-orange-100 text-orange-800 font-bold rounded-full shadow hover:bg-orange-200 transition-all text-lg">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Danh mục thiết bị - Updated with softer colors */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">Danh mục thiết bị</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div onClick={() => handleCategoryClick("Máy ảnh")} className="cursor-pointer">
              <CategoryCard
                icon={<Camera className="h-12 w-12 text-orange-300 dark:text-orange-400" />}
                title="Máy ảnh"
                desc="Máy ảnh chuyên nghiệp cho mọi nhu cầu"
                bg="from-orange-100 via-orange-200 to-orange-300 dark:from-gray-800/90 dark:to-gray-700/80"
              />
            </div>

            <div onClick={() => handleCategoryClick("Loa")} className="cursor-pointer">
              <CategoryCard
                icon={<Music className="h-12 w-12 text-gray-400 dark:text-orange-400" />}
                title="Loa"
                desc="Hệ thống âm thanh chuyên nghiệp"
                bg="from-orange-100 to-orange-300 dark:from-gray-800/90 dark:to-gray-700/80"
              />
            </div>

            <div onClick={() => handleCategoryClick("Dụng cụ cắm trại")} className="cursor-pointer">
              <CategoryCard
                icon={<Umbrella className="h-12 w-12 text-orange-300 dark:text-orange-400" />}
                title="Dụng cụ cắm trại"
                desc="Thiết bị và dụng cụ dã ngoại tiện dụng"
                bg="from-orange-100 to-orange-300 dark:from-gray-800/90 dark:to-gray-700/80"
              />
            </div>

            <div onClick={() => handleCategoryClick("Sub")} className="cursor-pointer">
              <CategoryCard
                icon={<MapPin className="h-12 w-12 text-gray-400 dark:text-orange-400" />}
                title="Sub"
                desc="Ván chèo đứng và thiết bị thể thao dưới nước"
                bg="from-orange-100 to-orange-300 dark:from-gray-800/90 dark:to-gray-700/80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tại sao chọn chúng tôi - Updated with softer colors */}
      <section className="py-20 bg-orange-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Calendar className="h-8 w-8 text-orange-300 dark:text-orange-400" />} title="Đặt lịch linh hoạt" desc="Chọn thời gian thuê phù hợp với lịch trình của bạn" />
            <FeatureCard icon={<Shield className="h-8 w-8 text-orange-300 dark:text-orange-400" />} title="Bảo hiểm toàn diện" desc="Thiết bị được bảo hiểm trong suốt thời gian thuê" />
            <FeatureCard icon={<Star className="h-8 w-8 text-orange-300 dark:text-orange-400" />} title="Chất lượng cao cấp" desc="Tất cả thiết bị đều được kiểm tra và bảo trì định kỳ" />
            <FeatureCard icon={<Clock className="h-8 w-8 text-orange-300 dark:text-orange-400" />} title="Giao nhận nhanh chóng" desc="Dịch vụ giao nhận thiết bị tận nơi trong khu vực" />
          </div>
        </div>
      </section>

      {/* Cách thức hoạt động - Updated with softer colors */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">Cách thức hoạt động</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <StepCard step={1} title="Chọn thiết bị" desc="Tìm kiếm và chọn thiết bị phù hợp với nhu cầu của bạn" />
            <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-orange-200 to-orange-300 dark:from-orange-400/30 dark:to-orange-400/60 rounded-full" />
            <StepCard step={2} title="Đặt lịch" desc="Chọn thời gian thuê và thanh toán đơn giản" />
            <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-orange-200 to-orange-300 dark:from-orange-400/30 dark:to-orange-400/60 rounded-full" />
            <StepCard step={3} title="Nhận thiết bị" desc="Nhận thiết bị tại địa điểm đã chọn và bắt đầu sử dụng" />
          </div>
        </div>
      </section>

      {/* CTA cuối trang - Updated with softer colors */}
      <section className="relative py-20 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-300 dark:from-gray-800 dark:to-gray-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-10 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Khám phá kho thiết bị của chúng tôi ngay hôm nay và tìm thấy những thiết bị phù hợp nhất cho dự án của bạn
          </p>
          <Link to="/equipment" className="inline-flex items-center justify-center px-10 py-4 bg-orange-200 text-orange-900 dark:bg-orange-300/20 dark:text-orange-300 font-semibold rounded-full hover:bg-orange-300 dark:hover:bg-orange-300/30 transition-all duration-300 text-lg">
            Xem thiết bị <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ icon, title, desc, bg }: { icon: React.ReactNode; title: string; desc: string; bg: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br ${bg} p-8 flex flex-col items-start`}>
      <div className="mb-4 bg-white/40 dark:bg-white/10 rounded-full p-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300 text-base">{desc}</p>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-orange-100/80 dark:bg-orange-400/10 rounded-full flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold mb-4 text-orange-700 dark:text-orange-400">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-400/30 dark:to-orange-400/60 text-orange-800 dark:text-orange-100 rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-md">
        {step}
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-orange-700 dark:text-orange-400">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-xs">{desc}</p>
    </div>
  );
}