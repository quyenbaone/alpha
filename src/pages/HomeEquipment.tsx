import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Music, Umbrella, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Equipment } from '../lib/types';
import { EquipmentCard } from '../components/EquipmentCard';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { EquipmentFilters } from '../components/EquipmentFilters';

type EquipmentRow = Database['public']['Tables']['equipment']['Row'];
type EquipmentWithCategory = EquipmentRow & { category: { id: string; name: string } };

const ITEMS_PER_PAGE = 8;

const CATEGORIES = [
  { value: 'all', label: 'Tất cả danh mục' },
  { value: 'Máy ảnh', label: 'Máy ảnh' },
  { value: 'Loa', label: 'Loa' },
  { value: 'Dụng cụ cắm trại', label: 'Dụng cụ cắm trại' },
  { value: 'Sub', label: 'Sub' },
];

export function HomeEquipment() {
  const { user } = useAuthStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [topRentedProducts, setTopRentedProducts] = useState<Equipment[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriceMin, setFilterPriceMin] = useState(0);
  const [filterPriceMax, setFilterPriceMax] = useState(10000000);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEquipment();
    fetchTopRentedProducts();
  }, []);

  // Khi filter hoặc trang thay đổi thì cuộn lên đầu
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filterCategory, filterPriceMin, filterPriceMax, ratingFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset trang khi filter thay đổi
  }, [filterCategory, filterPriceMin, filterPriceMax, ratingFilter]);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*, category:category_id(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedData: Equipment[] = (data as unknown as EquipmentWithCategory[]).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price_per_day: item.price_per_day,
          category_id: item.category_id,
          category: item.category,
          owner_id: item.owner_id,
          images: item.images || [],
          image: item.image,
          rating: Math.floor(Math.random() * 5) + 1,
          reviews: Math.floor(Math.random() * 50),
          location: '',
          status: item.status as 'available' | 'unavailable',
          quantity: 0,
          created_at: item.created_at,
          updated_at: item.created_at,
        }));
        setEquipment(transformedData);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchTopRentedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*, category:category_id(*)')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      if (data) {
        const transformedData: Equipment[] = (data as unknown as EquipmentWithCategory[]).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price_per_day: item.price_per_day,
          category_id: item.category_id,
          category: item.category,
          owner_id: item.owner_id,
          images: item.images || [],
          image: item.image,
          rating: Math.floor(Math.random() * 5) + 1,
          reviews: Math.floor(Math.random() * 50),
          location: '',
          status: item.status as 'available' | 'unavailable',
          quantity: 0,
          created_at: item.created_at,
          updated_at: item.created_at,
        }));
        setTopRentedProducts(transformedData);
      }
    } catch (error) {
      console.error('Error fetching top rented products:', error);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    if (filterCategory !== 'all' && item.category?.name !== filterCategory) return false;
    if (filterPriceMin > 0 && item.price_per_day < filterPriceMin) return false;
    if (filterPriceMax > 0 && item.price_per_day > filterPriceMax) return false;
    if (ratingFilter > 0 && (!item.rating || item.rating < ratingFilter)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#116466] to-[#2C3531] text-white">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Thuê thiết bị chuyên nghiệp</h1>
            <p className="text-xl mb-10 opacity-90">Đa dạng thiết bị. Giá cả hợp lý. Giao nhận nhanh chóng.</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-[#116466] font-semibold rounded-xl shadow-md hover:bg-gray-100 transition duration-300"
              >
                Xem thiết bị
              </button>
              {!user && (
                <Link
                  to="/signin"
                  className="px-8 py-4 border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-[#116466] transition duration-300"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Top Rented Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#116466] text-center mb-12">Sản phẩm thuê nhiều nhất</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {topRentedProducts.map(product => (
              <EquipmentCard key={product.id} item={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#F5F7F8]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#116466] text-center mb-12">Danh mục thiết bị</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {[
              { key: 'Máy ảnh', icon: Camera, title: 'Máy ảnh', desc: 'Thiết bị chụp ảnh chuyên nghiệp' },
              { key: 'Loa', icon: Music, title: 'Loa', desc: 'Thiết bị âm thanh chất lượng cao' },
              { key: 'Dụng cụ cắm trại', icon: Umbrella, title: 'Dụng cụ cắm trại', desc: 'Thiết bị cắm trại chất lượng' },
              { key: 'Sub', icon: Music, title: 'Sub', desc: 'Thiết bị âm thanh chuyên dụng' },
            ].map(({ key, icon: Icon, title, desc }) => (
              <div
                key={key}
                onClick={() => {
                  setFilterCategory(key);
                  contentRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`
                  group cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300
                  hover:shadow-xl hover:scale-[1.05]
                  ${filterCategory === key ? 'border-[#116466] bg-[#E6F2F1]' : 'border-[#D9E6E2] bg-white hover:border-[#116466]'}
                  flex flex-col items-center text-center
                `}
              >
                <div className={`
                  mb-5 rounded-full p-5 flex items-center justify-center transition-all duration-300
                  ${filterCategory === key ? 'bg-[#116466] shadow-lg' : 'bg-[#E6F2F1] group-hover:bg-[#116466]'}
                  group-hover:scale-110
                `}>
                  <Icon className={`
                    h-10 w-10 transition-colors duration-300
                    ${filterCategory === key ? 'text-white' : 'text-[#116466] group-hover:text-white'}
                  `} />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-[#116466]">{title}</h3>
                <p className="text-gray-600 text-base max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment List */}
      <section ref={contentRef} className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#116466] mb-8 text-center">Tất cả thiết bị</h2>

          {/* Filter */}
          <EquipmentFilters
            categories={CATEGORIES}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterPriceMin={filterPriceMin}
            filterPriceMax={filterPriceMax}
            setFilterPriceMin={setFilterPriceMin}
            setFilterPriceMax={setFilterPriceMax}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
          />

          {/* Grid sản phẩm với hiệu ứng hover và animation fade-in */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mb-12">
            {paginatedEquipment.map((item, idx) => (
              <div
                key={item.id}
                className="transform transition duration-500 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:bg-[#E6F2F1] rounded-xl"
                style={{ animation: `fadeInUp 0.5s ease forwards`, animationDelay: `${idx * 0.1}s`, opacity: 0 }}
              >
                <EquipmentCard item={item} />
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border-2 border-[#116466] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#116466] hover:text-white transition-colors transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116466]"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl border-2 border-[#116466] font-semibold transition-colors transform
                    ${
                      currentPage === page
                        ? 'bg-[#116466] text-white shadow-lg scale-110'
                        : 'hover:bg-[#116466] hover:text-white hover:scale-110'
                    }
                  `}
                  aria-current={currentPage === page ? 'page' : undefined}
                  aria-label={`Trang ${page}`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border-2 border-[#116466] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#116466] hover:text-white transition-colors transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116466]"
                aria-label="Trang tiếp theo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Animation keyframes */}
        <style>
          {`
            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(15px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </section>
    </div>
  );
}

export default HomeEquipment;
