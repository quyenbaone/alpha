import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';
import { Equipment } from '../lib/types';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';

interface EquipmentCardProps {
  item: Equipment;
}

export function EquipmentCard({ item }: EquipmentCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    addToCart({
      id: item.id,
      title: item.title,
      price: item.price_per_day,
      image: item.images?.[0] || '/placeholder.png',
      startDate: today,
      endDate: tomorrow,
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  return (
    <Link to={`/equipment/${item.id}`} className="block w-[300px] relative group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-[420px] flex flex-col transition-transform hover:scale-[1.03] hover:shadow-lg duration-300 relative">
        
        {/* Ảnh sản phẩm */}
        <div className="relative h-[220px] rounded-t-xl overflow-hidden">
          <img
            src={item.images?.[0] || '/placeholder.png'}
            alt={item.title}
            className="object-cover w-full h-full"
          />
  
          {/* Icon nhóm nút ẩn mặc định, hiện khi hover */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/equipment/${item.id}`;
              }}
              aria-label="Xem nhanh"
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
              title="Xem nhanh"
            >
              <Eye className="w-6 h-6 text-[#116466]" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart(e);
              }}
              aria-label="Thêm vào giỏ"
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
              title="Thêm vào giỏ"
            >
              <ShoppingCart className="w-6 h-6 text-[#116466]" />
            </button>
          </div>
        </div>
  
        {/* Nội dung */}
        <div className="p-6 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-[#116466] font-semibold text-lg mb-3 line-clamp-2 h-[56px] justify-between">
              {item.title}
            </h3>
            <p className="text-gray-500 mb-6 capitalize h-[28px] justify-between">
              {item.category?.name || 'Chưa có danh mục'}
            </p>
          </div>
          
          <div className="flex items-center justify-between h-[36px]">
            {/* Đánh giá */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < (item.rating || 0) ? 'text-[#FFBC42]' : 'text-gray-300'}`}
                  fill={i < (item.rating || 0) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              <span className="text-gray-400 ml-1 text-sm">({item.reviews || 0})</span>
            </div>
  
            {/* Giá */}
            <div className="text-[#116466] font-bold text-lg whitespace-nowrap">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price_per_day)}
              <span className="text-sm font-normal ml-1">/ngày</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
  
}  