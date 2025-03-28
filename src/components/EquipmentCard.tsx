import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Equipment } from '../store/equipmentStore';

interface EquipmentCardProps {
  item: Equipment;
}

export function EquipmentCard({ item }: EquipmentCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  // Format price to Vietnamese currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full hover:bg-gray-100 transform hover:scale-110 transition-all duration-300 z-10"
        >
          <Heart 
            className={`h-5 w-5 transition-colors duration-300 ${
              isLiked ? 'text-red-500 fill-current' : 'text-gray-600'
            }`} 
          />
        </button>
        <div className="absolute top-2 left-2 px-3 py-1 bg-orange-500 text-white text-xs rounded-full transform -rotate-2 hover:rotate-0 transition-transform duration-300">
          {item.category}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <Link to={`/equipment/${item.id}`}>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-500 transition-colors duration-300">
            {item.title}
          </h3>
        </Link>
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
          <Link
            to={`/equipment/${item.id}`}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 hover:bg-orange-600 active:scale-95"
          >
            Thuê ngay
          </Link>
        </div>
      </div>
    </div>
  );
}