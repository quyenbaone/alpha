import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { Equipment } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';

interface EquipmentCardProps {
  item: Equipment;
}

export function EquipmentCard({ item }: EquipmentCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking cart button
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    addItem({
      equipment: item,
      quantity: 1,
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0],
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking like button
    setIsLiked(!isLiked);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    navigate(`/equipment/${item.id}`);
  };

  return (
    <Link 
      to={`/equipment/${item.id}`}
      className="block group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button 
            onClick={handleLike}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300"
          >
            <Heart 
              className={`h-5 w-5 transition-colors duration-300 ${
                isLiked ? 'text-red-500 fill-current' : 'text-gray-600'
              }`} 
            />
          </button>
          <button
            onClick={handleViewDetails}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300"
          >
            <Eye className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300"
          >
            <ShoppingCart className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="absolute top-2 left-2 px-3 py-1 bg-orange-500 text-white text-xs rounded-full transform -rotate-2 hover:rotate-0 transition-transform duration-300">
          {item.category}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-500 transition-colors duration-300">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {item.location}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star 
                key={index}
                className={`h-4 w-4 ${
                  index < Math.floor(item.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                } transform group-hover:scale-110 transition-transform duration-300 hover:rotate-12`}
              />
            ))}
          </div>
          <span className="text-sm">{item.rating}</span>
          <span className="text-gray-500 text-sm">({item.reviews} đánh giá)</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold text-orange-500 group-hover:scale-105 transform transition-transform duration-300">
            {formatPrice(item.price)}
            <span className="text-sm text-gray-500">/ngày</span>
          </p>
          <button
            onClick={handleViewDetails}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 hover:bg-orange-600 active:scale-95"
          >
            Thuê ngay
          </button>
        </div>
      </div>
    </Link>
  );
}