import { ArrowRight, Clock, Eye, Filter, Search, Shield, ShoppingCart, Star } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CategoryNav } from '../components/CategoryNav';
import { FilterPanel } from '../components/FilterPanel';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/cartStore';
import { useEquipmentStore } from '../store/equipmentStore';

export function Home() {
  const navigate = useNavigate();
  const { items, loading, error, fetchEquipment, setFilters } = useEquipmentStore();
  const addToCart = useCartStore((state) => state.addItem);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery.trim() || null });
  };

  const handleAddToCart = (item: any, e: React.MouseEvent) => {
    e.preventDefault();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    addToCart({
      equipment: item,
      quantity: 1,
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0],
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleViewDetails = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/equipment/${id}`);
  };

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Nhiếp ảnh gia',
      content: 'Dịch vụ cho thuê thiết bị rất chuyên nghiệp, thiết bị chất lượng cao và giá cả hợp lý.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    },
    {
      name: 'Trần Thị B',
      role: 'Người dẫn chương trình',
      content: 'Tôi rất hài lòng với trải nghiệm thuê thiết bị. Quy trình đơn giản và dễ dàng.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    },
    {
      name: 'Lê Văn C',
      role: 'Đạo diễn',
      content: 'Đội ngũ hỗ trợ nhiệt tình, thiết bị luôn trong tình trạng hoàn hảo.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
  ];

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-[#1e4d5c] text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
            alt="Hero background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container relative py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Thuê thiết bị chuyên nghiệp dễ dàng và nhanh chóng
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Khám phá hàng nghìn thiết bị chất lượng cao với giá cả hợp lý. Thuê ngay hôm nay!
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thiết bị..."
                  className="w-full px-6 py-4 rounded-lg text-gray-900 pr-12"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="px-6 py-4 bg-white/10 rounded-lg hover:bg-white/20"
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Categories */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Danh mục thiết bị</h2>
            <button className="text-orange-500 hover:text-orange-600 flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <CategoryNav />
        </div>

        {/* How it works */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Cách thức hoạt động</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Tìm thiết bị</h3>
              <p className="text-gray-600">
                Dễ dàng tìm kiếm thiết bị phù hợp với nhu cầu của bạn
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Đặt thuê</h3>
              <p className="text-gray-600">
                Chọn thời gian thuê và đặt thiết bị chỉ trong vài phút
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Sử dụng an toàn</h3>
              <p className="text-gray-600">
                Tất cả thiết bị đều được bảo hiểm và kiểm tra chất lượng
              </p>
            </div>
          </div>
        </div>

        {/* Featured Equipment */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Thiết bị nổi bật</h2>
            <button className="text-orange-500 hover:text-orange-600 flex items-center gap-2">
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.slice(0, 8).map((item) => (
              <a
                key={item.id}
                href={`/equipment/${item.id}`}
                className="bg-card rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-video">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-orange-500 text-white text-sm rounded-full">
                    {item.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold text-lg line-clamp-2">{item.title}</p>
                    <p className="text-white/80 text-sm">{item.location}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{item.rating}</span>
                        <span className="text-muted-foreground">
                          ({item.reviews} đánh giá)
                        </span>
                      </div>
                      <p className="font-semibold text-lg text-orange-500">
                        {formatPrice(item.price)}
                        <span className="text-sm text-muted-foreground">/ngày</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleViewDetails(item.id, e)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Thêm vào giỏ</span>
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Khách hàng nói gì về chúng tôi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 py-12 border-t">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">10,000+</div>
            <div className="text-gray-600">Thiết bị cho thuê</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">5,000+</div>
            <div className="text-gray-600">Khách hàng hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">50+</div>
            <div className="text-gray-600">Thành phố</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">4.8/5</div>
            <div className="text-gray-600">Đánh giá trung bình</div>
          </div>
        </div>
      </div>

      <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
}