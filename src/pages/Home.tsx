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
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-primary to-primary/80 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg animate-fade-in-up">
            Thuê thiết bị chuyên nghiệp với giá tốt nhất
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 animate-fade-in-up animation-delay-200 max-w-2xl mx-auto">
            Khám phá kho thiết bị đa dạng của chúng tôi. Từ máy ảnh, máy quay đến thiết bị âm thanh, cắm trại, SUP, chèo - tất cả đều có sẵn cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400 justify-center">
            <Link to="/equipment" className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all text-lg">
              Xem thiết bị <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {!user && (
              <Link to="/signin" className="inline-flex items-center justify-center px-8 py-4 bg-primary/90 text-primary-foreground font-bold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all text-lg">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Danh mục thiết bị */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Danh mục thiết bị</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div onClick={() => handleCategoryClick("Máy ảnh")} className="cursor-pointer">
              <CategoryCard
                icon={<Camera className="h-12 w-12 text-primary-foreground/70" />}
                title="Máy ảnh"
                desc="Máy ảnh chuyên nghiệp cho mọi nhu cầu"
                bg="from-primary to-primary/80"
              />
            </div>

            <div onClick={() => handleCategoryClick("Loa")} className="cursor-pointer">
              <CategoryCard
                icon={<Music className="h-12 w-12 text-primary-foreground/70" />}
                title="Loa"
                desc="Hệ thống âm thanh chuyên nghiệp"
                bg="from-primary/90 to-primary/70"
              />
            </div>

            <div onClick={() => handleCategoryClick("Dụng cụ cắm trại")} className="cursor-pointer">
              <CategoryCard
                icon={<Umbrella className="h-12 w-12 text-primary-foreground/70" />}
                title="Dụng cụ cắm trại"
                desc="Thiết bị và dụng cụ dã ngoại tiện dụng"
                bg="from-primary/80 to-primary/60"
              />
            </div>

            <div onClick={() => handleCategoryClick("Sub")} className="cursor-pointer">
              <CategoryCard
                icon={<MapPin className="h-12 w-12 text-primary-foreground/70" />}
                title="Sub"
                desc="Ván chèo đứng và thiết bị thể thao dưới nước"
                bg="from-primary/70 to-primary/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tại sao chọn chúng tôi */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Calendar className="h-8 w-8 text-primary" />} title="Đặt lịch linh hoạt" desc="Chọn thời gian thuê phù hợp với lịch trình của bạn" />
            <FeatureCard icon={<Shield className="h-8 w-8 text-primary" />} title="Bảo hiểm toàn diện" desc="Thiết bị được bảo hiểm trong suốt thời gian thuê" />
            <FeatureCard icon={<Star className="h-8 w-8 text-primary" />} title="Chất lượng cao cấp" desc="Tất cả thiết bị đều được kiểm tra và bảo trì định kỳ" />
            <FeatureCard icon={<Clock className="h-8 w-8 text-primary" />} title="Giao nhận nhanh chóng" desc="Dịch vụ giao nhận thiết bị tận nơi trong khu vực" />
          </div>
        </div>
      </section>

      {/* Cách thức hoạt động */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Cách thức hoạt động</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <StepCard step={1} title="Chọn thiết bị" desc="Tìm kiếm và chọn thiết bị phù hợp với nhu cầu của bạn" />
            <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-primary/60 to-primary rounded-full" />
            <StepCard step={2} title="Đặt lịch" desc="Chọn thời gian thuê và thanh toán đơn giản" />
            <div className="hidden md:block w-16 h-1 bg-gradient-to-r from-primary/60 to-primary rounded-full" />
            <StepCard step={3} title="Nhận thiết bị" desc="Nhận thiết bị tại địa điểm đã chọn và bắt đầu sử dụng" />
          </div>
        </div>
      </section>

      {/* CTA cuối trang */}
      <section className="relative py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-10 text-primary-foreground/90 max-w-2xl mx-auto">
            Khám phá kho thiết bị của chúng tôi ngay hôm nay và tìm thấy những thiết bị phù hợp nhất cho dự án của bạn
          </p>
          <Link to="/equipment" className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary font-semibold rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300 text-lg">
            Xem thiết bị <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ icon, title, desc, bg }: { icon: React.ReactNode; title: string; desc: string; bg: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br ${bg} text-primary-foreground p-8 flex flex-col items-start`}>
      <div className="mb-4 bg-white/20 rounded-full p-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{title}</h3>
      <p className="text-primary-foreground/90 text-base">{desc}</p>
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="h-6 w-6 text-primary-foreground" />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold mb-4 text-primary">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
        {step}
      </div>
      <h3 className="text-2xl font-semibold mb-4 text-primary">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{desc}</p>
    </div>
  );
}